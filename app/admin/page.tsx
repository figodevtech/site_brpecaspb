import Link from "next/link";
export default function AdminPage() {
  return <div className="container mx-auto max-w-2xl px-4 py-16">
    <h1 className="text-2xl font-bold">Gestão da loja</h1>
    <p className="mt-4">Catálogo, estoque, pedidos, faturamento, rastreio e devoluções são gerenciados no ERP da BR Peças PB.</p>
    <Link className="mt-6 inline-block underline" href="/conta">Acessar minha conta</Link>
  </div>;
}
