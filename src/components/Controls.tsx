import { Settings } from 'lucide-react';
import type { SurfaceConfig } from '../lib/volatility';
import { formatPercent } from '../lib/volatility';

interface ControlsProps {
  config: SurfaceConfig;
  onConfigChange: (config: SurfaceConfig) => void;
  selectedExpiration: number;
  onExpirationChange: (expiration: number) => void;
  selectedStrike: number;
  onStrikeChange: (strike: number) => void;
}

export function Controls({
  config,
  onConfigChange,
  selectedExpiration,
  onExpirationChange,
  selectedStrike,
  onStrikeChange,
}: ControlsProps) {
  const handleChange = (key: keyof SurfaceConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
      <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Surface Parameters
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Spot Price</span>
            <span className="text-[hsl(var(--foreground))]">${config.spotPrice}</span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            step={5}
            value={config.spotPrice}
            onChange={(e) => handleChange('spotPrice', parseInt(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--primary))]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Base Volatility</span>
            <span className="text-[hsl(var(--foreground))]">{formatPercent(config.baseVolatility)}</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={config.baseVolatility}
            onChange={(e) => handleChange('baseVolatility', parseFloat(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8b5cf6]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Skew Strength</span>
            <span className="text-[hsl(var(--foreground))]">{formatPercent(config.skewStrength)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={config.skewStrength}
            onChange={(e) => handleChange('skewStrength', parseFloat(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ef4444]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Term Structure</span>
            <span className="text-[hsl(var(--foreground))]">{formatPercent(config.termStructure)}</span>
          </div>
          <input
            type="range"
            min={-0.1}
            max={0.2}
            step={0.01}
            value={config.termStructure}
            onChange={(e) => handleChange('termStructure', parseFloat(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#22c55e]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Smile Width</span>
            <span className="text-[hsl(var(--foreground))]">{formatPercent(config.smileWidth)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.1}
            step={0.005}
            value={config.smileWidth}
            onChange={(e) => handleChange('smileWidth', parseFloat(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f59e0b]"
          />
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-4 mt-4">
          <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-3 uppercase tracking-wider">
            Slice Selection
          </h3>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[hsl(var(--muted-foreground))]">Expiration (Smile)</span>
              <span className="text-[hsl(var(--foreground))]">{selectedExpiration} days</span>
            </div>
            <input
              type="range"
              min={7}
              max={365}
              step={1}
              value={selectedExpiration}
              onChange={(e) => onExpirationChange(parseInt(e.target.value))}
              className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8b5cf6]"
            />
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[hsl(var(--muted-foreground))]">Strike (Term)</span>
              <span className="text-[hsl(var(--foreground))]">${selectedStrike.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min={config.spotPrice * 0.7}
              max={config.spotPrice * 1.3}
              step={1}
              value={selectedStrike}
              onChange={(e) => onStrikeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#22c55e]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
