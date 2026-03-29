/** Type definitions for the Dermalytics SDK */

export type Severity = 'safe' | 'low_risk' | 'moderate_risk' | 'high_risk';

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
  category: string | null;
  synonyms: string[];
  credits_remaining: number;
}

export interface IngredientAnalysis extends IngredientDetailFields {
  name: string;
  found: boolean;
  severity: Severity;
  category: string | null;
}

export interface AnalyzeRequest {
  ingredients: string[];
}

export interface AnalyzeResponse {
  safety_status: Severity;
  ingredients: IngredientAnalysis[];
  credits_remaining: number;
}

/** Error payload shape returned by the API on 4xx/5xx responses */
export interface ErrorBody {
  code: string;
  message: string;
  type?: string;
}

export interface ErrorResponse {
  error: ErrorBody;
}

export interface DermalyticsConfig {
  apiKey: string;
  baseUrl?: string;
}
