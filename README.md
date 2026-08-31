# Rumo — Acompanhamento financeiro familiar

Sistema privado de acompanhamento financeiro com contas, transações, orçamento,
metas e previsões de saldo. Next.js + Supabase + Vercel.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** com design tokens próprios (ver `tailwind.config.ts` e `globals.css`)
- **Supabase** (Postgres + Auth + Row Level Security)
- **Recharts** para o gráfico de fluxo de caixa
- **Vercel** para hospedagem

## 1. Rodando localmente

```bash
npm install
cp .env.example .env.local   # depois preencha com os dados do seu projeto Supabase
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

## 2. Configurando o Supabase

1. Crie um projeto em https://supabase.com/dashboard (grátis).
2. Vá em **SQL Editor** e cole todo o conteúdo de `supabase/schema.sql`. Rode.
   Isso cria todas as tabelas, ativa Row Level Security e configura o gatilho
   que cria automaticamente uma "família" (household) e um perfil quando
   alguém se cadastra.
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key`
   para o seu `.env.local`.
4. (Opcional) Em **Authentication → Providers**, você pode desativar a
   confirmação de e-mail para testar mais rápido em uso privado/familiar.

### Por que os dados ficam seguros mesmo sendo hospedado num serviço compartilhado?

Toda tabela tem **Row Level Security** ativado: cada usuário só enxerga dados
da própria `household` (família), mesmo que o banco seja tecnicamente
compartilhado entre todos os projetos Supabase gratuitos. Isso é reforçado no
banco, não só na interface — então mesmo um bug no frontend não vaza dados de
outra família.

## 3. Subindo para o GitHub

```bash
git init
git add .
git commit -m "Setup inicial do Rumo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/rumo-app.git
git push -u origin main
```

> Recomendação: deixe o repositório **privado**, já que ele vai guardar a
> estrutura de dados financeiros da família (mesmo sem dados reais no código).

## 4. Deploy na Vercel

1. Entre em https://vercel.com/new e importe o repositório do GitHub.
2. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores do seu `.env.local`.
3. Deploy. A cada `git push` na branch `main`, a Vercel gera um novo deploy
   automaticamente.

## Estrutura do projeto

```
src/
  app/
    layout.tsx          -> fontes (Fraunces + Manrope) e metadata
    globals.css          -> todos os design tokens (cores, tema claro/escuro)
    login/page.tsx        -> autenticação (entrar / criar família)
    dashboard/page.tsx    -> busca dados reais do Supabase e monta o dashboard
  components/
    Sidebar.tsx           -> navegação responsiva (coluna no desktop, barra no mobile)
    Hero.tsx               -> saldo total com animação de contagem
    CashFlowChart.tsx      -> gráfico de fluxo de caixa (Recharts)
    TransactionList.tsx
    BudgetList.tsx
    GoalList.tsx
    ForecastCard.tsx        -> elemento visual de destaque (previsão de 30 dias)
    ThemeToggle.tsx
  lib/
    forecast.ts             -> lógica de previsão de saldo e estouro de orçamento
    format.ts                -> formatação de moeda e datas em pt-BR
    types.ts
    supabase/
      client.ts              -> cliente Supabase para uso no browser
      server.ts               -> cliente Supabase para Server Components
  middleware.ts               -> protege /dashboard e redireciona /login
supabase/
  schema.sql                  -> schema completo do banco + RLS + trigger de signup
```

## O que já está pronto (v1)

- Autenticação com criação automática de família no primeiro cadastro
- Schema completo do banco com RLS
- Dashboard responsivo com saldo, gráfico de fluxo de caixa, transações,
  orçamento, metas e previsão de 30 dias
- Modo claro/escuro
- Lógica inicial de previsão (baseada em recorrências + média histórica)

## Próximos passos sugeridos

- [ ] Telas de CRUD: adicionar/editar contas, transações, categorias, metas
- [ ] Importação de extrato (CSV/OFX)
- [ ] Agregação real de `transactions` por mês para o gráfico de fluxo de caixa
      (hoje o gráfico está com pontos zerados até existir histórico suficiente)
- [ ] Módulo de investimentos (a tabela `investments` já existe no schema)
- [ ] Exportação de relatórios (PDF/CSV)
- [ ] PWA (instalar como app no celular)
- [ ] Simulador "e se eu cortar X% de determinada categoria"

## Nota sobre o build neste ambiente de desenvolvimento

Se você rodar `npm run build` num ambiente sem acesso à internet para baixar
fontes do Google Fonts, o build vai falhar com um erro de rede — isso é
esperado e não é um bug do código. Na Vercel (e em qualquer máquina com
internet normal) o build funciona sem problema, pois o Next.js baixa as
fontes automaticamente durante o build.
