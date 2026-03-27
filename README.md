# IV Surface Visualizer

Interactive 3D visualization of the implied volatility surface. Explore how IV varies across different strikes and expirations in options markets.

## Features

- **3D Surface Rendering**: Rotatable visualization using Canvas 2D with perspective projection
- **Volatility Smile**: 2D cross-section showing IV across strikes for a given expiration
- **Term Structure**: 2D cross-section showing IV across expirations for a given strike
- **Interactive Controls**: Adjust surface parameters in real-time
- **Color-coded Surface**: Heat map coloring from low IV (blue) to high IV (red)

## Surface Parameters

| Parameter | Description |
|-----------|-------------|
| Spot Price | Current underlying price |
| Base Volatility | ATM implied volatility level |
| Skew Strength | Put skew intensity (higher = steeper) |
| Term Structure | IV change over time (contango/backwardation) |
| Smile Width | Wing convexity intensity |

## Visualizations

### 3D Surface
- X-axis: Strike price
- Y-axis: Days to expiration
- Z-axis: Implied volatility
- ATM line highlighted

### Volatility Smile
- Shows IV vs Strike for selected expiration
- Illustrates put skew and smile effects

### Term Structure
- Shows IV vs Expiration for selected strike
- Reveals contango or backwardation

## Key Concepts

- **Skew**: Higher IV for OTM puts due to demand for downside protection
- **Smile**: Convex shape with elevated IV in both wings
- **Term Structure**: How IV evolves with time to expiration
- **ATM IV**: At-the-money implied volatility (key benchmark)

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Lucide React icons
- Canvas API for 3D rendering

## Getting Started

```bash
npm install
npm run dev
```

## Volatility Model

Uses a simplified parametric model:

```typescript
IV = baseVol - skew * log(K/S) + smile * log(K/S)² + term * (1 - √T)
```

Where:
- `K` = Strike price
- `S` = Spot price
- `T` = Time to expiration (years)

## Use Cases

- Understanding options pricing dynamics
- Visualizing volatility skew and smile
- Exploring term structure effects
- Educational tool for derivatives concepts

## Notes

- Simulated surface for educational purposes
- Real IV surfaces are derived from market prices
- Model parameters approximate typical equity market behavior

## License

MIT
