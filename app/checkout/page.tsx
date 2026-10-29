"use client";
import { CheckoutTerms,useCheckoutTerms } from '@/components/product/CheckoutTerms';
import { ShippingChoices,useShippingQuote } from '@/components/product/ShippingSimulator';

import {checkoutAttempt,forgetCheckoutAttempt} from '@/lib/checkout-attempt-client';

import { CheckoutCardFields } from "@/components/product/CheckoutCardFields";
import { InlinePayment } from "@/components/product/InlinePayment";
import { emptyCheckoutCard, parseCheckoutCard } from "@/lib/checkout-card";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthContext";
import { useCart } from "@/components/providers/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  MapPin,
  Plus,
  Truck,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowLeft,
  Store,
  QrCode,
  CreditCard,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isOrderPaid } from "@/lib/order-status";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { isPickupEligible, type DeliveryMethod } from "@/lib/shipping";
import { siteConfig } from "@/lib/site-config";
import { motion } from "motion/react";
import { useVirtualKeyboardOpen } from "@/hooks/use-virtual-keyboard";
import { cepDigits, formatCep, mobileInput } from "@/lib/forms/mobile-inputs";
import { haptic } from "@/lib/haptics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  PAYMENT_METHOD_LABELS,
  type AsaasBillingType,
} from "@/lib/payment-methods";

const PAYMENT_OPTIONS: Array<{
  value: AsaasBillingType | "DEBIT_CARD";
  description: string;
  detail: string;
  icon: typeof QrCode;
  badge?: string;
}> = [
  {
    value: "PIX",
    description: "Aprova\u00e7\u00e3o em poucos segundos",
    detail: "Pague pelo aplicativo do seu banco.",
    icon: QrCode,
    badge: "Mais r\u00e1pido",
  },
  {
    value: "CREDIT_CARD",
    description: "Pagamento protegido pelo Asaas",
    detail: "Informe os dados do cart\u00e3o aqui na loja.",
    icon: CreditCard,
  },
  {value:'DEBIT_CARD',description:'Pagamento à vista no débito',detail:'Continue na página segura do Asaas, nesta mesma aba.',icon:CreditCard},
];

interface CustomerAddress {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
}

interface SavedCard {
  id: string;
  brand: string;
  lastFour: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  // Endereço
  const [choosingAddress,setChoosingAddress]=useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  // Pedido e Frete
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");

