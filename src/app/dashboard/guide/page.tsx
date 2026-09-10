import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { GuideAccordion } from "@/components/GuideAccordion";

const ESSENTIALS: { title: string; body: string }[] = [
  {
    title: "O que eu vejo quando abro o app?",
    body: "O painel principal: quanto você tem, quanto entrou e saiu esse mês, seus gastos recentes, contas a pagar, orçamento e metas. Quem está começando vê um checklist guiando os primeiros passos.",
  },
  {
    title: "Como registro onde meu dinheiro está guardado?",
    body: "Em 'Contas', cadastre cada lugar onde seu dinheiro fica — carteira, conta do banco, cartão de crédito. Escolha o banco pela cor (não usamos o logo oficial). Toda transação fica ligada a uma conta.",
  },
  {
    title: "Como organizo meus gastos por tipo?",
    body: "Categorias. Já vêm 13 prontas (Alimentação, Transporte, Salário etc.), e você pode criar as suas com nome, emoji e cor.",
  },
  {
    title: "Como registro um gasto ou recebimento rapidinho?",
    body: "No topo do painel principal: toque numa categoria, digite o valor, pronto. Também dá pra dividir uma conta com outra pessoa (registra só a sua parte) e anexar uma foto do comprovante.",
  },
  {
    title: "Onde vejo tudo que eu já registrei?",
    body: "Em 'Transações' — a lista completa, com busca e filtro por categoria, conta ou período. É onde você edita ou apaga algo lançado errado.",
  },
  {
    title: "Como vejo meus gastos organizados por dia, semana, mês ou ano?",
    body: "Em 'Extrato' — as mesmas transações de 'Transações', só que organizadas como um extrato de banco de verdade, com setas pra andar no tempo. Use 'Transações' quando quiser buscar algo específico; use 'Extrato' quando quiser ver o panorama de um período.",
  },
  {
    title: "Como não esqueço de pagar uma conta?",
    body: "'Contas a pagar' é diferente de uma transação comum: aqui você cadastra algo com data de vencimento (fatura, boleto, assinatura) e marca como pago depois. Um aviso aparece no painel quando algo está vencendo.",
  },
  {
    title: "Como defino quanto posso gastar em cada coisa?",
    body: "Orçamento — defina um limite mensal por categoria. O painel avisa se o ritmo atual for estourar esse limite antes do fim do mês.",
  },
  {
    title: "Como guardo dinheiro pra um objetivo?",
    body: "Metas — dê um nome, um valor alvo, e opcionalmente uma foto de capa. Se quiser, também dá pra convidar alguém pra contribuir junto (ver 'Parceria' nos recursos avançados).",
  },
  {
    title: "Como registro salário ou assinaturas que se repetem todo mês?",
    body: "Recorrências — cadastre uma vez (valor, frequência) e o app lança a transação sozinho quando a data chegar, sem você precisar lembrar.",
  },
  {
    title: "É seguro? Preciso digitar minha senha toda vez?",
    body: "Depois do primeiro login, o app reconhece você nesse navegador e só pede a senha — sem digitar e-mail de novo. Seus dados ficam protegidos por regras de segurança no banco: ninguém além de você acessa suas informações.",
  },
  {
    title: "Como troco minha senha ou apago minha conta?",
    body: "Em Configurações — trocar nome, trocar senha, sair de todos os dispositivos, ou excluir a conta e todos os dados permanentemente.",
  },
  {
    title: "Como instalo isso no meu celular?",
    body: "No iPhone: toque no ícone de compartilhar (⬆️) do Safari, depois 'Adicionar à Tela de Início'. No Android: menu (⋮) do Chrome, 'Adicionar à tela inicial' ou 'Instalar app'. Vira um ícone de app de verdade.",
  },
];

