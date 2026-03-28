import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { SurfaceCanvas } from './components/SurfaceCanvas';
import { SmileChart } from './components/SmileChart';
import { TermStructureChart } from './components/TermStructureChart';
import { Controls } from './components/Controls';
import { generateSurface, DEFAULT_CONFIG, formatPercent } from './lib/volatility';
import type { SurfaceConfig } from './lib/volatility';

function App() {
  const [config, setConfig] = useState<SurfaceConfig>(DEFAULT_CONFIG);
  const [rotationX, setRotationX] = useState(0.5);
  const [rotationZ, setRotationZ] = useState(-0.5);
  const [selectedExpiration, setSelectedExpiration] = useState(30);
  const [selectedStrike, setSelectedStrike] = useState(100);

  const surface = useMemo(() => generateSurface(config), [config]);

  const handleRotationChange = (x: number, z: number) => {
    setRotationX(x);
    setRotationZ(z);
  };

  // Calculate summary stats
  const allIVs = surface.flat().map((p) => p.iv);
  const minIV = Math.min(...allIVs);
  const maxIV = Math.max(...allIVs);
  const avgIV = allIVs.reduce((sum, iv) => sum + iv, 0) / allIVs.length;

  // ATM IV
  const atmRow = surface[Math.floor(surface.length / 2)];
  const atmIV = atmRow ? atmRow[Math.floor(atmRow.length / 2)]?.iv || avgIV : avgIV;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-[hsl(var(--primary))]" />
            IV Surface Visualizer
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 text-center text-base">
            Interactive visualization of the implied volatility surface
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="text-sm text-[hsl(var(--muted-foreground))]">ATM IV</div>
            <div className="text-2xl font-bold text-[#8b5cf6]">{formatPercent(atmIV)}</div>
          </div>
          <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Min IV</div>
            <div className="text-2xl font-bold text-[#3b82f6]">{formatPercent(minIV)}</div>
          </div>
          <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Max IV</div>
            <div className="text-2xl font-bold text-[#ef4444]">{formatPercent(maxIV)}</div>
          </div>
          <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
            <div className="text-sm text-[hsl(var(--muted-foreground))]">Spot Price</div>
            <div className="text-2xl font-bold text-[#22c55e]">${config.spotPrice}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: 3D Surface */}
          <div className="space-y-6">
            <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
              <h2 className="text-base font-medium text-[hsl(var(--foreground))] mb-4">
                3D Volatility Surface
              </h2>
              <SurfaceCanvas
                surface={surface}
                config={config}
                rotationX={rotationX}
                rotationZ={rotationZ}
                onRotationChange={handleRotationChange}
              />
            </div>

            {/* 2D Slices */}
            <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
              <SmileChart config={config} selectedExpiration={selectedExpiration} />
            </div>
            <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
              <TermStructureChart config={config} selectedStrike={selectedStrike} />
            </div>
          </div>

          {/* Right: Controls & Info */}
          <div className="space-y-6">
            <Controls
              config={config}
              onConfigChange={setConfig}
              selectedExpiration={selectedExpiration}
              onExpirationChange={setSelectedExpiration}
              selectedStrike={selectedStrike}
              onStrikeChange={setSelectedStrike}
            />

            {/* Info */}
            <div className="p-5 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))]">
              <h3 className="text-base font-medium text-[hsl(var(--foreground))] mb-3">
                About the IV Surface
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                The implied volatility surface shows how IV varies across different strikes (x-axis) and expirations (y-axis).
                <strong className="text-[#ef4444]"> Skew</strong> refers to higher IV for OTM puts (lower strikes) due to downside protection demand.
                <strong className="text-[#f59e0b]"> Smile</strong> is the convex shape with higher IV in the wings.
                <strong className="text-[#22c55e]"> Term structure</strong> shows how IV changes with time to expiration.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-8">
          Simulated IV surface for educational purposes. Uses simplified volatility model.
        </p>
      </main>

      <footer className="border-t border-[hsl(var(--border))] mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Made by Sharvil Saxena
        </div>
      </footer>
    </div>
  );
}

export default App;
