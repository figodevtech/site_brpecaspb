# Revisão de frontend — 20/10/2026

## Ajustes

- Busca clara com `InputGroup`, ícone e botão de envio integrados do shadcn/ui.
  O mesmo componente atende cabeçalho desktop, tablet e celular, com rótulos
  acessíveis e teclado de pesquisa no celular.
- Cabeçalho compacto em telas pequenas; busca em linha própria até 1024 px.
- Login e cadastro com layout exclusivo, sem cabeçalho, rodapé e carrinho da
  loja, seguindo a separação da Demir. Títulos semânticos e sem foco automático
  que abra o teclado ao entrar na tela.
- Quebras de linha e larguras mínimas corrigidas no carrinho, drawer e favoritos.
- Rodapé em duas colunas no tablet e quatro somente em telas maiores.
- Blocos fixos da conta e checkout posicionados abaixo do cabeçalho.
- Setas do banner não cobrem os textos no celular; navegação por toque e
  indicadores permanece disponível.
- Menu e rodapé usam categorias reais publicadas pelo ERP, removendo atalhos
  fixos que levavam a páginas inexistentes.

## Verificação

O teste `scripts/tests/br-storefront-responsive.mjs`, na raiz do ERP, abre uma
instância separada do Edge/Chromium em modo headless contra a prévia local.

- 125 combinações de páginas e larguras: 320, 375, 430, 768 e 1280 px.
- Mais 25 verificações em 320 × 568 px, incluindo telas de conta e checkout.
- Sem rolagem horizontal indevida nas páginas verificadas.
- Botão da busca centralizado verticalmente e navegação da pesquisa conferida.
- Dropdown shadcn, menu móvel, drawer e modais de endereço/cartão exercitados.
- Links de categorias publicados retornando HTTP 200.
- Login e cadastro sem cabeçalho ou rodapé da loja.

As telas autenticadas usam sessão e respostas de teste interceptadas no
navegador. Nenhuma conta, cartão ou compra real é criada. Esta revisão valida
layout e interação; não substitui a homologação de autenticação e pagamentos
em produção, nem testes físicos de teclado no iOS/Android.

Relatórios e capturas: `artifacts/br-storefront-responsive/` na raiz do ERP.
O código não foi publicado durante esta revisão.
