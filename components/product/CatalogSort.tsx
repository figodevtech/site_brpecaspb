"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CatalogSort({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  return <Select value={value} onValueChange={sort => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("page", "1");
    router.push(`/produtos?${params}`);
  }}>
    <SelectTrigger aria-label="Ordenar produtos" className="w-full sm:w-52 bg-white"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="recent">Mais recentes</SelectItem>
      <SelectItem value="price_asc">Menor preço</SelectItem>
      <SelectItem value="price_desc">Maior preço</SelectItem>
      <SelectItem value="name">Nome do produto</SelectItem>
    </SelectContent>
  </Select>;
}
