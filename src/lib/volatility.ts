export interface SurfaceConfig {
  spotPrice: number;
  baseVolatility: number;
  skewStrength: number;
  termStructure: number;
  smileWidth: number;
}

export interface SurfacePoint {
  strike: number;
  expiration: number;
  iv: number;
  moneyness: number;
}

export const DEFAULT_CONFIG: SurfaceConfig = {
  spotPrice: 100,
  baseVolatility: 0.20,
  skewStrength: 0.15,
  termStructure: 0.05,
  smileWidth: 0.02,
};

// Generate strikes around the spot price
export function generateStrikes(spotPrice: number, numStrikes: number = 15): number[] {
  const strikes: number[] = [];
  const minStrike = spotPrice * 0.7;
  const maxStrike = spotPrice * 1.3;
  const step = (maxStrike - minStrike) / (numStrikes - 1);

  for (let i = 0; i < numStrikes; i++) {
    strikes.push(minStrike + i * step);
  }

  return strikes;
}

// Generate expirations in days
export function generateExpirations(numExpirations: number = 10): number[] {
  const expirations: number[] = [];
  const minDays = 7;
  const maxDays = 365;
  const step = (maxDays - minDays) / (numExpirations - 1);

  for (let i = 0; i < numExpirations; i++) {
    expirations.push(Math.round(minDays + i * step));
  }

  return expirations;
}

// Calculate implied volatility using a simplified model
// Models the volatility smile/skew and term structure
export function calculateIV(
  strike: number,
  expiration: number,
  config: SurfaceConfig
): number {
  const { spotPrice, baseVolatility, skewStrength, termStructure, smileWidth } = config;

  // Moneyness (log-moneyness)
  const moneyness = Math.log(strike / spotPrice);

  // Time to expiration in years
  const T = expiration / 365;

  // Volatility smile/skew component
  // Skew: lower strikes have higher IV (put skew)
  const skewComponent = -skewStrength * moneyness;

  // Smile component: convexity in the wings
  const smileComponent = smileWidth * moneyness * moneyness;

  // Term structure: volatility typically decreases with time (contango)
  // But can increase for short-term (backwardation)
  const termComponent = termStructure * (1 - Math.sqrt(T));

  // Combined IV
  let iv = baseVolatility + skewComponent + smileComponent + termComponent;

  // Ensure IV is positive and reasonable
  iv = Math.max(0.05, Math.min(1.0, iv));

  return iv;
}

// Generate the full IV surface
export function generateSurface(config: SurfaceConfig): SurfacePoint[][] {
  const strikes = generateStrikes(config.spotPrice);
  const expirations = generateExpirations();
  const surface: SurfacePoint[][] = [];

  for (const expiration of expirations) {
    const row: SurfacePoint[] = [];
    for (const strike of strikes) {
      const iv = calculateIV(strike, expiration, config);
      const moneyness = Math.log(strike / config.spotPrice);
      row.push({ strike, expiration, iv, moneyness });
    }
    surface.push(row);
  }

  return surface;
}

// Get volatility smile for a specific expiration
export function getVolatilitySmile(
  expiration: number,
  config: SurfaceConfig
): { strike: number; iv: number }[] {
  const strikes = generateStrikes(config.spotPrice, 20);
  return strikes.map((strike) => ({
    strike,
    iv: calculateIV(strike, expiration, config),
  }));
}

// Get term structure for a specific strike
export function getTermStructure(
  strike: number,
  config: SurfaceConfig
): { expiration: number; iv: number }[] {
  const expirations = generateExpirations(20);
  return expirations.map((expiration) => ({
    expiration,
    iv: calculateIV(strike, expiration, config),
  }));
}

// Color mapping for IV values
export function ivToColor(iv: number, minIV: number, maxIV: number): string {
  const normalized = (iv - minIV) / (maxIV - minIV);

  // Blue (low IV) -> Green -> Yellow -> Red (high IV)
  if (normalized < 0.33) {
    const t = normalized / 0.33;
    const r = Math.round(59 * (1 - t) + 34 * t);
    const g = Math.round(130 * (1 - t) + 197 * t);
    const b = Math.round(246 * (1 - t) + 94 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized < 0.66) {
    const t = (normalized - 0.33) / 0.33;
    const r = Math.round(34 * (1 - t) + 234 * t);
    const g = Math.round(197 * (1 - t) + 179 * t);
    const b = Math.round(94 * (1 - t) + 8 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (normalized - 0.66) / 0.34;
    const r = Math.round(234 * (1 - t) + 239 * t);
    const g = Math.round(179 * (1 - t) + 68 * t);
    const b = Math.round(8 * (1 - t) + 68 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Format percentage
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
