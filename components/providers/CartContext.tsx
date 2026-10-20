"use client";
import { useCartContext } from "./CartProvider";
export function useCart() {
  const cart = useCartContext();
  return {
    ...cart,
    items: cart.items.map(({ produto, quantidade }) => ({
      product: { id: String(produto.id), title: produto.tituloMarketplace || produto.titulo,
        name: produto.tituloMarketplace || produto.titulo, price: produto.preco_site ?? produto.precovenda,
        image: produto.imgUrl || "", stock: produto.estoque },
      quantity: quantidade,
    })),
  };
}
