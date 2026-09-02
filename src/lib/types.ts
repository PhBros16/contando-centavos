export type Account = {
  id: string;
  household_id: string;
  name: string;
  type: "corrente" | "poupanca" | "cartao" | "carteira" | "investimento";
  initial_balance: number;
  color: string;
  institution: string | null;
  archived: boolean;
};

export type Category = {
  id: string;
  household_id: string;
  name: string;
  kind: "receita" | "despesa";
  color: string;
  icon: string;
  parent_id: string | null;
};

export type Transaction = {
  id: string;
  household_id: string;
  account_id: string;
  category_id: string | null;
  profile_id: string | null;
  recurring_rule_id: string | null;
  description: string;
  amount: number;
  occurred_at: string;
  notes: string | null;
  category?: Pick<Category, "name" | "color" | "icon">;
};

export type Budget = {
  id: string;
  household_id: string;
  category_id: string;
  month: string;
  limit_amount: number;
  category?: Pick<Category, "name">;
  used?: number;
};

export type Goal = {
  id: string;
  household_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  color: string;
  photo_url: string | null;
};

export type RecurringRule = {
  id: string;
  household_id: string;
  account_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  frequency: "semanal" | "mensal" | "anual";
  next_occurrence: string;
  active: boolean;
};

export type Profile = {
  id: string;
  household_id: string;
  full_name: string;
  avatar_url: string | null;
  avatar_color: string;
};

export type Bill = {
  id: string;
  household_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  due_date: string;
  status: "pendente" | "pago" | "atrasado";
  recurring: boolean;
  category?: Pick<Category, "name">;
};

export type AssetType = "renda_fixa" | "acao" | "fundo" | "cripto" | "outro";

export type RendaFixaDetails = {
  rate_pct: number;
  rate_period: "mensal" | "anual";
  start_date: string;
};

export type AcaoDetails = {
  ticker: string;
  current_price: number;
};

export type FundoDetails = {
  rate_pct?: number;
};

export type Investment = {
  id: string;
  household_id: string;
  name: string;
  asset_type: AssetType;
  invested_amount: number;
  current_value: number;
  details: Record<string, unknown>;
  updated_at: string;
};

export type InvestmentOperationRow = {
  id: string;
  household_id: string;
  investment_id: string;
  type: "compra" | "venda";
  quantity: number;
  price: number;
  operation_date: string;
};

export type MonthlyFlowPoint = {
  month: string;
  net: number;
};
