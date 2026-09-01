# Contando Centavos

Sistema de acompanhamento financeiro pessoal com orçamento, metas, despesas
recorrentes e previsão de saldo — feito com **Next.js**, **Supabase** e
**Tailwind CSS**.

🔗 **Demo ao vivo:** [contando-centavos.vercel.app](https://contando-centavos.vercel.app)

<!--
  Sugestão: adicione aqui 2-3 screenshots reais do app.
  Ex: ![Dashboard](docs/screenshots/dashboard.png)
  Boas telas pra capturar: Visão geral (light e dark), tela de Metas com foto
  de capa, e o card de Previsão.
-->

## Funcionalidades

- **Dashboard** com saldo total, receitas/despesas do mês, gráfico de fluxo
  de caixa dos últimos 6 meses e previsão de saldo para os próximos 30 dias
- **Contas** com seleção visual de banco por cor/monograma (sem usar logos
  oficiais)
- **Categorias** — 13 categorias padrão inclusas no cadastro, mais criação
  livre com nome, emoji e cor
- **Lançamento rápido** ("Entrou / Saiu") para registrar valores em segundos
- **Despesas** com data de vencimento e status (pendente/pago/atrasado)
- **Orçamento mensal** por categoria, com alerta de estouro projetado
- **Metas** com foto de capa, prazo e frases motivacionais que mudam
  conforme o progresso
- **Recorrências** (salário, aluguel, assinaturas) que geram as transações
  sozinhas quando a data chega — sem lançamento manual todo mês
- **Simulador "e se"** — mostra o impacto de cortar X% de uma categoria na
  previsão de 30 dias
- **Importação de CSV** de extratos (colunas data/descrição/valor)
- **Autenticação com reconhecimento** — depois do primeiro login, o app
  lembra seu nome nesse navegador e só pede a senha nas próximas vezes
- **PWA instalável** — funciona como app no celular, com ícone e tela cheia
- **Modo claro/escuro** nativo
- **Guia** dentro do app explicando cada funcionalidade

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** com design tokens próprios (ver `tailwind.config.ts` e
  `globals.css`) — paleta autoral inspirada em livro-caixa/ledger, não em
  nenhum design system de terceiros
- **Supabase** (Postgres + Auth + Row Level Security + Storage)
- **Recharts** para o gráfico de fluxo de caixa
- **Papaparse** para importação de CSV
- **Vercel** para hospedagem e deploy contínuo

## Segurança

Toda tabela do banco tem **Row Level Security** ativado: cada usuário só
acessa os próprios dados, e essa regra vive no banco — não só na tela. Mesmo
um bug no frontend não vazaria dados de outra conta. Funções internas
(`SECURITY DEFINER`) têm as permissões auditadas e restritas ao mínimo
necessário. Veja `supabase/schema.sql` para o detalhe de cada política.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

## Configurando o Supabase

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard) (grátis).
2. No **SQL Editor**, cole e rode todo o conteúdo de `supabase/schema.sql`.
   Isso cria as tabelas, ativa RLS, configura os buckets de avatar/foto de
   meta e o gatilho que prepara a conta no primeiro cadastro.
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`
   para o seu `.env.local`.
4. (Opcional) Em **Authentication → Providers → Email**, desative "Confirm
   email" para testar mais rápido em uso pessoal.

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. Todo `git push` na branch `main` gera um novo deploy automático.

## Estrutura do projeto

```
src/
  app/
    layout.tsx                 -> fontes, manifest do PWA, metadata
    globals.css                 -> design tokens (cores, tema claro/escuro)
    login/page.tsx               -> autenticação + reconhecimento de usuário
    dashboard/
      page.tsx                   -> monta o painel principal com dados reais
      accounts/new/page.tsx       -> criar conta (seletor de banco)
      categories/page.tsx         -> gerenciar categorias
      bills/new/page.tsx           -> nova despesa
      budgets/new/page.tsx          -> definir orçamento mensal
      goals/new/page.tsx             -> nova meta (com foto de capa)
      recurring/new/page.tsx          -> recorrências
      import/page.tsx                  -> importação de CSV
      simulator/page.tsx                -> simulador "e se"
      guide/page.tsx                     -> guia de funcionalidades
  components/                             -> Sidebar, Hero, gráficos, listas
  lib/
    forecast.ts                -> lógica de previsão e alerta de orçamento
    processRecurring.ts         -> motor que gera transações das recorrências
    banks.ts                     -> presets visuais de banco
    supabase/                     -> clientes browser e servidor
  middleware.ts                    -> protege /dashboard
supabase/
  schema.sql                        -> schema completo + RLS + storage + triggers
```

## Roadmap

- [ ] Tela de edição/exclusão de transações (hoje só é possível criar)
- [ ] Módulo de investimentos (tabela já existe no schema)
- [ ] Exportação de relatórios (PDF/CSV)
- [ ] Identidade e privacidade: ID público por usuário, sem exposição de
      quem mais usa o sistema
- [ ] Parceria: objetivo financeiro compartilhado entre 2+ pessoas via convite
- [ ] Família: espaço amplo e opcional tipo "conta conjunta" (o `household`
      já existe no schema, hoje é 1:1 com o usuário)

## Licença

MIT — veja [LICENSE](./LICENSE).
