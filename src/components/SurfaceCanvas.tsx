import { useRef, useEffect, useState } from 'react';
import type { SurfacePoint, SurfaceConfig } from '../lib/volatility';
import { ivToColor } from '../lib/volatility';

interface SurfaceCanvasProps {
  surface: SurfacePoint[][];
  config: SurfaceConfig;
  rotationX: number;
  rotationZ: number;
  onRotationChange: (x: number, z: number) => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function SurfaceCanvas({
  surface,
  rotationX,
  rotationZ,
  onRotationChange,
}: SurfaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Find IV range for color mapping
  const allIVs = surface.flat().map((p) => p.iv);
  const minIV = Math.min(...allIVs);
  const maxIV = Math.max(...allIVs);

  // Project 3D point to 2D canvas coordinates
  const project = (point: Point3D, width: number, height: number): { x: number; y: number } => {
    // Apply rotations
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);

    // Rotate around Z axis
    let x = point.x * cosZ - point.y * sinZ;
    let y = point.x * sinZ + point.y * cosZ;
    let z = point.z;

    // Rotate around X axis
    const newY = y * cosX - z * sinX;
    const newZ = y * sinX + z * cosX;
    y = newY;
    z = newZ;

    // Simple perspective projection
    const scale = 200;
    const perspective = 800;
    const factor = perspective / (perspective + z);

    return {
      x: width / 2 + x * scale * factor,
      y: height / 2 - y * scale * factor,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'hsl(222, 47%, 5%)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;

    // Convert surface to 3D points
    const numRows = surface.length;
    const numCols = surface[0]?.length || 0;

    if (numRows === 0 || numCols === 0) return;

    // Normalize coordinates to [-1, 1]
    const getPoint3D = (row: number, col: number): Point3D => {
      const point = surface[row][col];
      const x = (col / (numCols - 1)) * 2 - 1;
      const y = (row / (numRows - 1)) * 2 - 1;
      const z = ((point.iv - minIV) / (maxIV - minIV)) * 0.8;
      return { x, y, z };
    };

    // Draw surface as colored quads
    const quads: Array<{
      points: Array<{ x: number; y: number }>;
      avgZ: number;
      color: string;
      surfacePoint: SurfacePoint;
    }> = [];

    for (let i = 0; i < numRows - 1; i++) {
      for (let j = 0; j < numCols - 1; j++) {
        const p1 = getPoint3D(i, j);
        const p2 = getPoint3D(i, j + 1);
        const p3 = getPoint3D(i + 1, j + 1);
        const p4 = getPoint3D(i + 1, j);

        const proj1 = project(p1, width, height);
        const proj2 = project(p2, width, height);
        const proj3 = project(p3, width, height);
        const proj4 = project(p4, width, height);

        const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
        const avgIV = (surface[i][j].iv + surface[i][j + 1].iv + surface[i + 1][j + 1].iv + surface[i + 1][j].iv) / 4;

        quads.push({
          points: [proj1, proj2, proj3, proj4],
          avgZ,
          color: ivToColor(avgIV, minIV, maxIV),
          surfacePoint: surface[i][j],
        });
      }
    }

    // Sort by depth (painter's algorithm)
    quads.sort((a, b) => a.avgZ - b.avgZ);

    // Draw quads
    for (const quad of quads) {
      ctx.beginPath();
      ctx.moveTo(quad.points[0].x, quad.points[0].y);
      for (let k = 1; k < quad.points.length; k++) {
        ctx.lineTo(quad.points[k].x, quad.points[k].y);
      }
      ctx.closePath();
      ctx.fillStyle = quad.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw axes
    const origin = project({ x: -1.2, y: -1.2, z: 0 }, width, height);
    const xEnd = project({ x: 0.2, y: -1.2, z: 0 }, width, height);
    const yEnd = project({ x: -1.2, y: 0.2, z: 0 }, width, height);
    const zEnd = project({ x: -1.2, y: -1.2, z: 1 }, width, height);

    ctx.lineWidth = 2;

    // X axis (Strike)
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(xEnd.x, xEnd.y);
    ctx.stroke();

    // Y axis (Expiration)
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(yEnd.x, yEnd.y);
    ctx.stroke();

    // Z axis (IV)
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(zEnd.x, zEnd.y);
    ctx.stroke();

    // Labels
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Strike', xEnd.x + 5, xEnd.y);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Expiry', yEnd.x - 10, yEnd.y - 10);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('IV', zEnd.x - 20, zEnd.y - 5);

    // Draw ATM line
    const atmCol = Math.floor(numCols / 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let i = 0; i < numRows; i++) {
      const p = project(getPoint3D(i, atmCol), width, height);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }, [surface, rotationX, rotationZ, minIV, maxIV]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      onRotationChange(
        Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationX + dy * 0.01)),
        rotationZ + dx * 0.01
      );
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={600}
        height={450}
        className="w-full rounded-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Color legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-2 p-2 bg-[hsl(var(--card))/0.8] rounded-lg">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          {(minIV * 100).toFixed(0)}%
        </span>
        <div
          className="w-24 h-3 rounded"
          style={{
            background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(34, 197, 94), rgb(234, 179, 8), rgb(239, 68, 68))',
          }}
        />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          {(maxIV * 100).toFixed(0)}%
        </span>
      </div>

      <div className="absolute bottom-2 right-2 text-xs text-[hsl(var(--muted-foreground))]">
        Drag to rotate
      </div>
    </div>
  );
}
