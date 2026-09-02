<div align="center">

# 🪙 Contando Centavos

**Acompanhamento financeiro pessoal — contas, orçamento, metas, investimentos e previsão de saldo, tudo em um só lugar.**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://contando-centavos.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[**🔗 Ver demo ao vivo**](https://contando-centavos.vercel.app)

</div>

<!--
  Sugestão: adicione aqui 2-3 screenshots reais do app, lado a lado ou em sequência.
  Ex:
  <p align="center">
    <img src="docs/screenshots/dashboard-light.png" width="32%" />
    <img src="docs/screenshots/dashboard-dark.png" width="32%" />
    <img src="docs/screenshots/goal-card.png" width="32%" />
  </p>
-->

## O que é

Um sistema de acompanhamento financeiro pessoal construído do zero — não é um clone de nenhum
produto existente. A estética foi pensada como um "livro-caixa contemporâneo": tipografia
serifada nos números grandes, paleta autoral (papel, verde-pinho, dourado, vinho no lugar do
vermelho de despesa) e modo claro/escuro nativo.

Não conecta com bancos de verdade (Open Finance é outra categoria de projeto) — os dados
financeiros são inseridos manualmente ou importados via CSV, com foco em ser rápido de usar no
dia a dia.

## Funcionalidades

**Núcleo**
- Contas com seleção visual de banco por cor/monograma
- Categorias (13 padrão + criação livre com emoji e cor)
- Lançamento rápido ("Entrou / Saiu") e histórico completo com busca, filtro, edição e exclusão

**Planejamento**
- Orçamento mensal por categoria, com alerta de estouro projetado
- Metas com foto de capa, prazo e frases motivacionais que mudam com o progresso
- Recorrências (salário, aluguel, assinaturas) que **geram a transação sozinhas** quando a data chega
- Despesas com vencimento e status (pendente/pago/atrasado)

**Investimentos**
- Renda fixa, ações/FIIs, cripto e fundos — campos adaptados por tipo
- Tabela de compra e venda com preço médio e lucro realizado/não realizado calculados automaticamente
- Calculadoras: aportes mensais, rendimento composto, lucro estimado na venda

**Inteligência**
- Previsão de saldo para os próximos 30 dias (recorrências + média histórica)
- Simulador "e se eu cortar X% de uma categoria"

**Import/Export**
- Importação de extrato via CSV
- Exportação em Excel detalhado (transações + resumo) ou relatório visual pronto pra PDF

**Conta e segurança**
- Autenticação com reconhecimento — depois do primeiro login, o app lembra seu nome no
  navegador e só pede a senha
- Recuperação de senha por e-mail
- Configurações: trocar senha, editar nome, encerrar sessões em outros dispositivos, excluir conta
- PWA instalável, modo claro/escuro, guia de funcionalidades dentro do app

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Supabase (Postgres + Auth + Row Level Security + Storage + Edge Functions) |
| Gráficos | Recharts |
| Planilhas | SheetJS (xlsx) |
| CSV | Papaparse |
| Hospedagem | Vercel (deploy contínuo a cada push) |

## Segurança

- **Row Level Security em todas as 11 tabelas** — cada usuário só acessa os próprios dados, e
  essa regra vive no banco, não na tela
- Funções internas (`SECURITY DEFINER`) auditadas: nenhuma é executável por usuário anônimo
- Exclusão de conta implementada via **Edge Function** com JWT verificado — a chave
  administrativa do Supabase nunca é exposta ao navegador
- Storage (avatares, fotos de meta) com escrita restrita ao dono de cada arquivo

Veja `supabase/schema.sql` para o detalhe de cada política de segurança.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`.

## Configurando o Supabase

1. Crie um projeto em [supabase.com/dashboard](https://supabase.com/dashboard) (grátis).
2. No **SQL Editor**, rode todo o conteúdo de `supabase/schema.sql` — cria as tabelas, RLS,
   buckets de storage e o gatilho de boas-vindas no cadastro.
3. Em **Project Settings → API**, copie a `Project URL` e a `anon public key` para o
   `.env.local`.
4. Em **Authentication → URL Configuration**, adicione a URL do seu app (local ou produção) como
   Redirect URL, pra recuperação de senha funcionar.
5. (Opcional) Deploy da função `delete-account` (em `supabase/functions/`, se você optar por
   versioná-la) via Supabase CLI, caso queira o fluxo de exclusão de conta completo.

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nas variáveis de
   ambiente.
3. Deploy. Todo `git push` na branch `main` gera um novo deploy automático.

## Estrutura do projeto

```
src/
  app/
    login/                    -> autenticação + reconhecimento de usuário
    forgot-password/           -> recuperação de senha
    reset-password/             -> redefinir senha (link do e-mail)
    dashboard/
      page.tsx                   -> painel principal
      accounts/, categories/, bills/, budgets/, goals/, recurring/,
      investments/, import/, simulator/, export/, guide/, settings/,
      transactions/                -> uma rota por funcionalidade
  components/                        -> Sidebar, gráficos, listas, formulários
  lib/
    forecast.ts                -> previsão de saldo e alerta de orçamento
    investmentMath.ts           -> juros compostos, aportes, preço médio
    processRecurring.ts          -> motor de recorrências automáticas
    banks.ts                      -> presets visuais de banco
    supabase/                       -> clientes browser e servidor
  middleware.ts                       -> protege /dashboard
supabase/
  schema.sql                            -> schema completo + RLS + storage + triggers
```

## Roadmap

- [ ] Parcelamento de compra no cartão (ex: 10x de R$150 gerando as parcelas futuras sozinho)
- [ ] Ciclo de fatura de cartão de crédito (fechamento/vencimento agrupando transações do mês)
- [ ] Notificações de vencimento de despesa/fatura
- [ ] Dividir uma despesa entre duas ou mais pessoas
- [ ] Anexar comprovante/nota fiscal a uma transação
- [ ] Comparativo automático mês a mês por categoria ("você gastou 20% a mais em Lazer")
- [ ] Autenticação em duas etapas (2FA)
- [ ] Identidade e privacidade: ID público por usuário, sistema de Parceria (objetivo
      financeiro compartilhado) e Família (espaço amplo opcional)

## Licença

MIT — veja [LICENSE](./LICENSE).
