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
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-[hsl(var(--primary))]" />
            IV Surface Visualizer
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Interactive visualization of the implied volatility surface
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">ATM IV</div>
            <div className="text-xl font-bold text-[#8b5cf6]">{formatPercent(atmIV)}</div>
          </div>
          <div className="p-3 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Min IV</div>
            <div className="text-xl font-bold text-[#3b82f6]">{formatPercent(minIV)}</div>
          </div>
          <div className="p-3 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Max IV</div>
            <div className="text-xl font-bold text-[#ef4444]">{formatPercent(maxIV)}</div>
          </div>
          <div className="p-3 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <div className="text-xs text-[hsl(var(--muted-foreground))]">Spot Price</div>
            <div className="text-xl font-bold text-[#22c55e]">${config.spotPrice}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Surface */}
          <div className="lg:col-span-2">
            <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
              <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">
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
          </div>

          {/* Controls */}
          <div className="lg:col-span-1">
            <Controls
              config={config}
              onConfigChange={setConfig}
              selectedExpiration={selectedExpiration}
              onExpirationChange={setSelectedExpiration}
              selectedStrike={selectedStrike}
              onStrikeChange={setSelectedStrike}
            />
          </div>
        </div>

        {/* 2D Slices */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <SmileChart config={config} selectedExpiration={selectedExpiration} />
          </div>
          <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
            <TermStructureChart config={config} selectedStrike={selectedStrike} />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">
            About the IV Surface
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            The implied volatility surface shows how IV varies across different strikes (x-axis) and expirations (y-axis).
            <strong className="text-[#ef4444]"> Skew</strong> refers to higher IV for OTM puts (lower strikes) due to downside protection demand.
            <strong className="text-[#f59e0b]"> Smile</strong> is the convex shape with higher IV in the wings.
            <strong className="text-[#22c55e]"> Term structure</strong> shows how IV changes with time to expiration.
          </p>
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
          Simulated IV surface for educational purposes. Uses simplified volatility model.
        </p>

        <footer className="mt-8 py-4 text-center text-xs text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))]">
          Made by{' '}
          <a 
            href="https://github.com/sharziki" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[hsl(var(--primary))] hover:underline"
          >
            Sharvil Saxena
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
