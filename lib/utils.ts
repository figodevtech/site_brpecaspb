import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | string | null | undefined): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(isNaN(numericValue) ? 0 : numericValue);
}

export function slugify(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function formatCategoryName(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim().toLocaleLowerCase("pt-BR");
  if (!normalized) return "";
  return normalized.charAt(0).toLocaleUpperCase("pt-BR") + normalized.slice(1);
}
