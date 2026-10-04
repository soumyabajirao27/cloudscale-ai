import React, { useRef, useEffect } from 'react';
import { Brain, Cpu, TrendingUp, Sparkles } from 'lucide-react';

export const NeuralNetwork3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const updateSize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Neural Layers definition (Input -> Hidden LSTM Layer 1 -> Hidden Layer 2 -> Output)
    const layers = [
      { name: 'Telemetry Inputs', nodes: 4, color: '#38bdf8' },
      { name: 'LSTM Layer 1', nodes: 5, color: '#818cf8' },
      { name: 'LSTM Layer 2', nodes: 5, color: '#c084fc' },
      { name: 'Demand Forecast', nodes: 2, color: '#10b981' }
    ];

    const render = () => {
      time += 0.015;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Compute layer 3D coordinates
      const layerSpacing = width / (layers.length + 1);
      const layerNodes = layers.map((layer, layerIdx) => {
        const layerX = layerSpacing * (layerIdx + 1);
        const nodeSpacing = Math.min(45, (height - 80) / layer.nodes);
        const startY = (height - nodeSpacing * (layer.nodes - 1)) / 2;

        const nodesList = [];
        for (let n = 0; n < layer.nodes; n++) {
          const y = startY + n * nodeSpacing + Math.sin(time * 2 + layerIdx + n) * 3;
          const z = Math.cos(time + layerIdx * 0.5 + n) * 20;
          nodesList.push({ x: layerX, y, z, layerColor: layer.color });
        }
        return { name: layer.name, nodes: nodesList, color: layer.color };
      });

      // Draw Synaptic Connections between adjacent layers
      for (let l = 0; l < layerNodes.length - 1; l++) {
        const currentLayer = layerNodes[l];
        const nextLayer = layerNodes[l + 1];

        currentLayer.nodes.forEach((n1, i) => {
          nextLayer.nodes.forEach((n2, j) => {
            const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
            grad.addColorStop(0, `${n1.layerColor}33`);
            grad.addColorStop(1, `${n2.layerColor}33`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();

            // Animated synapse pulse
            const pulseSpeed = (time * 1.5 + i * 0.3 + j * 0.2) % 1;
            const pulseX = n1.x + (n2.x - n1.x) * pulseSpeed;
            const pulseY = n1.y + (n2.y - n1.y) * pulseSpeed;

            ctx.fillStyle = n1.layerColor;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 1.8, 0, Math.PI * 2);
            ctx.fill();
          });
        });
      }

      // Draw Layer Node Spheres & Labels
      layerNodes.forEach((layer) => {
        layer.nodes.forEach((node) => {
          ctx.fillStyle = node.layerColor;
          ctx.shadowColor = node.layerColor;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner white core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
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
    <div className="relative w-full h-56 rounded-2xl bg-gradient-to-r from-[#0b1120] via-[#0f172a] to-[#0b1120] border border-slate-800 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute top-3 left-4 flex items-center gap-2 text-xs font-mono">
        <Brain className="w-4 h-4 text-sky-400" />
        <span className="text-slate-200 font-semibold">3D LSTM Neural Network Inference Architecture</span>
        <span className="text-[10px] text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded font-mono">v2.4.1 Model</span>
      </div>
    </div>
  );
};
