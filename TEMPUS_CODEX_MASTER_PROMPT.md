# TEMPUS — MASTER PROMPT PARA CODEX

> Documento de execução. Leia integralmente antes de modificar código. Idioma de comunicação e da interface: português brasileiro.

## 0. Sua função

Atue como **Lead Creative Developer, Senior Frontend Engineer, Motion Designer, UX Engineer e arquiteto de SaaS**. Construa o TEMPUS, plataforma web-first de agendamento e gestão de barbearias, com possibilidade de expansão para salões e outros negócios de serviços.

**Objetivo:** entregar uma experiência visual premium, memorável e cinematográfica na landing page, seguida por contratação, onboarding e dashboard rápidos, acessíveis e funcionais. Não entregue um template SaaS genérico. Não substitua direção de arte por gradientes básicos, ícones soltos e cards repetitivos. Não confunda protótipo visual com produto funcional.

**Princípio:** landing page pode ser expressiva; fluxos de pagamento e gestão devem priorizar clareza, segurança, acessibilidade e desempenho.

## 1. Primeira ação obrigatória: inspecionar o projeto

1. Inspecione a pasta do projeto, `package.json`, rotas, componentes, assets, estilos, configuração, testes e histórico Git.
2. Identifique o que já existe, o que funciona e o que não funciona. **Não sobrescreva trabalho existente sem necessidade.**
3. Procure referências de UI/UX e a logo oficial **nos arquivos efetivamente acessíveis**. A pasta de referência mencionada pelo proprietário é `C:\Users\nambe\OneDrive\Documentos\Tempus UIUX`. Se não estiver acessível, peça o caminho correto ou os assets; não finja que viu arquivos locais.
4. Repositório de referência indicado pelo proprietário: `https://github.com/SGrappelli/pronto`. Verifique se há acesso, licença e utilidade real antes de reutilizar qualquer código. Não copie indiscriminadamente.
5. Identifique o comando de desenvolvimento (`npm run dev` ou equivalente), porta e URL local; execute e confirme o funcionamento antes de propor mudanças.
6. Apresente auditoria curta, riscos, plano de fases e estrutura sugerida. Depois **implemente apenas a Fase 1**, teste no navegador e mostre evidências visuais antes de avançar.

## 2. Marca e design system

- Marca: **TEMPUS**.
- Slogan: **Seu tempo. Seu negócio.**
- Logo oficial: T angular integrado a um anel de relógio parcialmente aberto, dourado/branco, sobre azul-marinho. **Utilize a arte fornecida como referência autoritativa; não redesenhe arbitrariamente.** Se o asset não existir no projeto, solicite-o.
- Cores: navy principal `#061A32`; navy secundário `#112B47`; dourado `#D7AD65`; destaque dourado `#F0C77E`; branco `#FFFFFF`; texto secundário `#B6C5D6`.
- Tipografia: Inter ou Manrope, com títulos de alto impacto e hierarquia clara.
- Estética: premium, sofisticada, unissex, tecnológica, cinematográfica; fotografia real de barbearias e ferramentas; iluminação direcional; contraste alto; composição editorial; profundidade, sombras sutis e textura de filme discreta.
- Preserve consistência de cores, raios, espaçamentos, estados, iconografia, timing de movimento e componentes. Crie tokens reutilizáveis.
- **Não invente preços, regras comerciais definitivas, integrações ativas ou depoimentos reais.** Use placeholders explícitos quando necessário.

## 3. Landing page — experiência completa

### 3.1 Preloader de tesoura

Criar animação curta, original e opcional: uma tesoura de barbeiro estilizada avança cortando uma linha dourada de progresso, com abertura/fechamento das lâminas, feedback visual contido e revelação final do símbolo TEMPUS. **Progresso deve refletir carregamento real**, não uma porcentagem inventada. Não atrase o acesso artificialmente; permitir pular e respeitar `prefers-reduced-motion`. Usar SVG e animações leves quando possível.

### 3.2 Hero cinematográfica

- Hero imersiva com fotografia/vídeo de barbearia premium; preferir imagens reais otimizadas a fundo somente em cor sólida.
- Camadas com parallax discreto, iluminação ambiente animada, profundidade, grain sutil e transições bem coreografadas.
- Sequência: linha dourada representa passagem do tempo → símbolo da marca surge → letras TEMPUS reveladas progressivamente → título em stagger → CTAs entram com intenção.
- Headline: **Seu negócio no controle. Seu tempo de volta.**
- Subtítulo: **Agendamentos, clientes, equipe e gestão em um só lugar.**
- CTAs: **Começar agora** e **Conhecer o Tempus**.
- Navegação fixa elegante, logo, links úteis, botão de contratação e menu mobile funcional.
- Na rolagem, a hero transita suavemente para uma prévia do dashboard, com camadas movendo-se em velocidades diferentes. Não usar scroll hijacking agressivo.

