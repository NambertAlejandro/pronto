# TEMPUS — regras permanentes

Leia TEMPUS_CODEX_MASTER_PROMPT.md integralmente. A instrução atual do proprietário autoriza um MVP funcional completo, preservando a identidade existente; integrações externas serão conectadas depois.

## Base e escopo
- Base: SGrappelli/pronto, MIT, Next.js 16 App Router, React 19, TypeScript, Tailwind 3. Preserve LICENSE e o backend Supabase original. Não migrar para Vite nem remover módulos existentes sem necessidade.
- Esta cópia de trabalho está em `tempus-pronto` dentro do workspace desta conversa. A pasta de 2026-10-27 é a origem e não deve ser sobrescrita automaticamente.
- O MVP TEMPUS usa Node 24 e SQLite nativo (`node:sqlite`) no servidor, com sessões HTTP-only. Banco em `.data/tempus.sqlite` ou `TEMPUS_DB_PATH`. Não versionar banco, sessões, senhas ou arquivos de ambiente.
- Reservas, clientes, serviços, profissionais e configurações são dados reais persistidos. A prévia comercial em /contratar continua explicitamente demonstrativa. Não exigir um pagamento simulado para usar o MVP.
- Google, Apple, cobrança, e-mails, WhatsApp e calendários externos não estão integrados. Nunca informar que um pagamento ou mensagem ocorreu sem confirmação do provedor.

## Identidade e UX
- Português brasileiro. Marca TEMPUS, slogan “Seu tempo. Seu negócio.”.
- Interface TEMPUS clara e legível: canvas platina quente #ECE7DD, cartões #FFFDF9, texto grafite #292521, secundário #625C54 e destaque dourado #8A5A18 / #B7822D, derivados da logo. Navegação grafite #292724. Reutilizar a logo oficial de public/brand. Não voltar ao azul escuro sem novo pedido do proprietário.
- Mobile-first. Alvos de toque de pelo menos 44px, campos a 16px, foco visível, labels, semântica, estados vazios, erro e carregamento. Respeitar prefers-reduced-motion.
- Preservar /contratar e seus testes. Separar CSS do MVP para não alterar o checkout anterior.
- Não inventar preços comerciais, métricas, depoimentos ou integrações ativas.

## Dados e segurança
- Toda alteração valida os dados no servidor e exige sessão do proprietário, exceto cadastro, login e reserva pública deliberadamente limitados.
- Consultas parametrizadas, isolamento por negócio, hash de senha e token, limite de tentativas, checagem de origem em mutações e respostas privadas sem cache.
- Revalidar disponibilidade e conflitos dentro de transação. Datas de agendamento são locais ao negócio (America/Sao_Paulo). Intervalos são semiabertos: um atendimento pode começar quando outro termina.
- Serviços e profissionais com histórico são arquivados. Agendamentos preservam preço e duração contratados. Valor de atendimento concluído não significa pagamento recebido.
- O banco local exige um único servidor com disco persistente; não publicar em ambiente efêmero/serverless sem migrar a persistência e configurar operação de produção.

## Comandos
- `npm run dev -- --hostname 127.0.0.1 --port 4174`
- `npm run build`, `npm run lint`, `npm run typecheck`
- `npm run test:unit` e `npm run test:tempus`
- `npm run test:mvp` para regras de negócio e persistência isolada.
- `npm run test:mvp-ui` para fluxo real e screenshots; configurar TEMPUS_BASE_URL se necessário.

## Processo
- Auditar o estado Git antes de editar e preservar alterações anteriores.
- Testar cadastro, login, logout, persistência, isolamento entre contas, conflito de horários, cancelamento, onboarding e CRUD.
- Verificar 320, 390, 768, 1024 e 1440px, teclado, movimento reduzido e telas mobile/desktop em navegador real.
- Relatar o que foi testado e limitações concretas. Não declarar validação visual ou integrações sem executar.
