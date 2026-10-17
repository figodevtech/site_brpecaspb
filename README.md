# BR Peças PB — Loja Virtual & E-commerce Automotivo

Plataforma oficial de comércio eletrônico da **BR Peças PB — Peças e Acessórios**, especializada na venda de peças automotivas novas e peças usadas revisadas com garantia, procedência e nota fiscal.

Desenvolvido com foco em alta performance, usabilidade móvel, segurança transacional de pagamentos e conformidade fiscal/jurídica.

---

## 🛠 Tecnologias Utilizadas

- **Frontend & Backend:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Estilização & Componentes:** [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Lucide Icons](https://lucide.dev/)
- **Banco de Dados & Autenticação:** [Supabase PostgreSQL](https://supabase.com/) com RLS (Row Level Security) e Pooler AWS
- **Gateway de Pagamento:** [Asaas](https://www.asaas.com/) (PIX Instantâneo com QR Code dinâmico, Cartão de Crédito até 12x e Boleto Bancário)
- **Webhooks & Idempotência:** Processamento transacional de eventos Asaas com baixa atômica de estoque (`fn_baixar_estoque_venda`) e estorno (`fn_estornar_estoque_venda`)
- **PWA (Progressive Web App):** Manifesto web, ícones de aplicativo e suporte offline
- **SEO & Otimizações:** Metadados dinâmicos, OpenGraph, `sitemap.xml` dinâmico e `robots.txt`

---

## 🗺 Estrutura de Rotas do Projeto

### Loja Virtual (Público)
- `/` — Homepage com vitrines dinâmicas, busca rápida, navegação por marcas e seletor veicular
- `/produtos` — Catálogo completo com filtros avançados (montadora, modelo, ano, motor, categoria, condição, preço)
- `/categoria/[slug]` — Vitrine filtrada por departamento (painéis, módulos, freios, motores, alternadores, etc.)
- `/produto/[id]` — Ficha técnica detalhada com galeria de fotos reais, compatibilidade veicular, garantia, cálculo de frete e botão WhatsApp
- `/buscar` — Busca textual por nome, referência OEM e modelo
- `/carrinho` — Carrinho de compras persistente via local state / LocalStorage
- `/checkout` — Checkout transparente blindado integrado ao Asaas (Pix, Cartão e Boleto)
- `/sucesso` — Confirmação de pedido com QR Code Pix, link para WhatsApp com resumo do pedido e detalhes de envio
- `/favoritos` — Lista de desejos de autopeças
- `/trocas-e-devolucoes` — Política oficial de garantia (90 dias) e devoluções
- `/fale-conosco` — Formulário de atendimento e contatos oficiais
- `/politica-de-privacidade` — Termos de privacidade e conformidade com a LGPD
- `/termos-de-uso` — Condições gerais de compra e regras de garantia

### Área do Cliente
- `/conta` — Minha Conta com:
  - **Meus Pedidos:** Histórico completo com status, valores e código de rastreamento
  - **Minha Garagem:** Cadastro de veículos da frota do cliente para busca rápida de peças compatíveis
  - **Endereços Salvos:** Gestão de endereços de entrega
- `/rastreio` — Rastreamento com linha do tempo visual da encomenda e integração aos Correios / Transportadoras

### Painel Administrativo
- `/admin` — Painel executivo operacional:
  - **Visão Geral:** Métricas de faturamento, pedidos pagos, pendentes e estoque crítico
  - **Gestão de Pedidos:** Atualização de status e inserção de transportadora/código de rastreio
  - **Auditoria de Webhooks Asaas:** Tabela de eventos recebidos em tempo real
  - **Saúde das Integrações:** Diagnóstico do Asaas, Supabase e Catálogo de Peças

### API Routes
- `POST /api/checkout` — Criação do pedido no Supabase e emissão da cobrança no Asaas
- `POST /api/webhooks/asaas` — Webhook autenticado com token e idempotência para baixa/estorno de estoque
- `GET /api/pedidos/[id]` — Consulta segura dos dados do pedido
- `GET /api/conta` — Consulta de pedidos e endereços do cliente por CPF ou e-mail
- `GET /api/favoritos` — Obtenção dos produtos favoritados em lote
- `POST /api/contato` — Envio de formulário de contato integrado ao Supabase
- `GET /api/admin/metrics` — Métricas administrativas
- `GET / PATCH /api/admin/pedidos` — Gestão de pedidos e códigos de rastreio

---

## 🚀 Como Executar o Projeto

### 1. Clonar o repositório e instalar dependências
```bash
git clone <url-do-repositorio>
cd site_brpecaspb
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz com as seguintes chaves (consulte `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://ufomohkhyyekflykqejc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://postgres.xxx:password@aws-pooler.supabase.com:5432/postgres

# Asaas Gateway
ASAAS_API_KEY=...
ASAAS_ENVIRONMENT=sandbox
ASAAS_WEBHOOK_SECRET=seu-token-de-webhook

# Site
NEXT_PUBLIC_SITE_URL=https://brpecaspb.com.br
```

### 3. Migrar banco de dados e seed de compatibilidade
Execute os scripts para criar as tabelas, funções transacionais de estoque e compatibilidades veiculares:

```bash
# Aplica migrations de tabelas, constraints e triggers
npm run db:setup

# Popula veículos de referência e vincula produtos compatíveis
node scripts/db/seed-compatibility.mjs
```

### 4. Iniciar em desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no navegador.

### 5. Compilar para produção
```bash
npm run build
npm run start
```

---

## 🔒 Segurança & Conformidade Legal

1. **Baixa Atômica de Peças Únicas:**
   Peças usadas possuem controle de estoque rigoroso. A função Postgres `fn_baixar_estoque_venda` utiliza bloqueio transacional (`FOR UPDATE`) para evitar duplicidade de vendas.
2. **Idempotência de Pagamentos:**
   A tabela `payment_webhook_event` armazena o histórico de eventos processados, impedindo que notificações repetidas do Asaas baixem o estoque mais de uma vez.
3. **Resguardo e Segurança:**
   Dados de clientes e pedidos são totalmente resguardados sob a LGPD, fornecendo ambiente seguro e certificado com criptografia de ponta a ponta.
