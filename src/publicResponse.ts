/** Public response allowlist. Keep identical across API, SDK and website releases.
 * Unknown properties are discarded recursively; objects cannot masquerade as scalar fields.
 * Missing fields are preserved as missing rather than populated with invented values.
 */
type Rule = string | readonly Rule[] | { readonly [key: string]: Rule };
export const responseFields = {
  "ingredient": {
    "name": "string",
    "severity": "string",
    "category": "string?",
    "synonyms": [
      "string"
    ],
    "credits_remaining": "number",
    "description": "string?",
    "comedogenicity": "number?",
    "irritancy": "number?",
    "formula": "string?",
    "molecular_weight": "number?",
    "cas_no": "string?",
    "ec_no": "string?",
    "ph_eur_name": "string?",
    "functions": [
      "string"
    ],
    "trait_flags": [
      "string"
    ]
  },
  "analysis": {
    "safety_status": "string",
    "ingredients": [
      {
        "name": "string",
        "found": "boolean",
        "severity": "string",
        "category": "string?",
        "description": "string?",
        "comedogenicity": "number?",
        "irritancy": "number?",
        "formula": "string?",
        "molecular_weight": "number?",
        "cas_no": "string?",
        "ec_no": "string?",
        "ph_eur_name": "string?",
        "functions": [
          "string"
        ],
        "trait_flags": [
          "string"
        ]
      }
    ],
    "credits_remaining": "number"
  },
  "ingredientSearch": {
    "data": [
      {
        "id": "string",
        "name": "string",
        "cas_no": "string?",
        "ec_no": "string?",
        "functions": [
          "string"
        ],
        "ratings_available": {
          "comedogenicity": "boolean",
          "irritancy": "boolean"
        },
        "record_updated_at": "string"
      }
    ],
    "pagination": {
      "limit": "number",
      "offset": "number",
      "next_offset": "number?"
    },
    "credits_remaining": "number"
  },
  "productSearch": {
    "data": [
      {
        "id": "string",
        "name": "string",
        "brand": "string?",
        "category": "string?",
        "ingredients_count": "number",
        "area": "string?",
        "traits_cache": [
          "string"
        ],
        "key_ingredient_tags": [
          "string"
        ]
      }
    ],
    "pagination": {
      "limit": "number",
      "offset": "number",
      "next_offset": "number?"
    },
    "credits_remaining": "number"
  },
  "product": {
    "id": "string",
    "name": "string",
    "brand": "string?",
    "category": "string?",
    "ingredients_count": "number",
    "area": "string?",
    "traits_cache": [
      "string"
    ],
    "key_ingredient_tags": [
      "string"
    ],
    "ingredients": [
      {
        "id": "string",
        "name": "string",
        "position": "number?"
      }
    ],
    "credits_remaining": "number"
  }
} as const;
export type ResponseKind = keyof typeof responseFields;

function project(value: unknown, rule: Rule): unknown {
  if (typeof rule === 'string') {
    if (value === null && rule.endsWith('?')) return null;
    const type = rule.replace('?', '');
    if (typeof value !== type || (typeof value === 'number' && !Number.isFinite(value))) {
      throw new Error('Invalid public response format');
    }
    return value;
  }
  if (Array.isArray(rule)) {
    if (!Array.isArray(value)) throw new Error('Invalid public response format');
    return value.map(item => project(item, rule[0]));
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid public response format');
  const source = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(rule)) {
    if (Object.prototype.hasOwnProperty.call(source, key)) result[key] = project(source[key], child);
  }
  return result;
}

export function publicResponse(value: unknown, kind: ResponseKind): Record<string, unknown> {
  return project(value, responseFields[kind]) as Record<string, unknown>;
}
