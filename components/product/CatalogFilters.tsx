"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import type { ProductCategory } from "@/lib/types";
import { getCatalogCollection } from "@/lib/catalog/collections";

type Props = { categories: ProductCategory[]; brands: string[]; priceBounds: { min: number; max: number }; total: number; mobile?: boolean };
const keys = ["colecao", "categoria", "condicao", "fabricante", "estoque", "min", "max"];
const conditions = [{ value: "NOVO", label: "Novas" }, { value: "USADO", label: "Seminovas" }, { value: "RECONDICIONADO", label: "Recondicionadas" }];
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CatalogFilters(props: Props) {
  const params = useSearchParams();
  const count = keys.filter(key => params.has(key) && params.get(key) !== "TODOS").length;
  const content = <FilterContent key={`${params.get("min")}:${params.get("max")}`} {...props} />;
  if (!props.mobile) return content;
  return <Sheet>
    <SheetTrigger asChild><Button variant="outline" className="lg:hidden bg-white shrink-0"><SlidersHorizontal className="size-4" /> Filtros {count > 0 && <span className="rounded-full bg-primary px-1.5 text-primary-foreground text-xs">{count}</span>}</Button></SheetTrigger>
    <SheetContent className="w-[92vw] sm:max-w-sm gap-0">
      <SheetHeader><SheetTitle>Filtrar produtos</SheetTitle><SheetDescription>Refine o catálogo da BR Peças.</SheetDescription></SheetHeader>
      <div className="flex-1 min-h-0 overflow-y-auto px-5">{content}</div>
      <SheetFooter className="border-t"><SheetClose asChild><Button>Ver {props.total} produtos</Button></SheetClose></SheetFooter>
    </SheetContent>
  </Sheet>;
}

function FilterContent({ categories, brands, priceBounds }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const floor = priceBounds.min;
  const ceiling = Math.max(floor + 1, priceBounds.max);
  const clamp = (value: string | null, fallback: number) => value && Number.isFinite(Number(value)) ? Math.max(floor, Math.min(ceiling, Number(value))) : fallback;
  const initialMin = clamp(params.get("min"), floor);
  const initialMax = clamp(params.get("max"), ceiling);
  const [price, setPrice] = useState([Math.min(initialMin, initialMax), Math.max(initialMin, initialMax)]);
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value); else next.delete(key);
    }
    next.delete("page");
    startTransition(() => router.push(`/produtos${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const clear = () => update(Object.fromEntries(keys.map(key => [key, null])));
  const active = keys.filter(key => params.has(key) && params.get(key) !== "TODOS");
  const chipLabel = (key: string) => {
    const value = params.get(key)!;
    if (key === "colecao") return getCatalogCollection(value)?.title || "Seleção de produtos";
    if (key === "categoria") return categories.find(category => String(category.id) === value)?.nome || "Categoria";
    if (key === "condicao") return conditions.find(condition => condition.value === value)?.label || value;
    if (key === "estoque") return "Pronta entrega";
    if (key === "min" || key === "max") return `${key === "min" ? "De" : "Até"} ${money(Number(value))}`;
    return value;
  };
  const remove = (key: string) => update({ [key]: null });
  const isSelected = (key: string, value: string) => (params.get(key) || (key === "condicao" ? "TODOS" : "")) === value;
  const options = (items: { value: string; label: string }[], key: string) => items.map(item => <Button key={item.value} variant="ghost" disabled={pending} aria-pressed={isSelected(key, item.value)} onClick={() => update({ [key]: isSelected(key, item.value) || item.value === "TODOS" ? null : item.value })} className={`w-full min-h-10 h-auto justify-between whitespace-normal text-left font-normal ${isSelected(key, item.value) ? "bg-orange-50 text-orange-700 font-semibold" : "text-zinc-600"}`}><span>{item.label}</span>{isSelected(key, item.value) && <Check className="size-4 shrink-0" />}</Button>);
  return <div aria-busy={pending} className="pb-2">
    <div className="flex items-center justify-between gap-2 mb-3"><div><h2 className="font-bold text-sm">Filtrar produtos</h2><p className="text-xs text-muted-foreground mt-1">Refine o catálogo</p></div>{active.length > 0 && <Button variant="ghost" size="sm" disabled={pending} onClick={clear}>Limpar</Button>}</div>
    {active.length > 0 && <div className="flex flex-wrap gap-1.5 mb-4">{active.map(key => <Button key={key} variant="outline" size="sm" disabled={pending} onClick={() => remove(key)} aria-label={`Remover filtro ${chipLabel(key)}`} className="h-auto min-h-8 max-w-full whitespace-normal text-left text-xs bg-orange-50 border-orange-200 text-orange-800">{chipLabel(key)}<X className="size-3 shrink-0" /></Button>)}</div>}
    <Accordion type="multiple" defaultValue={["categories", "stock", "condition", "price", "brands"]}>
      <AccordionItem value="categories"><AccordionTrigger>Categorias</AccordionTrigger><AccordionContent>
        {categories.length > 7 && <Input aria-label="Buscar categoria" placeholder="Buscar categoria..." value={categorySearch} onChange={event => setCategorySearch(event.target.value)} className="mb-2" />}
        <div className="max-h-52 overflow-y-auto">{options(categories.filter(category => category.nome.toLocaleLowerCase().includes(categorySearch.toLocaleLowerCase())).map(category => ({ value: String(category.id), label: category.nome })), "categoria")}</div>
      </AccordionContent></AccordionItem>
      <AccordionItem value="stock"><AccordionTrigger>Disponibilidade</AccordionTrigger><AccordionContent><label className="flex items-center gap-3 py-2 text-sm cursor-pointer"><Checkbox checked={params.get("estoque") === "disponivel"} disabled={pending} onCheckedChange={checked => update({ estoque: checked === true ? "disponivel" : null })} />Somente pronta entrega</label></AccordionContent></AccordionItem>
      <AccordionItem value="condition"><AccordionTrigger>Estado da peça</AccordionTrigger><AccordionContent>{options([{ value: "TODOS", label: "Todas as peças" }, ...conditions], "condicao")}</AccordionContent></AccordionItem>
      <AccordionItem value="price"><AccordionTrigger>Faixa de preço</AccordionTrigger><AccordionContent><div className="px-2 py-4"><Slider aria-label="Faixa de preço" min={floor} max={ceiling} step={1} value={price} onValueChange={setPrice} disabled={pending || priceBounds.max === 0} /></div><div className="flex justify-between gap-2 text-xs tabular-nums"><span>{money(price[0])}</span><span>{money(price[1])}</span></div><Button variant="outline" className="w-full mt-3" disabled={pending || priceBounds.max === 0} onClick={() => update({ min: price[0] > floor ? String(price[0]) : null, max: price[1] < ceiling ? String(price[1]) : null })}>Aplicar faixa de preço</Button></AccordionContent></AccordionItem>
      {brands.length > 0 && <AccordionItem value="brands"><AccordionTrigger>Marcas das peças</AccordionTrigger><AccordionContent>{brands.length > 7 && <Input aria-label="Buscar marca" placeholder="Buscar marca..." value={brandSearch} onChange={event => setBrandSearch(event.target.value)} className="mb-2" />}<div className="max-h-52 overflow-y-auto">{options(brands.filter(brand => brand.toLocaleLowerCase().includes(brandSearch.toLocaleLowerCase())).map(brand => ({ value: brand, label: brand })), "fabricante")}</div></AccordionContent></AccordionItem>}
    </Accordion>
  </div>;
}
