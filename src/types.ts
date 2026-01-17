/** Type definitions for the Dermalytics SDK */

export interface Category {
  name: string;
  slug: string;
}

export interface ConditionSafety {
  condition: string;
  severity: string;
  reason: string;
}

export interface Ingredient {
  name: string;
  severity: string;
  description?: string;
  category: Category;
  condition_safeties: ConditionSafety[];
  synonyms: string[];
}

export interface IngredientAnalysis {
  name: string;
  severity: string;
  category: string;
}

export interface Warning {
  ingredient: string;
  condition: string;
  severity: string;
  reason: string;
}

export interface ProductAnalysis {
  safety_status: string;
  ingredients: IngredientAnalysis[];
  warnings: Warning[];
}

export interface DermalyticsConfig {
  apiKey: string;
  baseUrl?: string;
}