  // Pagamento
  const [card, setCard] = useState({ ...emptyCheckoutCard });
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">("pending");
  const [paymentMethod, setPaymentMethod] = useState<AsaasBillingType | "DEBIT_CARD" | "">("");
  const shippingQuote=useShippingQuote(addresses.find(a=>a.id===selectedAddressId)?.cep||'',items.map(it=>({productId:Number(it.product.id),quantity:it.quantity})),deliveryMethod==='delivery'&&!isWaitingPayment);
  const shippingPrice=deliveryMethod==='delivery'?(shippingQuote.option?.price||0):0;
  const shippingReady=deliveryMethod==='pickup'||Boolean(shippingQuote.option)||shippingQuote.result?.manual===true;
  const terms=useCheckoutTerms(items.map(it=>({productId:Number(it.product.id),total:it.product.price*it.quantity})),shippingPrice);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [cardsError, setCardsError] = useState(false);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState("new");
  const clearedRef = useRef(false);
  const numeroInputRef = useRef<HTMLInputElement>(null);
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  const isKeyboardOpen = useVirtualKeyboardOpen();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const fetchAddresses = useCallback(async () => {
    if (!profile?.id) return;
    setLoadingAddresses(true);
    try {
      const { data, error } = await supabase
        .from("cliente_endereco")
        .select("*")
        .eq("cliente_id", profile.id)
        .order("id", { ascending: true });

      if (error) throw error;
      const nextAddresses = (data || []) as CustomerAddress[];
      setAddresses(nextAddresses);
      if (nextAddresses.length > 0) {
        setSelectedAddressId((current) => current ?? nextAddresses[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar endereços.");
    } finally {
      setLoadingAddresses(false);
    }
  }, [profile]);

  const fetchSavedCards = useCallback(async () => {
    if (!user?.id) return;
    setLoadingCards(true);
    setCardsError(false);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch("/api/account/cards", {
        cache: "no-store",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Falha ao carregar cartões.");
      const cards = (result.cards || []) as SavedCard[];
      setSavedCards(cards);
      const preferred = cards.find((card) => card.isDefault) || cards[0];
      setSelectedSavedCardId(preferred?.id || "new");
    } catch {
      setCardsError(true);
      setSavedCards([]);
      setSelectedSavedCardId("new");
    } finally {
      setLoadingCards(false);
    }
  }, [user?.id]);

  // Autenticação inicial
  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      router.replace("/login?redirect=/checkout");
      return;
    }
    if (profile?.id) {
      const timer = window.setTimeout(() => { void fetchAddresses(); void fetchSavedCards(); }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [user?.id, profile?.id, authLoading, router, fetchAddresses, fetchSavedCards]);

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;
  const pickupEligible = selectedAddress
    ? isPickupEligible({ city: selectedAddress.cidade, state: selectedAddress.estado })
    : false;

  const selectAddress = (address: CustomerAddress) => {
    if (address.id !== selectedAddressId) haptic("selection");
    setSelectedAddressId(address.id);
    if (!isPickupEligible({ city: address.cidade, state: address.estado })) {
      setDeliveryMethod("delivery");
    }
  };

  // Preenche o endereço assim que o CEP tem 8 dígitos e leva o foco para o "Número"
  // (único campo que o cliente ainda precisa digitar na maioria dos casos).
  const lookupCep = async (cleanCep: string) => {
    if (cleanCep.length !== 8) return;
    setIsLookingUpCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setLogradouro(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
        if (data.logradouro) numeroInputRef.current?.focus();
      } else {
        toast.warning("CEP não encontrado. Preencha o endereço manualmente.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    } finally {
      setIsLookingUpCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    if (cepDigits(formatted).length === 8 && cepDigits(cep).length !== 8) void lookupCep(cepDigits(formatted));
  };

  const handleSaveAddress = async () => {
    if (!profile) { toast.warning("Faça login para cadastrar um endereço."); return; }
    if (!cep || !logradouro || !numero || !bairro || !cidade || !estado) {
      toast.warning("Preencha todos os campos obrigatórios do endereço.");
      return;
    }

    setSavingAddress(true);
    try {
      const addressData = {
        cliente_id: profile.id,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      };

      const { data, error } = await supabase
        .from("cliente_endereco")
        .insert(addressData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Endereço adicionado com sucesso!");
      setIsAddressDialogOpen(false);
      await fetchAddresses();
      setSelectedAddressId(data.id);

      setCep("");
      setLogradouro("");
      setNumero("");
      setComplemento("");
      setBairro("");
      setCidade("");
      setEstado("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar endereço.");
    } finally {
      setSavingAddress(false);
    }
  };

  const checkOrderStatus = useCallback(async () => {
    if (!currentOrderId) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (sessionData?.session?.access_token) {
        headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
      }

      const res = await fetch(`/api/pedidos/status?orderId=${encodeURIComponent(currentOrderId)}`, {
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isCancelled) {
          if(user?.id) forgetCheckoutAttempt(user.id);
          setIsWaitingPayment(false);
          setCurrentOrderId(null);
          toast.info('O pagamento foi encerrado. Revise o carrinho antes de tentar novamente.');
          return;
        }
        if (data.isPaid) {
          setPaymentStatus("paid");
          if (!clearedRef.current) {
            clearedRef.current = true;
            if(user?.id) forgetCheckoutAttempt(user.id);
            clearCart();
          }
        }
      }
    } catch (err) {
      console.error("Polling order error:", err);
    }
  }, [currentOrderId, clearCart, user]);

  // Tempo real via Supabase
  useEffect(() => {
    if (!currentOrderId || !isWaitingPayment || paymentStatus === "paid") return;
    const channel = supabase
      .channel(`order_status_${currentOrderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "venda", filter: `id=eq.${currentOrderId}` },
        (payload) => {
          const newStatus = payload.new.status?.toUpperCase();
          if (isOrderPaid(newStatus)) {
            setPaymentStatus("paid");
            if (!clearedRef.current) {
              clearedRef.current = true;
              if(user?.id) forgetCheckoutAttempt(user.id);
            clearCart();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentOrderId, isWaitingPayment, paymentStatus, clearCart, user]);

  // Mensagem enviada pelo popup com validação estrita de origem (Regra 14)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof window !== "undefined" && event.origin !== window.location.origin) {
        return;
      }
      if (event.data === "order_paid") {
        // Dispara re-consulta oficial ao backend em vez de confiar cegamente na mensagem do popup
        checkOrderStatus();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [checkOrderStatus]);

  // Polling automático
  useEffect(() => {
    if (!isWaitingPayment || !currentOrderId || paymentStatus === "paid") return;
    const id = setInterval(() => {
      checkOrderStatus();
    }, 4000);
    return () => clearInterval(id);
  }, [isWaitingPayment, currentOrderId, paymentStatus, checkOrderStatus]);

  const handleCheckout = async () => {
    if(!shippingReady){toast.error('Selecione um serviço de entrega após calcular o frete.');return;}
    if(paymentMethod==='CREDIT_CARD'&&!terms.quote){toast.error('Atualize as condições do cartão antes de pagar.');return;}
    if (!paymentMethod) {
      toast.error("Selecione uma forma de pagamento.");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Selecione um endereço de entrega.");
      return;
    }

    if (items.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    const useSavedCard = paymentMethod === "CREDIT_CARD" && selectedSavedCardId !== "new";
    setIsProcessing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // Envia somente addressId e lista sanitizada de IDs e quantidades (Regra 1)
      const checkoutData = {
        addressId: selectedAddressId,
        deliveryMethod,
        billingType: paymentMethod,
        installmentCount:paymentMethod==='CREDIT_CARD'?terms.count:1,
        expectedTotal:paymentMethod==='CREDIT_CARD'?(terms.quote?.total??subtotal+shippingPrice):subtotal+shippingPrice,
        shippingServiceId:deliveryMethod==='delivery'?shippingQuote.option?.id:undefined,
        expectedShipping:deliveryMethod==='delivery'?shippingQuote.option?.price:undefined,
        saveCard:paymentMethod==='CREDIT_CARD'&&!useSavedCard&&terms.saveCard,
        transparent: paymentMethod!=='DEBIT_CARD',
        card: paymentMethod === "CREDIT_CARD" && !useSavedCard ? card : undefined,
        savedCardId: useSavedCard ? selectedSavedCardId : undefined,
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        })),
      };

      let attemptId=checkoutAttempt(sessionData?.session?.user?.id || 'anonymous',checkoutData);
      const existing=await fetch('/api/checkout/attempt?id='+encodeURIComponent(attemptId),{credentials:'include',cache:'no-store',headers:token?{Authorization:'Bearer '+token}:{}});
      const existingResult=await existing.clone().json().catch(()=>null);
      if(existingResult?.retryable){forgetCheckoutAttempt(sessionData?.session?.user?.id || 'anonymous');attemptId=checkoutAttempt(sessionData?.session?.user?.id || 'anonymous',checkoutData);}
      if(!existing.ok && ![404,409].includes(existing.status))throw new Error(existingResult?.message||'Não foi possível consultar a tentativa de pagamento.');
      if(!existing.ok && paymentMethod === 'CREDIT_CARD' && !useSavedCard && !parseCheckoutCard(card)){toast.error('Confira os dados do cartão e sua validade.');return;}
      const response = existing.ok ? existing : await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({...checkoutData,checkoutAttemptId:attemptId}),
      });

      const result = await response.json();
      if (!response.ok) {
        if(response.status===409){shippingQuote.refresh();terms.refresh();}
        if (result.retryable) forgetCheckoutAttempt(sessionData?.session?.user?.id || 'anonymous');
        throw new Error(result.message || result.error || "Erro ao processar checkout");
      }

      if(result.cardSaveRequested&&!result.cardSaved)toast.warning('Pagamento iniciado, mas não foi possível salvar o cartão.');
      if(paymentMethod==='DEBIT_CARD'&&result.url){window.location.assign(result.url);return;}
      if (result.url || result.directPayment) {
        setCard({ ...emptyCheckoutCard });
        setIsWaitingPayment(true);
        if (result.orderId) {
          setCurrentOrderId(result.orderId);
        }
      } else {
        throw new Error("URL de pagamento não retornada.");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao processar o pagamento.");
    } finally {
      setCard(current => ({ ...current, ccv: "" }));
      setIsProcessing(false);
    }
  };

  const finalTotal = paymentMethod==='CREDIT_CARD' ? (terms.quote?.total??subtotal+shippingPrice) : subtotal+shippingPrice;
  const freightLabel=deliveryMethod==='pickup'?'Retirada grátis':shippingQuote.option?shippingQuote.option.price===0?'Grátis':formatCurrency(shippingPrice):!selectedAddressId?'Selecione o endereço':shippingQuote.busy?'Calculando...':shippingQuote.error?'Cotação indisponível':shippingQuote.result?.manual?'A combinar com a loja':'Selecione o envio';
  const totalLabel=deliveryMethod==='pickup'?'Total · retirada grátis':shippingQuote.option?shippingPrice===0?'Total · frete grátis':'Total com frete':shippingQuote.result?.manual?'Total · frete a combinar':'Subtotal · frete pendente';
  const canPay = shippingReady && (paymentMethod!=='CREDIT_CARD'||Boolean(terms.quote)) && Boolean(paymentMethod) && !isProcessing && !isWaitingPayment && Boolean(selectedAddressId) && items.length > 0;
  const selectedPaymentOption =
    PAYMENT_OPTIONS.find((option) => option.value === paymentMethod);

  // Tela de Pagamento Aprovado
  if (paymentStatus === "paid") {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          onAnimationStart={() => haptic("success")}
          className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-6 text-emerald-600"
        >
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
          Pagamento Confirmado!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mb-8">
          Seu pedido #{currentOrderId} foi recebido com sucesso e já está sendo preparado pela equipe da BR Peças PB.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" className="h-12 rounded-xl font-semibold">
            <Link href="/pedidos">Acompanhar meu pedido</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-xl">
            <Link href="/">Voltar à página inicial</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-36 pt-3 lg:pb-12">
      <header className="mb-3 flex min-h-10 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="size-9 shrink-0 rounded-xl bg-muted text-muted-foreground">
            <Link href="/carrinho" aria-label="Voltar ao carrinho">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="flex items-center gap-1.5 text-base font-extrabold text-foreground sm:text-xl">
              <Lock className="size-4 shrink-0 text-primary" aria-hidden="true" />
              Checkout Seguro
            </h1>
            <p className="text-[11px] text-muted-foreground">BR Peças PB · Asaas</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-600/20 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Ambiente criptografado</span>
          <span className="sm:hidden">Seguro</span>
        </span>
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
        {/* Lado Esquerdo: Endereço & Pagamento */}
        <div className="min-w-0 divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/80 bg-card lg:col-span-8">
          {/* 1. Endereço de Entrega */}
          <div className="min-w-0 space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground">
                  1
                </div>
                <h2 className="font-extrabold text-base text-foreground">Endereço</h2>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddressDialogOpen(true)}
                className="h-8 gap-1 rounded-lg border-border/70 px-2.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo</span>
              </Button>
            </div>

            {loadingAddresses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true" aria-label="Carregando endereços">
                {[0, 1].map((index) => (
                  <div key={index} className="space-y-2 rounded-xl border-2 border-border/60 p-4">
                    <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                    <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                    <div className="skeleton-shimmer h-3 w-1/3 rounded" />
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-border text-xs space-y-3">
                <MapPin className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-muted-foreground">Você ainda não tem nenhum endereço cadastrado.</p>
                <Button
                  size="sm"
                  onClick={() => setIsAddressDialogOpen(true)}
                  className="rounded-lg text-xs"
                >
                  Cadastrar Endereço de Entrega
                </Button>
              </div>
            ) : (
              <Collapsible open={choosingAddress} onOpenChange={setChoosingAddress} className="space-y-3">
                {selectedAddress&&<div className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground"/><div className="min-w-0 flex-1 space-y-1"><p className="break-words text-sm font-medium">{selectedAddress.logradouro}, {selectedAddress.numero}</p>{selectedAddress.complemento&&<p className="text-xs text-muted-foreground">{selectedAddress.complemento}</p>}<p className="text-xs leading-relaxed text-muted-foreground">{selectedAddress.bairro} · {selectedAddress.cidade} / {selectedAddress.estado}<br/>CEP {formatCep(selectedAddress.cep)}</p></div><CollapsibleTrigger asChild><Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs" disabled={isProcessing||isWaitingPayment}>{choosingAddress?'Fechar':'Alterar'}</Button></CollapsibleTrigger></div>}
                <CollapsibleContent className="grid gap-2 pt-1 sm:grid-cols-2">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <Button variant="ghost" size="sm"
                      type="button"
                      key={addr.id}
                      onClick={() => {selectAddress(addr);setChoosingAddress(false);}}
                      aria-pressed={isSelected}
                      className={`h-auto min-h-20 block whitespace-normal w-full text-left p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer text-xs relative active:scale-[0.99] ${
                        isSelected
                          ? "border-primary/70 bg-primary/5 shadow-2xs"
                          : "border-border/80 hover:border-slate-400 bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-foreground text-sm font-bold block">
                          {addr.logradouro}, {addr.numero}
                        </strong>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      {addr.complemento && (
                        <span className="text-muted-foreground block mt-0.5">{addr.complemento}</span>
                      )}

                      <span className="text-muted-foreground block mt-1">
                        {addr.bairro} • {addr.cidade} - {addr.estado}
                      </span>
                      <span className="font-mono text-slate-500 block mt-0.5">CEP: {addr.cep}</span>
                    </Button>
                  );
                })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* 2. Forma de recebimento */}
          <div className="min-w-0 space-y-4 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground">2</div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Entrega</h2>

              </div>
            </div>

            <RadioGroup value={deliveryMethod} onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)} className="grid gap-3 sm:grid-cols-2">
              <Label htmlFor="delivery-method" className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${deliveryMethod === "delivery" ? "border-primary/70 bg-primary/5" : "border-border/80 hover:border-primary/40"}`}>
                <RadioGroupItem id="delivery-method" value="delivery" className="mt-0.5" />
                <span className="grid min-w-0 gap-1">
                  <span className="flex items-center gap-2 text-sm font-bold"><Truck className="size-4 text-primary" /> Receber no endereço</span>
                  <span className="text-xs font-normal leading-relaxed text-muted-foreground">Opções e valores abaixo.</span>
                </span>
              </Label>

              <Label htmlFor="pickup-method" className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${pickupEligible ? "cursor-pointer" : "cursor-not-allowed opacity-55"} ${deliveryMethod === "pickup" ? "border-primary/70 bg-primary/5" : "border-border/80"}`}>
                <RadioGroupItem id="pickup-method" value="pickup" disabled={!pickupEligible} className="mt-0.5" />
                <span className="grid min-w-0 gap-1">
                  <span className="flex items-center gap-2 text-sm font-bold"><Store className="size-4 text-primary" /> Retirar na loja</span>
                  <span className="text-xs font-normal leading-relaxed text-muted-foreground">Sem custo de entrega.</span>
                </span>
              </Label>
            </RadioGroup>

            {deliveryMethod==='pickup'&&<p className="text-xs leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">Retirada:</span> {siteConfig.address.full}. Aguarde a confirmação de que o pedido está pronto.</p>}
            {!pickupEligible&&<p className="text-xs text-muted-foreground">Retirada indisponível para este endereço.</p>}
            {deliveryMethod==='delivery'&&!isWaitingPayment&&selectedAddress&&<section className="border-t border-border/70 pt-3" aria-label="Frete para o endereço selecionado"><ShippingChoices quote={shippingQuote} disabled={isProcessing} compact/></section>}
          </div>

          {/* 3. Forma de pagamento */}
          <div className="min-w-0 space-y-4 p-4 sm:p-6">
            <div className="flex items-start gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground">
                3
              </div>
              <div>
                <h2 className="font-extrabold text-base text-foreground">Forma de pagamento</h2>

              </div>
            </div>

            {isWaitingPayment ? (
              <div className="space-y-4 rounded-xl bg-primary/5 p-6 text-center shadow-sm ring-1 ring-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  Aguardando confirma&ccedil;&atilde;o por {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "pagamento"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {paymentMethod === "CREDIT_CARD"
                    ? "O Asaas está analisando o pagamento. Aguarde a confirmação nesta página."
                    : "Conclua o pagamento com os dados abaixo. A confirmação será atualizada automaticamente."}
                </p>
                {currentOrderId && paymentMethod !== "CREDIT_CARD" && <InlinePayment orderId={currentOrderId} />}
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={checkOrderStatus}
                    className="text-xs rounded-xl"
                  >
                    Já realizei o pagamento
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as AsaasBillingType | "DEBIT_CARD")}
                  className="grid gap-2 sm:grid-cols-3"
                >
                  {PAYMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const selected = paymentMethod === option.value;

                    return (
                      <Label
                        key={option.value}
                        htmlFor={`payment-${option.value}`}
                        className={`relative flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xl p-3 pr-8 ring-1 transition-all ${
                          selected
                            ? "bg-primary/5 ring-2 ring-primary"
                            : "bg-card ring-border/70 hover:ring-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center text-primary">
                            <Icon className="size-4" />
                          </span>
                          <RadioGroupItem
                            id={`payment-${option.value}`}
                            value={option.value}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            aria-label={PAYMENT_METHOD_LABELS[option.value]}
                          />
                        </div>
                        <span className="grid min-w-0 gap-1">
                          <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
                            {PAYMENT_METHOD_LABELS[option.value]}
                            {option.badge && (
                              <Badge className="border-0 bg-emerald-100 text-[10px] text-emerald-700 hover:bg-emerald-100">
                                <Zap className="size-3" />
                                {option.badge}
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs font-medium text-foreground/80">
                            {option.description}
                          </span>

                        </span>
                      </Label>
                    );
                  })}
                </RadioGroup>

                {paymentMethod === "CREDIT_CARD" && (
                  <div className="space-y-4 border-t border-border/70 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">Dados do cartão</p>

                      </div>
                      {savedCards.length>0&&<Button asChild variant="ghost" size="sm" className="h-8 text-xs"><Link href="/conta/cartoes">Gerenciar</Link></Button>}
                    </div>

                    {cardsError && <div role="status" className="text-xs text-muted-foreground space-y-2">
                      <p>Não foi possível consultar os cartões salvos. Você pode preencher outro cartão abaixo.</p>
                      <Button type="button" variant="outline" size="sm" onClick={() => void fetchSavedCards()}>Tentar novamente</Button>
                    </div>}

                    {loadingCards ? (
                      <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Carregando cartões...
                      </div>
                    ) : savedCards.length>0 ? (
                      <RadioGroup
                        value={selectedSavedCardId}
                        onValueChange={setSelectedSavedCardId}
                        className="grid gap-2"
                      >
                        {savedCards.map((card) => (
                          <Label
                            key={card.id}
                            htmlFor={`saved-card-${card.id}`}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3 shadow-sm ring-1 transition-all ${
                              selectedSavedCardId === card.id ? "ring-2 ring-primary" : "ring-border/70"
                            }`}
                          >
                            <RadioGroupItem id={`saved-card-${card.id}`} value={card.id} />
                            <CreditCard className="size-5 text-primary" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold">{card.brand} •••• {card.lastFour}</span>
                              <span className="block text-[11px] text-muted-foreground">
                                {card.holderName} · vence {card.expiryMonth}/{card.expiryYear.slice(-2)}
                              </span>
                            </span>
                            {card.isDefault && <Badge variant="secondary">Principal</Badge>}
                          </Label>
                        ))}
                        <Label
                          htmlFor="saved-card-new"
                          className={`flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3 shadow-sm ring-1 transition-all ${
                            selectedSavedCardId === "new" ? "ring-2 ring-primary" : "ring-border/70"
                          }`}
                        >
                          <RadioGroupItem id="saved-card-new" value="new" />
                          <Plus className="size-5 text-primary" />
                          <span>
                            <span className="block text-sm font-bold">Usar outro cartão</span>
                            <span className="block text-[11px] text-muted-foreground">Preencher aqui no site</span>
                          </span>
                        </Label>
                      </RadioGroup>
                    ) : null}
                    {!loadingCards&&selectedSavedCardId === "new" && <CheckoutCardFields value={card} onChange={setCard} disabled={isProcessing} saveCard={terms.saveCard} compact/>}
                    {!loadingCards&&<CheckoutTerms terms={terms} newCard={selectedSavedCardId==='new'} disabled={isProcessing} compact/>}
                  </div>
                )}






              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Resumo dos Itens e Valores */}
        <div className="min-w-0 lg:col-span-4">
          <div className="min-w-0 space-y-5 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:p-6 lg:sticky lg:top-32">
            <h2 className="font-extrabold text-base text-foreground">Seu pedido</h2>

            {/* Lista compacta de itens */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 no-scrollbar divide-y divide-border/50 text-xs">
              {items.map((item) => (
                <div key={item.product.id} className="pt-2 first:pt-0 flex justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-relaxed text-foreground line-clamp-2">
                      {item.product.name || item.product.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      Qtd: {item.quantity} × {formatCurrency(item.product.price)}
                    </span>
                  </div>
                  <span className="shrink-0 font-bold tabular-nums text-foreground">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="pt-4 border-t border-border/80 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal dos produtos</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span className="font-semibold text-primary">
                  {freightLabel}
                </span>
              </div>
              {paymentMethod==='CREDIT_CARD'&&Boolean(terms.quote?.interest)&&<div className="flex justify-between gap-3 text-muted-foreground"><span>Acréscimo do cartão</span><span className="shrink-0 font-semibold tabular-nums text-foreground">{formatCurrency(terms.quote?.interest||0)}</span></div>}
              <div className="flex justify-between items-baseline pt-3 border-t border-border/60 text-base">
                <span className="font-bold text-foreground">{shippingReady?"Total":"Subtotal"}</span>
                <span className="text-2xl font-bold tabular-nums text-foreground">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
            {!isWaitingPayment&&<div className="space-y-3">                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!canPay}
                  className="hidden w-full h-12 text-sm font-bold gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 lg:flex"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processando Pedido...
                    </>
                  ) : (
                    <span>{selectedPaymentOption ? `Pagar com ${PAYMENT_METHOD_LABELS[selectedPaymentOption.value]}` : "Escolha como pagar"}</span>
                  )}
                </Button><p className="hidden items-center justify-center gap-1.5 text-[11px] text-muted-foreground lg:flex"><Lock className="size-3"/>Pagamento protegido pelo Asaas</p></div>}
          </div>
        </div>
      </div>

      {/* Modal para Adicionar Novo Endereço */}
      {/* Barra de pagamento fixa (mobile/tablet): total + ação principal sempre ao alcance do polegar. */}
      {!isWaitingPayment && items.length > 0 && (
        <div
          inert={isKeyboardOpen}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] shadow-[0_-6px_20px_rgba(15,23,42,0.08)] transition-transform duration-200 ease-out lg:hidden dark:bg-slate-900 ${
            isKeyboardOpen ? "pointer-events-none translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-center gap-3">
            <div className="min-w-0">
              <span className="block text-[11px] text-muted-foreground">
                {totalLabel}
              </span>
              <span className="block text-lg font-extrabold tabular-nums text-foreground">{formatCurrency(finalTotal)}</span>
            </div>
            <Button
              size="lg"
              onClick={() => {
                if (!selectedAddressId) {
                  haptic("error");
                  toast.error("Selecione ou cadastre um endereço de entrega.");
                  return;
                }
                haptic("medium");
                void handleCheckout();
              }}
              disabled={!canPay}
              className="h-auto min-h-12 min-w-0 gap-2 whitespace-normal rounded-xl px-3 py-2 text-xs font-bold shadow-md shadow-primary/25 sm:px-5 sm:text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  {selectedPaymentOption ? `Pagar com ${PAYMENT_METHOD_LABELS[selectedPaymentOption.value]}` : "Escolha como pagar"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent mobileSheet className="sm:max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Novo Endereço de Entrega</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <Label className="text-xs">CEP*</Label>
              <div className="relative">
                <Input
                  {...mobileInput.cep}
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="h-11 text-sm font-mono tracking-wide"
                />
                {isLookingUpCep && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" aria-label="Buscando endereço" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label className="text-xs">Logradouro / Rua*</Label>
                <Input
                  {...mobileInput.street}
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className="h-11 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Número*</Label>
                <Input
                  ref={numeroInputRef}
                  {...mobileInput.number}
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="h-11 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Complemento</Label>
              <Input
                {...mobileInput.complement}
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Ex: Galpão 3, Apto 101"
                className="h-11 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">Bairro*</Label>
                <Input
                  {...mobileInput.district}
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="h-11 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Cidade*</Label>
                <Input
                  {...mobileInput.city}
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="h-11 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Estado (UF)*</Label>
                <Input
                  {...mobileInput.state}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  className="h-11 text-sm uppercase"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddressDialogOpen(false)}
              className="h-11 text-sm rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveAddress}
              disabled={savingAddress}
              className="h-12 text-sm rounded-xl font-semibold sm:h-11"
            >
              {savingAddress ? "Salvando..." : "Salvar Endereço"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

