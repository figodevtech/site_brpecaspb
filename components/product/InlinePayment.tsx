"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function InlinePayment({ orderId }: { orderId: number }) {
  const [data, setData] = useState<{ pix?: { encodedImage: string; payload: string; expirationDate: string }; boleto?: { line: string; url: string | null }; dueDate?: string } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(`/api/checkout/payment-details?orderId=${orderId}`, { credentials: "include", cache: "no-store", headers: session.session?.access_token ? { Authorization: `Bearer ${session.session.access_token}` } : {} });
      if (!response.ok) throw new Error();
      setData(await response.json());
    } catch { setError(true); } finally { setLoading(false); }
  }, [orderId]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); toast.success("Código copiado."); }
    catch { toast.error("Selecione o código e copie manualmente."); }
  };
  if (loading) return <p role="status" className="text-xs">Carregando dados do pagamento...</p>;
  if (error) return <div role="status" className="space-y-3 text-xs"><p>Não foi possível carregar os dados. Tente novamente; seu pedido já foi criado.</p><Button variant="outline" onClick={() => void load()}>Carregar pagamento</Button></div>;
  return <div className="space-y-4 text-left min-w-0">
    {data?.pix && <>
      <Image src={`data:image/png;base64,${data.pix.encodedImage}`} alt="QR Code para pagamento Pix do pedido" width={240} height={240} unoptimized className="mx-auto rounded-lg bg-white p-3 max-w-full" />
      <Label htmlFor="pix-code">Pix copia e cola</Label><Input id="pix-code" readOnly value={data.pix.payload} onFocus={event => event.target.select()} />
      <Button className="w-full" onClick={() => void copy(data.pix!.payload)}>Copiar código Pix</Button>
      <p className="text-xs text-muted-foreground">Pague no aplicativo do seu banco. A confirmação aparecerá aqui automaticamente.</p>
    </>}
    {data?.boleto && <>
      <Label htmlFor="boleto-line">Linha digitável do boleto</Label><Input id="boleto-line" readOnly value={data.boleto.line} onFocus={event => event.target.select()} />
      <Button className="w-full" onClick={() => void copy(data.boleto!.line)}>Copiar linha digitável</Button>
      <p className="text-xs text-muted-foreground">Vencimento: {data.dueDate?.split("-").reverse().join("/")}. A compensação pode levar até 3 dias úteis.</p>
      {data.boleto.url && <Button asChild variant="outline" className="w-full"><a href={data.boleto.url} referrerPolicy="no-referrer">Ver boleto para impressão</a></Button>}
    </>}
  </div>;
}
