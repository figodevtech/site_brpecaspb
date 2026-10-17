# MISSÃO — DESENVOLVER O E-COMMERCE BR PEÇAS PB

Você é o desenvolvedor responsável pela implementação completa do novo e-commerce da **BR Peças PB — Peças e Acessórios**, empresa especializada na comercialização de peças automotivas novas e usadas, incluindo peças oriundas de desmontagem de veículos.

**Seu objetivo é entregar uma loja virtual real, funcional, moderna, responsiva e preparada para produção. Não construa apenas uma landing page ou protótipo visual.**

## 1. Referências obrigatórias

Analise as três imagens fornecidas:

- **Imagem 1:** inspiração para banners, atmosfera automotiva, veículos e identidade premium.
- **Imagem 2:** logotipo oficial e cores da BR Peças PB.
- **Imagem 3:** inspiração para layout de e-commerce, busca por veículo, navegação por categorias e apresentação de produtos.

Utilize a identidade visual preto, laranja e branco da BR Peças. O catálogo terá predominantemente fundo branco, cartões modernos e CTAs laranja. O header e os banners terão elementos escuros.

O site deve ser inteiramente em português brasileiro.

## 2. Referência técnica existente

Analise o repositório:

https://github.com/figodevtech/site_demirdiesel

Estude como a loja Demir Diesel implementa:

- Catálogo, produtos, filtros e buscas.
- Carrinho, favoritos, usuários e endereços.
- Checkout Asaas, Pix, cartão e boleto.
- Confirmação de pagamento por webhook.
- Integração de catálogo e pedidos com o ERP Oficina.
- Supabase, RLS, migrations e autenticação.
- PWA, SEO e estrutura responsiva.

Reaproveite padrões e conhecimentos técnicos, sem reutilizar dados, segredos, identidade ou banco da Demir.

## 3. Loja virtual

Implemente uma homepage premium com busca em destaque, navegação por marcas e veículos, categorias, peças novas, peças usadas, produtos recém-chegados, vitrines dinâmicas, banners e informações institucionais.

Desenvolva páginas de catálogo com filtros avançados por marca, modelo, ano, motor, fabricante, categoria, condição, preço e disponibilidade.

Cada produto terá galeria de imagens, descrição técnica, códigos OEM, aplicação, condição, defeitos informados, estoque real, preço, frete, garantia aplicável, botão de compra e consulta pelo WhatsApp.

## 4. Sistema de compatibilidade automotiva

Implemente uma base estruturada de fabricantes, modelos, anos, versões e motores.

O usuário deve poder escolher seu veículo e visualizar peças compatíveis. Também poderá buscar por nome, código OEM, referência e descrição.

Não apresente compatibilidade como confirmada quando não houver cadastro técnico que a comprove.

## 5. Peças usadas e rastreabilidade

Suporte itens provenientes de desmontagem com identificação individual, estado de conservação, fotografias reais, origem documentada e quantidade unitária.

Proteja dados internos da origem do veículo. Implemente revisão de conformidade e bloqueio de itens cuja comercialização não esteja autorizada.

Considere a Lei 12.977/2014, a Resolução CONTRAN 611/2016 e normas vigentes, incluindo a validação jurídica da operação que venderá peças novas e usadas.

## 6. Comércio e logística

Implemente:

- Cadastro e login de clientes.
- Minha conta, endereços, veículos e pedidos.
- Carrinho persistente.
- Controle transacional de estoque e reservas.
- Checkout integrado ao Asaas.
- Webhooks autenticados e idempotentes.
- Cancelamentos, estornos e devoluções.
- Rastreamento de pedidos.
- Cotação de frete por CEP e dimensões.
- Cotação manual para peças grandes e pesadas.
- Retirada presencial quando habilitada.

Nunca confirme uma venda sem estoque disponível e nunca considere frete desconhecido como gratuito.

## 7. Banco e integração

Utilize Next.js, TypeScript, Tailwind, shadcn/ui, Supabase e Vercel.

Crie um banco independente para a loja. Integre catálogo e pedidos ao ERP Oficina por APIs seguras entre servidores.

Implemente sincronização incremental, filas de reprocessamento, reconciliação e controle para impedir vendas duplicadas de peças únicas.

## 8. Administração

Crie um painel administrativo protegido com visualização de pedidos, pagamentos, separação, catálogo, compatibilidade, publicações, banners, campanhas, cotações de frete e saúde das integrações.

O ERP continuará sendo a fonte de verdade para os dados operacionais que lhe competem.

## 9. Qualidade

Inclua SEO, acessibilidade, páginas institucionais, LGPD, PWA instalável, otimização de imagens, segurança, testes de checkout e responsividade completa.

Desenvolva com prioridade para o mobile, sem prejudicar a apresentação desktop.

## 10. Execução

Leia integralmente o arquivo **BR_Pecas_PB_Prompt_Antigravity.md** anexo e trate-o como especificação detalhada deste projeto.

Comece analisando as referências e o repositório da Demir. Em seguida, planeje a arquitetura e implemente as fases de fundação, interface, catálogo, comércio, integrações e testes.

Entregue código real, migrations, documentação e instruções de instalação. Execute build e testes. Registre o que ainda depende de credenciais ou homologação.

**Não encerre a missão após criar apenas o frontend. O objetivo é um e-commerce completo, visualmente profissional e operacionalmente consistente.**