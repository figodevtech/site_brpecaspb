"use client";

import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

export function SearchField({ value, onChange, id }: { value: string; onChange: (value: string) => void; id: string }) {
  return (
    <InputGroup className="h-11 rounded-xl border-white/20 bg-white text-zinc-950 shadow-sm has-[[data-slot=input-group-control]:focus-visible]:border-orange-400 has-[[data-slot=input-group-control]:focus-visible]:ring-orange-400/30">
      <InputGroupInput id={id} type="search" name="q" aria-label="Buscar peças" autoComplete="off" enterKeyHint="search"
        value={value} onChange={event => onChange(event.target.value)} placeholder="Buscar peça, código ou veículo"
        className="h-full min-w-0 text-base text-zinc-950 placeholder:text-zinc-500 md:text-sm [&::-webkit-search-cancel-button]:cursor-pointer" />
      <InputGroupAddon align="inline-end" className="pr-2">
        <InputGroupButton type="submit" size="icon-sm" aria-label="Pesquisar" title="Pesquisar"
          className="size-9 shrink-0 rounded-lg text-zinc-500 hover:bg-orange-50 hover:text-orange-600 focus-visible:ring-orange-400/40">
          <Search aria-hidden="true" className="size-4" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
