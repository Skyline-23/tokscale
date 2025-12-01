/**
 * Pricing data fetcher using LiteLLM as source
 */

const LITELLM_PRICING_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

const TIERED_THRESHOLD = 200_000;

export interface LiteLLMModelPricing {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  cache_creation_input_token_cost?: number;
  cache_read_input_token_cost?: number;
  input_cost_per_token_above_200k_tokens?: number;
  output_cost_per_token_above_200k_tokens?: number;
  cache_creation_input_token_cost_above_200k_tokens?: number;
  cache_read_input_token_cost_above_200k_tokens?: number;
}

export type PricingDataset = Record<string, LiteLLMModelPricing>;

// Fallback pricing (per 1M tokens) for models not in LiteLLM
const FALLBACK_PRICING: Record<string, LiteLLMModelPricing> = {
  "claude-opus-4-5": {
    input_cost_per_token: 15 / 1_000_000,
    output_cost_per_token: 75 / 1_000_000,
    cache_read_input_token_cost: 1.5 / 1_000_000,
    cache_creation_input_token_cost: 18.75 / 1_000_000,
  },
  "claude-opus-4": {
    input_cost_per_token: 15 / 1_000_000,
    output_cost_per_token: 75 / 1_000_000,
    cache_read_input_token_cost: 1.5 / 1_000_000,
    cache_creation_input_token_cost: 18.75 / 1_000_000,
  },
  "claude-sonnet-4-5": {
    input_cost_per_token: 3 / 1_000_000,
    output_cost_per_token: 15 / 1_000_000,
    cache_read_input_token_cost: 0.3 / 1_000_000,
    cache_creation_input_token_cost: 3.75 / 1_000_000,
  },
  "claude-sonnet-4": {
    input_cost_per_token: 3 / 1_000_000,
    output_cost_per_token: 15 / 1_000_000,
    cache_read_input_token_cost: 0.3 / 1_000_000,
    cache_creation_input_token_cost: 3.75 / 1_000_000,
  },
  "claude-haiku-4-5": {
    input_cost_per_token: 0.8 / 1_000_000,
    output_cost_per_token: 4 / 1_000_000,
    cache_read_input_token_cost: 0.08 / 1_000_000,
    cache_creation_input_token_cost: 1 / 1_000_000,
  },
};

export class PricingFetcher {
  private pricingData: PricingDataset | null = null;

  async fetchPricing(): Promise<PricingDataset> {
    if (this.pricingData) return this.pricingData;

    const response = await fetch(LITELLM_PRICING_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch pricing: ${response.status}`);
    }

    this.pricingData = (await response.json()) as PricingDataset;
    return this.pricingData;
  }

  getModelPricing(modelID: string): LiteLLMModelPricing | null {
    if (!this.pricingData) return null;

    // Direct lookup
    if (this.pricingData[modelID]) {
      return this.pricingData[modelID];
    }

    // Try with provider prefix
    const prefixes = ["anthropic/", "openai/", "google/", "bedrock/"];
    for (const prefix of prefixes) {
      if (this.pricingData[prefix + modelID]) {
        return this.pricingData[prefix + modelID];
      }
    }

    // Fuzzy matching
    const lowerModelID = modelID.toLowerCase();
    for (const [key, pricing] of Object.entries(this.pricingData)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes(lowerModelID) || lowerModelID.includes(lowerKey)) {
        return pricing;
      }
    }

    // Fallback pricing
    for (const [family, pricing] of Object.entries(FALLBACK_PRICING)) {
      if (modelID.toLowerCase().includes(family.toLowerCase())) {
        return pricing;
      }
    }

    return null;
  }

  calculateCost(
    tokens: {
      input: number;
      output: number;
      reasoning?: number;
      cacheRead: number;
      cacheWrite: number;
    },
    pricing: LiteLLMModelPricing
  ): number {
    const calculateTiered = (
      count: number,
      baseRate?: number,
      tieredRate?: number
    ): number => {
      if (!baseRate || count === 0) return 0;
      if (count <= TIERED_THRESHOLD || !tieredRate) {
        return count * baseRate;
      }
      return (
        TIERED_THRESHOLD * baseRate + (count - TIERED_THRESHOLD) * tieredRate
      );
    };

    const inputCost = calculateTiered(
      tokens.input,
      pricing.input_cost_per_token,
      pricing.input_cost_per_token_above_200k_tokens
    );

    const outputCost = calculateTiered(
      tokens.output + (tokens.reasoning || 0),
      pricing.output_cost_per_token,
      pricing.output_cost_per_token_above_200k_tokens
    );

    const cacheWriteCost = calculateTiered(
      tokens.cacheWrite,
      pricing.cache_creation_input_token_cost,
      pricing.cache_creation_input_token_cost_above_200k_tokens
    );

    const cacheReadCost = calculateTiered(
      tokens.cacheRead,
      pricing.cache_read_input_token_cost,
      pricing.cache_read_input_token_cost_above_200k_tokens
    );

    return inputCost + outputCost + cacheWriteCost + cacheReadCost;
  }
}
