/** Type definitions for the Dermalytics SDK */

export type Severity = 'safe' | 'low_risk' | 'moderate_risk' | 'high_risk';

export type TraitFlag =
  | 'drying_alcohol'
  | 'fragrance'
  | 'paraben'
  | 'silicone'
  | 'sulfate'
  | 'oil'
  | 'fungal_acne_trigger'
  | 'reef_unsafe'
  | 'eu_allergen';

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
  trait_flags: TraitFlag[];
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
  apiKey?: string;
  baseUrl?: string;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
}

export interface ProductSearchOptions extends SearchOptions {
  brand?: string;
  ingredient?: string;
}

export interface SearchPagination {
  limit: number;
  offset: number;
  next_offset: number | null;
}

export interface IngredientSearchItem {
  id: string;
  name: string;
  cas_no: string | null;
  ec_no: string | null;
  functions: string[];
  ratings_available: { comedogenicity: boolean; irritancy: boolean };
  record_updated_at: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  ingredients_count: number;
  area: 'face' | 'eyes' | 'lips' | 'body' | 'hair' | 'nails' | null;
  /** Stored derived tags, not independently verified product claims. */
  traits_cache: string[];
  key_ingredient_tags: string[];
}

export interface ProductIngredientItem {
  id: string;
  name: string;
  position: number | null;
}

export interface IngredientSearchResponse {
  data: IngredientSearchItem[];
  pagination: SearchPagination;
  credits_remaining: number;
}

export interface ProductSearchResponse {
  data: ProductSummary[];
  pagination: SearchPagination;
  credits_remaining: number;
}

export interface ProductResponse extends ProductSummary {
  ingredients: ProductIngredientItem[];
  credits_remaining: number;
}