### 3.3 Storytelling por scroll

Seção **Mais organização. Menos tempo perdido.**: imagem cinematográfica de barbeiro em trabalho, headline temporariamente fixada, cartões de agendamento surgem em profundidade e se organizam em uma interface realista de agenda. Usar GSAP ScrollTrigger com pontos de início/fim claros, suporte a resize e fallback sem animação.

### 3.4 Product showcase 3D

Mostrar smartphone ou mockup do painel flutuando em perspectiva, com sombras e reflexos controlados. Interação de mouse suave no desktop e animação por scroll/touch no mobile. Demonstrar **Dashboard, Agenda, Clientes, Serviços e Equipe**. Usar CSS 3D para efeitos simples; introduzir React Three Fiber/Three.js **apenas** se o resultado exigir geometria 3D real. Evitar 3D pesado em celulares modestos.

### 3.5 Carrossel editorial

Carrossel horizontal com fotografias, tipografia marcante, drag/swipe, snap, setas, indicador de progresso e slides parcialmente visíveis. Benefícios: **Controle sua agenda; Organize sua equipe; Conheça seus clientes; Gerencie seus serviços; Ganhe tempo para crescer.** Evitar autoplay invasivo. Navegação por teclado e leitores de tela.

### 3.6 Ambient background motion e microinterações

Luzes radiais suaves, reflexos dourados lentos, texturas, partículas discretas e resposta moderada ao ponteiro. Botões com hover magnético opcional, press feedback, bordas e ícones animados; cards com elevação/tilt sutil; transições de navegação. **Nem tudo deve se mover ao mesmo tempo.**

### 3.7 Ilhas dinâmicas

Cápsulas flutuantes com expansão/retração por layout animation, por exemplo **Novo agendamento recebido**, **Pagamento confirmado**, **Novo cliente cadastrado**. Usar dados demonstrativos claramente identificados na landing page. Garantir que não bloqueiem CTAs ou formulários. Não copiar diretamente a UI proprietária de outro produto.

### 3.8 Seções de conversão

Adicionar apresentação de funcionalidades, demonstração visual do produto, comparação de planos com dados configuráveis, perguntas frequentes e CTA final. Evitar provas sociais inventadas. Links e botões devem ter destinos funcionais.

## 4. Fluxo de contratação — telas e estados

1. **Planos:** mensal/anual, Essencial/Profissional/Premium apenas como categorias provisórias se ainda não confirmadas; diferenças, limites, preço configurável, seleção e CTA.
2. **Criar conta / Entrar:** nome, e-mail, senha; opções Google e Apple somente se integrações existirem ou como estados claramente não disponíveis. Termos e privacidade.
3. **Verificação de e-mail:** seis dígitos, reenvio, correção do endereço, mensagens de erro e expiração.
4. **Revisar e pagar:** plano, recorrência, resumo transparente, métodos cartão/Pix e boleto apenas se suportados pelo provedor real.
5. **Status do pagamento:** processando, Pix pendente com QR/código e validade, falha/expiração, retry e troca de método. Nunca marcar assinatura ativa antes da confirmação do provedor.
6. **Assinatura confirmada:** plano, período, próxima cobrança quando conhecida, CTA **Configurar minha barbearia**.

Implementar loading, erro, sucesso, estados vazios, navegação para trás, validações e persistência de progresso quando apropriado. **Não simular cobrança real como concluída.**

## 5. Onboarding pós-pagamento

Timeline horizontal persistente, com etapas completas em dourado e etapa ativa destacada:

1. **Conta:** nome, e-mail, telefone, foto opcional.
2. **Negócio:** nome da barbearia, CNPJ opcional, endereço, descrição, foto.
3. **Equipe:** adicionar/editar/remover profissionais.
4. **Serviços:** nome, duração, preço, profissionais habilitados; adicionar/editar/remover.
5. **Agenda:** dias de funcionamento, intervalos, horários, disponibilidade e conclusão.

Cada etapa deve salvar dados, permitir voltar sem perda, validar entradas e animar progressão de maneira contida. Após concluir, redirecionar ao dashboard.

## 6. Dashboard e experiência do cliente

### Admin/barbeiro

Resumo do dia, próximos agendamentos, calendário diário/semanal, clientes, equipe, serviços, configurações e notificações. Indicadores financeiros somente com dados confiáveis. Sidebar no desktop e navegação adaptada ao mobile. Priorizar velocidade, legibilidade, estados vazios úteis e ações claras.

### Cliente final

Fluxo de reserva: selecionar negócio/profissional → serviço → data/horário disponível → identificação → confirmação. Mostrar política de cancelamento configurável; **não impor taxa fixa sem regra de negócio aprovada**. Notificações e integração de calendário são fases posteriores, dependentes de backend e credenciais.

## 7. Arquitetura e tecnologias

