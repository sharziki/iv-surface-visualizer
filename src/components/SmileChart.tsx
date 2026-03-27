import { useRef, useEffect } from 'react';
import type { SurfaceConfig } from '../lib/volatility';
import { getVolatilitySmile, formatPercent } from '../lib/volatility';

interface SmileChartProps {
  config: SurfaceConfig;
  selectedExpiration: number;
}

export function SmileChart({ config, selectedExpiration }: SmileChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const smile = getVolatilitySmile(selectedExpiration, config);
  const minIV = Math.min(...smile.map((p) => p.iv));
  const maxIV = Math.max(...smile.map((p) => p.iv));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = 'hsl(217, 33%, 12%)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw the smile curve
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const ivRange = maxIV - minIV;
    const ivPadding = ivRange * 0.1;
    const adjustedMinIV = minIV - ivPadding;
    const adjustedMaxIV = maxIV + ivPadding;

    smile.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * (i / (smile.length - 1));
      const y =
        height -
        padding -
        ((point.iv - adjustedMinIV) / (adjustedMaxIV - adjustedMinIV)) * (height - 2 * padding);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw points
    smile.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * (i / (smile.length - 1));
      const y =
        height -
        padding -
        ((point.iv - adjustedMinIV) / (adjustedMaxIV - adjustedMinIV)) * (height - 2 * padding);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();
    });

    // Draw ATM line
    const atmIndex = Math.floor(smile.length / 2);
    const atmX = padding + (width - 2 * padding) * (atmIndex / (smile.length - 1));
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(atmX, padding);
    ctx.lineTo(atmX, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (strikes)
    const firstStrike = smile[0].strike;
    const lastStrike = smile[smile.length - 1].strike;
    ctx.fillText(`$${firstStrike.toFixed(0)}`, padding, height - 10);
    ctx.fillText(`$${config.spotPrice.toFixed(0)} (ATM)`, atmX, height - 10);
    ctx.fillText(`$${lastStrike.toFixed(0)}`, width - padding, height - 10);

    // Y-axis labels (IV)
    ctx.textAlign = 'right';
    ctx.fillText(formatPercent(adjustedMaxIV), padding - 5, padding + 4);
    ctx.fillText(formatPercent(adjustedMinIV), padding - 5, height - padding + 4);

    // Title
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Volatility Smile (${selectedExpiration} DTE)`, padding, 20);
  }, [smile, config, selectedExpiration, minIV, maxIV]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full rounded-lg"
    />
  );
}
