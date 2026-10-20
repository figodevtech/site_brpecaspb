"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthContext";
import { supabase } from "@/lib/supabase";

export function useWishlist() {
  const { profile, isLoading: authLoading } = useAuth();
  const [saved, setSaved] = useState<{ customerId: number | null; ids: number[] }>({ customerId: null, ids: [] });
  const [loadedCustomer, setLoadedCustomer] = useState<number | null>(null);
  const inFlight = useRef(new Set<number>());
  const customerId = profile?.id ?? null;
  const currentCustomer = useRef(customerId);
  useEffect(() => { currentCustomer.current = customerId; }, [customerId]);
  const router = useRouter();
  const favoriteIds = useMemo(() => saved.customerId === customerId ? saved.ids : [], [saved, customerId]);

  useEffect(() => {
    if (!customerId) return;
    let active = true;
    void supabase.from("favorito").select("produto_id").eq("cliente_id", customerId).then(({ data, error }) => {
      if (!active) return;
      if (error) toast.error("Não foi possível carregar seus favoritos.");
      else setSaved({ customerId, ids: (data || []).map(item => Number(item.produto_id)) });
      setLoadedCustomer(customerId);
    });
    return () => { active = false; };
  }, [customerId]);

  const toggleFavorite = useCallback(async (productId: number) => {
    if (!customerId) {
      toast("Entre para salvar seus favoritos", { action: { label: "Entrar", onClick: () => router.push("/login?redirect=/favoritos") } });
      return;
    }
    if (loadedCustomer !== customerId || !Number.isSafeInteger(productId) || productId <= 0 || inFlight.current.has(productId)) return;
    inFlight.current.add(productId);
    const removing = favoriteIds.includes(productId);
    try {
      const result = removing
        ? await supabase.from("favorito").delete().eq("cliente_id", customerId).eq("produto_id", productId)
        : await supabase.from("favorito").upsert({ cliente_id: customerId, produto_id: productId }, { onConflict: "cliente_id,produto_id", ignoreDuplicates: true });
      if (result.error) throw result.error;
      if (currentCustomer.current === customerId) setSaved(previous => ({ customerId, ids: removing ? previous.ids.filter(id => id !== productId) : [...new Set([...previous.ids, productId])] }));
    } catch { toast.error("Não foi possível atualizar seus favoritos."); }
    finally { inFlight.current.delete(productId); }
  }, [customerId, favoriteIds, loadedCustomer, router]);

  const clearWishlist = useCallback(async () => {
    if (!customerId) return;
    const { error } = await supabase.from("favorito").delete().eq("cliente_id", customerId);
    if (error) toast.error("Não foi possível limpar seus favoritos.");
    else if (currentCustomer.current === customerId) setSaved({ customerId, ids: [] });
  }, [customerId]);

  return { favoriteIds, isLoaded: !authLoading && (!customerId || loadedCustomer === customerId), toggleFavorite, clearWishlist,
    isFavorite: (id: number) => favoriteIds.includes(id), totalFavorites: favoriteIds.length };
}