Preferir **React + TypeScript + Vite** no frontend, **Tailwind CSS** para estrutura visual, **GSAP + ScrollTrigger** para animações de scroll e **Motion for React** para transições de UI. **Lenis** somente se necessário e compatível com acessibilidade. **Three.js / React Three Fiber** apenas para 3D real que agregue valor. **Playwright** para testes de navegação e screenshots. Backend existente, se houver, deve ser preservado e integrado; avaliar Node/Fastify/Neon conforme o projeto real, sem criar uma segunda stack desnecessária.

Organização sugerida (adaptar à base existente):

```text
src/
  app/                 # roteamento e providers
  components/ui/       # design system
  components/motion/   # primitives de animação
  features/landing/
  features/auth/
  features/billing/
  features/onboarding/
  features/dashboard/
  features/booking/
  assets/
  styles/
  lib/
  hooks/
tests/e2e/
```

Criar componentes reutilizáveis e separar conteúdo, layout, animação e lógica de negócio. Não adicionar dependências sem justificar.

## 8. AGENTS.md e skills

Crie ou atualize `AGENTS.md` na raiz com: objetivos, identidade, stack confirmada, comandos reais, regras de não regressão, acessibilidade, performance, testes e processo de revisão. Não substituir orientações existentes sem análise.

Se o ambiente suportar skills, propor/criar com autorização e conforme documentação instalada:

- `tempus-creative-direction`: composição, marca, assets, tipografia, consistência visual.
- `tempus-motion-engineer`: coreografia, GSAP, fallback, orçamento de performance.
- `tempus-visual-qa`: Playwright, screenshots, breakpoints, comparação com referências e correções.

**Não pressupor que `$skill-creator` esteja instalado.** Verifique antes de invocá-lo. MCP/Figma são opcionais e só devem ser configurados se houver integração e autorização.

## 9. Performance, acessibilidade e qualidade

- Mobile-first 390px; validar também 320px, 768px, 1024px e 1440px.
- Preferir `transform` e `opacity` para animações; evitar layout thrashing.
- Otimizar imagens (AVIF/WebP), dimensões, lazy-loading, vídeo com poster e fallback.
- Respeitar `prefers-reduced-motion`; nenhuma funcionalidade deve depender de animação.
- Contraste adequado, navegação por teclado, foco visível, labels, mensagens de erro e semântica HTML.
- Evitar overflow horizontal, CLS, scroll travado, animações sobrepostas, hydration issues e listeners sem cleanup.
- Meta de experiência: transições fluidas em dispositivos capazes, sem prometer 60 FPS universalmente.
- Conferir segurança básica de formulários, segredos fora do frontend, validação server-side e status reais do pagamento.

## 10. Método de execução e aceite

### Fase 0 — Auditoria

Inspecionar arquivos, assets, stack, rotas, referência visual, comandos, possíveis conflitos e riscos. Apresentar plano curto e iniciar fase seguinte somente com contexto suficiente.

### Fase 1 — Landing: header + hero

Implementar header responsivo, hero cinematográfica, tipografia, CTAs, animação de entrada e fallback. **Parar, testar e mostrar screenshots mobile/desktop.**

### Fase 2 — Motion storytelling

Parallax, seções de funcionalidades, transição para dashboard, carrossel, ambient motion, ilhas dinâmicas e loader condicionado a carregamento real.

### Fase 3 — Showcase

Adicionar preview interativo e 3D seletivo, se necessário, com fallback mobile.

### Fase 4 — Conversão

Planos, cadastro, verificação, checkout e estados de pagamento; integrações reais apenas quando credenciais e provedores forem definidos.

### Fase 5 — Onboarding

Implementar as cinco etapas, validações, persistência e navegação.

### Fase 6 — Dashboard e agendamento

Admin, calendário, serviços, equipe, clientes e fluxo de reserva do cliente.

### Fase 7 — Hardening

Testes E2E, responsividade, acessibilidade, performance, tratamento de erros e documentação de deploy.

**Critérios de aceite por fase:**

- Rodar build, lint e testes disponíveis; corrigir falhas introduzidas.
- Abrir a aplicação em navegador real quando possível; registrar URL local.
- Testar navegação por mouse, teclado e toque conforme o contexto.
- Capturar screenshots em mobile e desktop; comparar com referências disponíveis.
- Verificar que CTAs levam a telas corretas e que não há elementos decorativos fingindo funcionalidade.
- Relatar arquivos alterados, dependências adicionadas, testes executados, limitações e próximo passo.
- Não declarar algo testado se não foi possível testar.

## 11. Primeira instrução operacional

**Comece agora pela Fase 0 e Fase 1.** Antes de codar, mostre a auditoria resumida e o plano da hero. Em seguida, implemente a hero e navegação no repositório existente, rode a aplicação, teste em 390px e 1440px, corrija problemas visuais e reporte os resultados. Não implemente todo o SaaS em um único passo. Preserve a identidade TEMPUS e não invente assets ou integrações que não existam.
