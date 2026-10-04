import React, { useRef, useEffect, useState } from 'react';
import { CloudResource } from '../../types/cloudscaler';
import { StatusBadge } from '../common/StatusBadge';
import { Activity, Sparkles, Layers } from 'lucide-react';

interface InfrastructureNodes3DProps {
  resources: CloudResource[];
  onSelectResource?: (resource: CloudResource) => void;
}

export const InfrastructureNodes3D: React.FC<InfrastructureNodes3DProps> = ({
  resources,
  onSelectResource
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;

    // Set canvas dimensions
    const updateSize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Node 3D coordinates relative to center
    const nodes = [
      {
        id: 'mock-app-vm-1',
        name: 'mock-app-vm-1',
        status: 'UNDERUTILIZED',
        color: '#f59e0b', // amber
        baseX: -140,
        baseY: 40,
        baseZ: 60,
        cpu: 10,
        mem: 10
      },
      {
        id: 'mock-web-server-1',
        name: 'mock-web-server-1',
        status: 'OPTIMAL',
        color: '#10b981', // green
        baseX: 0,
        baseY: -70,
        baseZ: -20,
        cpu: 45,
        mem: 50
      },
      {
        id: 'mock-db-server-1',
        name: 'mock-db-server-1',
        status: 'OVERLOADED',
        color: '#ef4444', // red
        baseX: 140,
        baseY: 50,
        baseZ: 40,
        cpu: 92,
        mem: 90
      }
    ];

    // Background floating particle stars
    const particles = Array.from({ length: 45 }).map(() => ({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 200,
      z: (Math.random() - 0.5) * 200,
      size: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const render = () => {
      rotationAngle += 0.008;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw background cyber grid floor lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const cosR = Math.cos(rotationAngle * 0.3);
      const sinR = Math.sin(rotationAngle * 0.3);

      for (let i = -6; i <= 6; i++) {
        const offset = i * 40;
        ctx.beginPath();
        ctx.moveTo(centerX + offset * cosR - 200 * sinR, centerY + 90 + offset * 0.2);
        ctx.lineTo(centerX + offset * cosR + 200 * sinR, centerY + 90 + offset * 0.2);
        ctx.stroke();
      }

      // Project & Render 3D floating background particles
      particles.forEach((p) => {
        const px = p.x * Math.cos(rotationAngle * 0.5) - p.z * Math.sin(rotationAngle * 0.5);
        const pz = p.x * Math.sin(rotationAngle * 0.5) + p.z * Math.cos(rotationAngle * 0.5);
        const scale = 250 / (250 + pz);
        const screenX = centerX + px * scale;
        const screenY = centerY + p.y * scale;

        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * scale})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Project 3D node positions
      const projectedNodes = nodes.map((node) => {
        const cosA = Math.cos(rotationAngle);
        const sinA = Math.sin(rotationAngle);

        const x1 = node.baseX * cosA - node.baseZ * sinA;
        const z1 = node.baseX * sinA + node.baseZ * cosA;
        const y1 = node.baseY + Math.sin(rotationAngle * 2 + node.baseX) * 8; // Gentle floating bobbing

        const focal = 300;
        const scale = focal / (focal + z1 + 100);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y1 * scale;

        return {
          ...node,
          screenX,
          screenY,
          scale,
          z1
        };
      });

      // Sort nodes by Z depth for realistic rendering order
      projectedNodes.sort((a, b) => b.z1 - a.z1);

      // Draw 3D connecting laser beams between nodes
      ctx.lineWidth = 1.5;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i];
          const n2 = projectedNodes[j];

          const grad = ctx.createLinearGradient(n1.screenX, n1.screenY, n2.screenX, n2.screenY);
          grad.addColorStop(0, `${n1.color}66`);
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.5)');
          grad.addColorStop(1, `${n2.color}66`);

          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(n1.screenX, n1.screenY);
          ctx.lineTo(n2.screenX, n2.screenY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated signal pulse along the line
          const pulseT = (Date.now() / 1500 + i + j) % 1;
          const pulseX = n1.screenX + (n2.screenX - n1.screenX) * pulseT;
          const pulseY = n1.screenY + (n2.screenY - n1.screenY) * pulseT;

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw 3D Node Spheres & Pulsing Rings
      projectedNodes.forEach((node) => {
        const radius = Math.max(16, 26 * node.scale);

        // Outer pulsing orbital ring
        ctx.strokeStyle = `${node.color}44`;
        ctx.lineWidth = 2 * node.scale;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, radius * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // 3D Sphere Radial Gradient
        const grad = ctx.createRadialGradient(
          node.screenX - radius * 0.3,
          node.screenY - radius * 0.3,
          radius * 0.1,
          node.screenX,
          node.screenY,
          radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, node.color);
        grad.addColorStop(1, '#090d16');

        ctx.fillStyle = grad;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15 * node.scale;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = `600 ${Math.max(10, 11 * node.scale)}px "JetBrains Mono"`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.screenX, node.screenY + radius + 16);

        ctx.fillStyle = node.color;
        ctx.font = `500 ${Math.max(9, 10 * node.scale)}px "JetBrains Mono"`;
        ctx.fillText(`CPU ${node.cpu}%`, node.screenX, node.screenY + radius + 28);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div className="relative w-full h-80 rounded-2xl bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#0b1120] border border-slate-800 overflow-hidden group">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />

      {/* Top Banner Tag */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
        <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
        <span className="text-slate-200 font-semibold">3D Infrastructure Node Topology</span>
        <span className="text-[10px] text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded font-mono">Live Spatial Simulation</span>
      </div>

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
        3D Workload Orbit Active • 3 Cluster Nodes
      </div>
    </div>
  );
};
