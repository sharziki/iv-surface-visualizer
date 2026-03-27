import { useRef, useEffect } from 'react';
import type { SurfaceConfig } from '../lib/volatility';
import { getTermStructure, formatPercent } from '../lib/volatility';

interface TermStructureChartProps {
  config: SurfaceConfig;
  selectedStrike: number;
}

export function TermStructureChart({ config, selectedStrike }: TermStructureChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const termStructure = getTermStructure(selectedStrike, config);
  const minIV = Math.min(...termStructure.map((p) => p.iv));
  const maxIV = Math.max(...termStructure.map((p) => p.iv));

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

    // Draw the term structure curve
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const ivRange = maxIV - minIV;
    const ivPadding = ivRange * 0.1;
    const adjustedMinIV = minIV - ivPadding;
    const adjustedMaxIV = maxIV + ivPadding;

    termStructure.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * (i / (termStructure.length - 1));
      const y =
        height -
        padding -
        ((point.iv - adjustedMinIV) / (adjustedMaxIV - adjustedMinIV)) * (height - 2 * padding);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw points
    termStructure.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * (i / (termStructure.length - 1));
      const y =
        height -
        padding -
        ((point.iv - adjustedMinIV) / (adjustedMaxIV - adjustedMinIV)) * (height - 2 * padding);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (expirations)
    ctx.fillText('7d', padding, height - 10);
    ctx.fillText('180d', width / 2, height - 10);
    ctx.fillText('365d', width - padding, height - 10);

    // Y-axis labels (IV)
    ctx.textAlign = 'right';
    ctx.fillText(formatPercent(adjustedMaxIV), padding - 5, padding + 4);
    ctx.fillText(formatPercent(adjustedMinIV), padding - 5, height - padding + 4);

    // Title
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Term Structure ($${selectedStrike.toFixed(0)} Strike)`, padding, 20);
  }, [termStructure, selectedStrike, minIV, maxIV]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full rounded-lg"
    />
  );
}
