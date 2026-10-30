# Tempus - contratação web

Esta implementação adapta o projeto Pronto: https://github.com/SGrappelli/pronto.
A licença MIT original está preservada em LICENSE. A identidade visual do Tempus segue as referências locais fornecidas pelo proprietário.

## Rodar

Requisitos: Node.js 20.9+ e npm.

    npm install
    npm run dev -- --hostname 127.0.0.1 --port 4173

Abrir http://localhost:4173/contratar

A rota /contratar funciona sem credenciais Supabase. As rotas originais de gestão continuam dependendo da configuração documentada no README original.

## Entregue nesta etapa

- Next.js App Router, React e TypeScript; aplicação responsiva, sem instalação obrigatória.
- Escolha de plano e periodicidade, comparação e perguntas frequentes.
- Google e Apple com explicação explícita e caminho de demonstração.
- E-mail e código demonstrativo 123456; dados do proprietário.
- Revisão, cartão/Pix, processamento, pendência, expiração, recusa e confirmação.
- Modais, validações, foco, navegação por teclado e suporte a movimento reduzido.
- Explorador de estados para revisar as telas sem repetir todo o fluxo.
- Somente plano e periodicidade persistem localmente; nenhum dado financeiro é coletado.

## Limites intencionais

Não há autenticação real, envio de e-mail, cobrança, ativação de assinatura ou configuração inicial. Os preços não foram inventados. O QR mostrado é um placeholder não pagável. A confirmação é uma simulação e não concede acesso a funcionalidades protegidas. A logo oficial fornecida foi aplicada com fundo transparente; o símbolo e as letras originais também compõem a versão horizontal do cabeçalho.

A página de configuração inicial não foi criada. Seu botão abre uma explicação do próximo passo.

## Próximas integrações

1. Definir planos, limites, preços e documentos jurídicos.
2. Conectar Google/Apple/e-mail ao Supabase Auth existente; validar configuração dos provedores e vinculação segura de contas.
3. Criar checkout no servidor com preços controlados pelo servidor, idempotência, webhooks verificados e associação ao proprietário autenticado.
4. Liberar assinatura somente com confirmação persistida pelo provedor. Tratar pedidos pendentes, troca de método e renovação sem duplicidade.
5. Construir a configuração do estabelecimento e revisar isolamento de dados e permissões antes do uso real.

Login Google e autorização para Google Agenda são etapas independentes.

## Organização

- app/contratar/page.tsx: entrada e metadados da prévia.
- app/contratar/tempus.css: identidade e layouts responsivos.
- components/tempus/checkout.tsx: experiência navegável e componentes de formulário.
- lib/tempus/checkout.ts: modelos, planos provisórios e funções de estado.
- tests/unit/tempus/checkout.spec.ts: verificações de fronteiras do fluxo.
- proxy.ts: liberação apenas da rota pública de design, sem alterar proteção do painel.

O restante do código original do Pronto permanece disponível para as próximas etapas. Ainda não foi auditado como um todo para uso comercial em produção.

## Marca

- public/brand/tempus-logo.png: arquivo original fornecido, preservado.
- public/brand/tempus-logo-transparent.png: composição original sem fundo.
- public/brand/tempus-logo-horizontal.webp: símbolo e letras originais em composição horizontal para o cabeçalho.
- public/brand/tempus-background.webp: textura decorativa gerada para as áreas de apresentação.
- scripts/prepare-tempus-brand.cjs: preparo reproduzível dos derivados da logo.

## Experiência mobile e profundidade

A etapa de planos prioriza o celular: carrossel nativo com encaixe dos cards, navegação pelos nomes dos planos e botões de pelo menos 44 px. Os campos de texto usam 16 px no celular.

O parallax acompanha a rolagem com requestAnimationFrame e listeners passivos, sem alterar a rolagem nativa. No celular, apenas o fundo se movimenta, em intensidade reduzida. A preferência de movimento reduzido desliga o efeito.

Arquivos: components/tempus/plans.tsx, components/tempus/use-plan-parallax.ts e app/contratar/plans.css.

Verificação: npm run test:tempus-mobile (Playwright/Chromium instalado; PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH pode indicar um navegador existente). Cobre 320, 390 e 430 px, gesto de deslizar, navegação, plano escolhido, alvos de toque, overflow e parallax.
