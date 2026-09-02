import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Visão geral",
    body: "O painel principal: seu saldo total (somando todas as contas + transações lançadas), receitas e despesas do mês, o gráfico de fluxo de caixa dos últimos 6 meses e a previsão de 30 dias.",
  },
  {
    title: "Contas",
    body: "Cada conta é um 'lugar' onde seu dinheiro está — Nubank, carteira física, cartão de crédito. Escolha o banco por cor (não usamos logos oficiais, só a identidade visual). Toda transação fica amarrada a uma conta.",
  },
  {
    title: "Categorias",
    body: "Organizam suas transações por tipo de gasto ou receita. Já vêm 13 categorias prontas (Alimentação, Transporte, Salário etc.), e você pode criar as suas com nome, emoji e cor.",
  },
  {
    title: "Lançamento rápido",
    body: "O atalho 'Entrou / Saiu' no topo do painel — pra registrar um valor em poucos segundos, sem abrir formulário nenhum. Editável depois, se precisar corrigir algo.",
  },
  {
    title: "Despesas",
    body: "Diferente de uma transação solta: uma despesa tem data de vencimento e status (pendente, pago, atrasado). Pensada pra fatura de cartão, boletos e contas de casa.",
  },
  {
    title: "Orçamento",
    body: "Defina um limite mensal por categoria. O painel mostra o quanto já foi consumido de cada limite, e a previsão avisa se o ritmo atual vai estourar algum orçamento antes do fim do mês.",
  },
  {
    title: "Metas",
    body: "Objetivos financeiros com valor alvo, prazo e foto de capa opcional. Cada meta mostra uma frase que muda conforme o progresso — início, meio do caminho, ou reta final.",
  },
  {
    title: "Recorrências",
    body: "Salário, aluguel, assinaturas — tudo que se repete (semanal, mensal ou anual). O sistema gera a transação sozinho quando a data chega, sem você precisar lançar na mão todo mês.",
  },
  {
    title: "Previsão",
    body: "Projeta seu saldo dos próximos 30 dias combinando as recorrências cadastradas com a média histórica de gastos soltos. Não é machine learning — é média móvel — mas já ajuda a antecipar se o mês fecha no azul.",
  },
  {
    title: "Investimentos",
    body: "Cadastre renda fixa, ações/FIIs, cripto ou fundos — os campos mudam conforme o tipo. Ações e cripto têm tabela de compra e venda com preço médio e lucro calculados automaticamente. Renda fixa projeta o valor atual por juros compostos.",
  },
  {
    title: "Calculadoras de investimento",
    body: "Três perguntas comuns respondidas na hora: quanto vou ter guardando por mês, quanto rendo aplicando um valor a X% ao mês, e quanto lucro tenho se vender uma ação a um preço específico.",
  },
  {
    title: "Simulador \"e se\"",
    body: "Escolha uma categoria e um percentual de corte pra ver, na hora, o quanto isso mudaria sua previsão de 30 dias. Bom pra decidir onde vale a pena economizar.",
  },
  {
    title: "Importar CSV",
    body: "Se você já tem um histórico em planilha, importe de uma vez em vez de digitar transação por transação. O arquivo precisa ter colunas de data, descrição e valor.",
  },
  {
    title: "Reconhecimento e privacidade",
    body: "Depois do primeiro login, o app lembra quem você é nesse navegador e só pede a senha nas próximas vezes. Seus dados são protegidos por Row Level Security no banco — ninguém além de você acessa suas informações, nem em tese.",
  },
];

export default function GuidePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 min-w-0 px-5 md:px-11 pt-7 pb-24 md:pb-14 max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" strokeWidth="1.8" stroke="currentColor">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </Link>

        <h1 className="font-display text-2xl font-medium mb-1">Como funciona</h1>
        <p className="text-sm text-ink-soft mb-8">Um resumo rápido de cada parte do app.</p>

        <div>
          {SECTIONS.map((s) => (
            <div key={s.title} className="py-5 border-b border-hairline last:border-none">
              <h3 className="text-[15px] font-bold mb-1.5">{s.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