const ADVANCED: { title: string; body: string }[] = [
  {
    title: "Investimentos",
    body: "Opcional — só use se você já investe. Cadastre renda fixa, ações/FIIs, cripto ou fundos. Ações e cripto calculam preço médio e lucro automaticamente a partir do seu histórico de compra e venda.",
  },
  {
    title: "Calculadoras de investimento",
    body: "Três contas prontas: quanto vou ter guardando por mês, quanto rendo aplicando a X% ao mês, e quanto lucro numa venda de ação.",
  },
  {
    title: "Simulador \"e se eu cortar gastos?\"",
    body: "Escolha uma categoria e um percentual de corte pra ver o impacto na previsão dos próximos 30 dias.",
  },
  {
    title: "O que é a previsão de 30 dias?",
    body: "Uma estimativa de quanto você deve ter daqui a 30 dias, combinando suas recorrências cadastradas com a média do que você costuma gastar.",
  },
  {
    title: "O que é \"patrimônio líquido\"?",
    body: "Tudo que você tem somado: o dinheiro nas contas mais o valor atual dos seus investimentos. Só aparece se você tiver algum investimento cadastrado.",
  },
  {
    title: "Comparado ao mês passado",
    body: "No painel, mostra quais categorias de gasto subiram ou caíram em relação ao mês anterior.",
  },
  {
    title: "Comprei algo parcelado no cartão",
    body: "Em 'Transações', use \"+ Compra parcelada\" — diz o valor total e o número de vezes, e o app já lança uma parcela por mês sozinho.",
  },
  {
    title: "Fatura do cartão de crédito",
    body: "Se você configurou dia de fechamento/vencimento numa conta tipo cartão, a tela de fatura (dentro de Contas) agrupa as compras daquele ciclo e mostra quando vence.",
  },
  {
    title: "Trazer meu histórico de outro lugar",
    body: "Importar CSV — sobe uma planilha com data, descrição e valor de uma vez, em vez de digitar cada transação na mão.",
  },
  {
    title: "Tirar meus dados do app",
    body: "Em Exportar: uma planilha Excel detalhada, um relatório visual pra PDF, ou um backup técnico completo (arquivo JSON com tudo) — bom pra guardar uma cópia de segurança.",
  },
  {
    title: "Parceria",
    body: "Dentro de qualquer meta, convide alguém (por link) pra contribuir junto com você rumo ao mesmo objetivo — cada um com sua própria meta de contribuição.",
  },
  {
    title: "Família",
    body: "Diferente da parceria (um objetivo só), a família é um espaço amplo e opcional: quando duas pessoas entram na mesma família, tudo — contas, gastos, orçamento, metas — passa a aparecer compartilhado entre elas, como uma conta conjunta de verdade.",
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

        <div className="mb-10 pb-8 border-b border-hairline">
          <h1 className="font-display text-2xl font-medium mb-3">O que é o Contando Centavos?</h1>
          <p className="text-sm text-ink-soft leading-relaxed mb-3">
            É um jeito simples de acompanhar seu dinheiro: quanto entra, quanto sai, pra onde vai,
            e se vai sobrar alguma coisa no fim do mês. Você mesmo digita o que gasta e recebe —
            o app não se conecta ao seu banco de verdade, então nada acontece sozinho sem você
            saber.
          </p>
          <p className="text-sm text-ink-soft leading-relaxed mb-3">
            No dia a dia, ele serve pra três coisas: <strong>registrar</strong> (o que entrou e
            saiu), <strong>planejar</strong> (quanto você quer gastar, quanto quer guardar) e{" "}
            <strong>enxergar</strong> (se está indo bem ou precisa ajustar algo).
          </p>
          <p className="text-sm text-ink-soft leading-relaxed">
            Se você está começando agora, o painel principal tem um checklist te guiando passo a
            passo — e aqui embaixo tem uma explicação rápida de cada parte do app, separada em
            "essencial" e "avançado" (o avançado é opcional, ignore se não precisar).
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Essencial pro dia a dia
          </h2>
          <GuideAccordion sections={ESSENTIALS} />
        </div>

        <div>
          <h2 className="text-xs font-bold text-ink-faint uppercase tracking-wide mb-1">
            Recursos avançados (opcionais)
          </h2>
          <GuideAccordion sections={ADVANCED} />
        </div>
      </main>
    </div>
  );
}
