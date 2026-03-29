/** Type definitions for the Dermalytics SDK */

export type Severity = 'safe' | 'low_risk' | 'moderate_risk' | 'high_risk';

export interface CategoryRef {
  name: string;
  slug: string;
}

export interface ConditionSafety {
  condition: string;
  severity: Severity;
  reason: string;
}

export interface IngredientDetailFields {
  description: string | null;
  comedogenicity: number | null;
  irritancy: number | null;
  formula: string | null;
  molecular_weight: number | null;
  cas_no: string | null;
  ec_no: string | null;
  ph_eur_name: string | null;
  functions: string[];
}

export interface IngredientResponse extends IngredientDetailFields {
  name: string;
  severity: Severity;
  categories: CategoryRef[];
  condition_safeties: ConditionSafety[];
  synonyms: string[];
  credits_remaining: number;
}

export interface IngredientAnalysis extends IngredientDetailFields {
  name: string;
  found: boolean;
  severity: Severity;
  category: string | null;
}

export interface Warning {
  ingredient: string;
  condition: string;
  severity: Severity;
  reason: string;
}

export interface AnalyzeResponse {
  safety_status: Severity;
  ingredients: IngredientAnalysis[];
  warnings: Warning[];
  credits_remaining: number;
}

export interface DermalyticsConfig {
  apiKey: string;
  baseUrl?: string;
}
