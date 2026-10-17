import "server-only";

const rawApiKey = process.env.ASAAS_API_KEY || "";
const apiKey = rawApiKey.trim().replace(/^["']|["']$/g, "");
const environment = (process.env.ASAAS_ENVIRONMENT || "sandbox").trim().toLowerCase();
const configuredApiUrl = (process.env.ASAAS_API_URL || "").trim().replace(/\/+$/, "");

export const asaasApiUrl =
  configuredApiUrl ||
  (environment === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3");

export interface AsaasCustomer {
  id: string;
  name?: string;
  cpfCnpj?: string;
  email?: string;
  phone?: string;
  externalReference?: string;
}

export interface AsaasPayment {
  id: string;
  customer?: string;
  billingType?: string;
  status?: string;
  value?: number;
  netValue?: number;
  dueDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeUrl?: string;
  pixCopiaECola?: string;
  externalReference?: string;
}

export class AsaasApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AsaasApiError";
  }
}

export function isAsaasConfigured(): boolean {
  return Boolean(apiKey && apiKey.length > 10);
}

async function requestAsaas<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!apiKey) {
    throw new AsaasApiError("Chave de API do Asaas não configurada.", 500);
  }

  const url = `${asaasApiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      payload?.errors?.[0]?.description ||
      payload?.message ||
      `Erro na comunicação com Asaas (Status ${response.status})`;
    throw new AsaasApiError(errorMsg, response.status, payload);
  }

  return payload as T;
}

export async function findOrCreateAsaasCustomer({
  name,
  cpfCnpj,
  email,
  phone,
}: {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  const cleanCpfCnpj = cpfCnpj.replace(/\D/g, "");

  // Buscar cliente existente por CPF/CNPJ
  const list = await requestAsaas<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(cleanCpfCnpj)}`
  );

  if (list?.data && list.data.length > 0) {
    return list.data[0];
  }

  // Criar novo cliente
  return requestAsaas<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name,
      cpfCnpj: cleanCpfCnpj,
      email,
      phone: phone ? phone.replace(/\D/g, "") : undefined,
      notificationDisabled: false,
    }),
  });
}

export async function createAsaasPayment({
  customer,
  billingType,
  value,
  dueDate,
  description,
  externalReference,
  creditCard,
  creditCardHolderInfo,
  installmentCount,
}: {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  value: number;
  dueDate: string;
  description: string;
  externalReference: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  installmentCount?: number;
}): Promise<AsaasPayment> {
  const body: any = {
    customer,
    billingType,
    value,
    dueDate,
    description,
    externalReference,
  };

  if (billingType === "CREDIT_CARD" && creditCard) {
    body.creditCard = creditCard;
    body.creditCardHolderInfo = creditCardHolderInfo;
    if (installmentCount && installmentCount > 1) {
      body.installmentCount = installmentCount;
      body.installmentValue = Number((value / installmentCount).toFixed(2));
    }
  }

  const payment = await requestAsaas<AsaasPayment>("/payments", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // Se for PIX, buscar o QRCode e Copia e Cola
  if (billingType === "PIX" && payment.id) {
    try {
      const pixData = await requestAsaas<{
        encodedImage: string;
        payload: string;
        expirationDate: string;
      }>(`/payments/${payment.id}/pixQrCode`);

      if (pixData) {
        payment.pixQrCodeUrl = `data:image/png;base64,${pixData.encodedImage}`;
        payment.pixCopiaECola = pixData.payload;
      }
    } catch (err) {
      console.warn("Não foi possível gerar payload imediato do PIX:", err);
    }
  }

  return payment;
}
