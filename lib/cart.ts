import type { CartItem, Product } from "@/lib/types";

export function purchasableQuantity(product: Product, quantity: number) {
  const price = Number(product.preco_site ?? product.precovenda);
  const stock = Math.max(0, Math.floor(Number(product.estoque)));
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || !Number.isFinite(quantity)) return 0;
  return Math.max(0, Math.min(Math.floor(quantity), stock));
}

export function restoreCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result = new Map<number, CartItem>();
  for (const item of value) {
    if (!item?.produto || !Number.isSafeInteger(item.produto.id) || item.produto.id <= 0) continue;
    const product = item.produto as Product;
    const quantity = purchasableQuantity(product, Number(item.quantidade));
    if (!quantity) continue;
    const previous = result.get(product.id);
    result.set(product.id, { produto: product, quantidade: purchasableQuantity(product, quantity + (previous?.quantidade || 0)) });
  }
  return [...result.values()];
}
