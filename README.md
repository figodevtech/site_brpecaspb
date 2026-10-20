# BR Peças PB

Loja Next.js 16 e React 19 integrada ao ERP: catálogo, estoque, pedidos,
pagamentos Asaas, comissão pela Central, NF-e, rastreio e devoluções.

O Supabase da loja é separado do ERP. Cada cliente usa credenciais próprias.
Consulte [INTEGRACAO_ERP.md](./INTEGRACAO_ERP.md) para configuração e homologação.

```sh
npm install
# Preencha .env.local a partir de .env.example
npm run dev
```

Compradores usam `/login`, `/registro`, `/conta`, `/enderecos`, `/checkout`
e `/pedidos`. A operação administrativa é realizada no ERP.
