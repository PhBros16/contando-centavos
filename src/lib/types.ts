export type Account = {
  id: string;
  household_id: string;
  name: string;
  type: "corrente" | "poupanca" | "cartao" | "carteira" | "investimento";
  initial_balance: number;
  color: string;
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

export type MonthlyFlowPoint = {
  month: string;
  net: number;
};
