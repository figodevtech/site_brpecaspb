# Ativação BR Peças PB para outro cliente

## Estrutura comum para todas as lojas

A fonte compartilhada está em `../storefront-template/supabase/migrations`.
Para uma loja nova, execute na raiz do ERP:

```powershell
node scripts/storefront/template.mjs sync site_novocliente
node scripts/storefront/template.mjs check site_novocliente
```

Na BR, `npm run db:template:check` confere os arquivos e `npm run db:verify`
confere tabelas, histórico e contagens sem mostrar credenciais. Alterações no
schema comum entram como migrations novas no template e são distribuídas para
as lojas. O histórico antigo da Demir é preservado; não reaplique nele o schema
inicial de loja nova. A cadeia nova inclui a migration de entrega/NF-e antes
da migration da linha do tempo.

## Carga inicial dos produtos da BR

O ERP desta loja é `https://erp.brpecaspb.com.br` e o domínio final da loja é
`https://www.brpecaspb.com.br`. Os segredos de catálogo e pedidos devem coincidir
nos ambientes publicados dos dois projetos, além dos arquivos locais.

O catálogo inicial pode ser enviado pelo endpoint da integração, sem copiar
clientes ou pedidos do ERP. Na raiz do projeto, com os ambientes configurados:

```powershell
node --use-system-ca scripts/storefront/sync-catalog.mjs --erp-env .env.local --store-env site_brpecaspb/.env --target https://www.brpecaspb.com.br --company 1 --expect-name "BR PECAS E SERVICOS LTDA"
```

O comando valida o nome da empresa e o segredo dos dois lados, consulta somente
o catálogo de exportação do ERP e envia lotes à loja. Não muda a visibilidade
dos produtos no ERP nem altera sua fila. As próximas atualizações continuam
pelo publicador/sincronizador normal do ERP.

No desenvolvimento, a instância de verificação pode usar `--target
http://localhost:3011`; o banco de destino continua sendo o configurado na loja.
O catálogo agora tem paginação e ordenação, e favoritos são persistidos por
conta no Supabase. O carrinho permanece local até o pedido e valida novamente
preço e estoque no checkout. Controles usam shadcn/ui e notificações Sonner.

Esta loja implementa o contrato de integração da Demir Diesel, preservando a
identidade, o catálogo visual e o carrinho BR. Login, perfil, endereços, cartões,
checkout e pedidos usam o fluxo autenticado da integração.

## Isolamento

Use um Supabase **novo e exclusivo da BR**, a instalação ERP deste cliente e a
conta Asaas dele. Não reutilize banco, chaves, tokens, wallet ou instalação da
Demir. O ERP atual configura uma loja por instalação via `STOREFRONT_API_URL`:
configure o ambiente do outro cliente sem alterar o ambiente da Demir.

O navegador acessa somente a loja. O ERP envia catálogo, preço, estoque e fotos;
a loja informa pagamentos ao ERP, que importa pedidos pagos e gerencia
separação, NF-e, rastreio e devoluções. A conta e o histórico ficam na loja.

## Ambiente da loja

Copie `.env.example` para `.env.local`. Preencha Supabase da loja, URLs públicas,
Asaas do cliente, `ERP_CATALOG_SYNC_SECRET`, `ERP_ORDER_SYNC_SECRET` e
`ERP_ORDER_WEBHOOK_URL=https://ERP-DO-CLIENTE/api/integracoes/site/webhook`.
Os segredos de catálogo e pedidos devem ser diferentes.

Configure `CENTRAL_INSTALLATION_ID` e `CENTRAL_STOREFRONT_TOKEN` da BR. Publique
carteira e percentual em Integrações → Loja virtual na Central.
No Supabase Auth, configure Site URL e Redirect URLs para o domínio BR e os
endereços de homologação usados no login e confirmação de e-mail.

## Banco novo

Copie `.env.migrations.example` para `.env.migrations.local`. Preencha
`DATABASE_URL` com a conexão PostgreSQL Session Pooler do **banco da loja**.
Execute na pasta `site_brpecaspb`:

```sh
npm install
npm run db:baseline -- --empty
npm run db:status
npm run db:dry-run
npm run db:deploy
```

Confirme a referência do projeto exibida pelo baseline. O deploy aplica schema
inicial e migrations de pagamentos, comissão, cartões, entrega e estornos.
Não execute `supabase/storefront` separadamente. `db:dry-run` apenas compara
históricos; não executa nem valida SQL no banco.

Se já houver banco BR com dados, reconcilie schema e histórico antes de usar
esta cadeia. Não marque o schema inicial como aplicado sem conferir tabelas,
políticas e funções. A migration antiga dependente dos enums do ERP foi
substituída pelo schema independente da loja. O setup avulso agora usa o migrador.

Compatibilidade veicular é local: o contrato atual do ERP não transmite esses
vínculos. O seed de demonstração não faz parte da ativação.

## Ambiente do ERP deste cliente

```env
STOREFRONT_API_URL=https://brpecaspb.com.br
STOREFRONT_CATALOG_SYNC_SECRET=<mesmo ERP_CATALOG_SYNC_SECRET da loja>
STOREFRONT_ORDER_SYNC_SECRET=<mesmo ERP_ORDER_SYNC_SECRET da loja>
```

Use o domínio final sem redirecionamentos e publique o catálogo pelo ERP.
Os IDs recebidos são os IDs dos produtos do ERP deste cliente.

## Asaas

Configure o webhook `https://brpecaspb.com.br/api/webhooks/asaas` com
`ASAAS_WEBHOOK_TOKEN`. Configure a autorização Pix em
`https://brpecaspb.com.br/api/webhooks/asaas/authorize-refund` com o token separado
`ASAAS_REFUND_AUTHORIZATION_TOKEN`, de pelo menos 32 caracteres.
Veja [o roteiro de estornos](./CONFIGURACAO_AUTORIZACAO_ESTORNOS_ASAAS.md).

O fluxo exige solicitação do ERP e valida operação e cobrança no Asaas. O
estoque retorna conforme confirmação financeira e regras de devolução física.
Sem credenciais, o checkout não gera pagamento simulado.

## Homologação

1. Criar conta, confirmar e-mail, completar perfil e cadastrar endereço.
2. Sincronizar catálogo; alterar preço, estoque e visibilidade e conferir na loja.
3. Comprar com Pix, boleto e cartão no sandbox, conferindo valor e comissão.
4. Repetir webhook e conferir ausência de baixa/importação duplicada no ERP.
5. Importar pedido pago, publicar separação, NF-e/DANFE e rastreio no ERP e
   conferir `/pedidos` e `/rastreio` com o usuário comprador.
6. Testar estorno Pix, autorização, confirmação, recusa e nova tentativa;
   conferir a devolução de estoque e o fluxo de retorno após envio.
7. Confirmar que outro usuário não consulta pedidos do comprador e que as
   integrações sem segredo retornam 401.

As antigas consultas por CPF/e-mail e APIs administrativas públicas retornam
410. A gestão acontece no ERP. O checkout segue a Demir: retirada elegível ou
entrega com frete a confirmar após análise. Estimativas antigas de frete das
páginas de produto não são aceitas como valor financeiro pelo checkout.

```sh
npm run db:test
npm run test:integration
npx tsc --noEmit
npm run build
```

Testes locais não comprovam credenciais, migrations aplicadas ou transações
reais. A ativação exige os ambientes acima e homologação com os serviços do cliente.
