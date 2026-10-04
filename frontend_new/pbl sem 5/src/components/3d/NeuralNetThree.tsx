import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Brain, Sparkles } from 'lucide-react';

export const NeuralNetThree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Neural Network Layer Positions
    const layerDefs = [
      { count: 4, color: 0x38bdf8, x: -5 }, // Inputs (cyan)
      { count: 5, color: 0x818cf8, x: -1.5 }, // Hidden 1 (indigo)
      { count: 5, color: 0xc084fc, x: 1.5 }, // Hidden 2 (purple)
      { count: 2, color: 0x10b981, x: 5 } // Output (emerald)
    ];

    const sphereGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const layersNodes: THREE.Vector3[][] = [];

    // Create Nodes
    layerDefs.forEach((layer) => {
      const nodes: THREE.Vector3[] = [];
      const spacing = 1.4;
      const startY = -((layer.count - 1) * spacing) / 2;

      for (let i = 0; i < layer.count; i++) {
        const pos = new THREE.Vector3(layer.x, startY + i * spacing, (Math.random() - 0.5) * 0.8);
        nodes.push(pos);

        const mat = new THREE.MeshPhongMaterial({
          color: layer.color,
          emissive: layer.color,
          emissiveIntensity: 0.5
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.copy(pos);
        scene.add(mesh);
      }
      layersNodes.push(nodes);
    });

    // Ambient & Point Light
    const light = new THREE.PointLight(0x38bdf8, 2, 40);
    light.position.set(0, 0, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Connect Lines between adjacent layers
    const lineMat = new THREE.LineBasicMaterial({ color: 0x334155, opacity: 0.4, transparent: true });

    for (let l = 0; l < layersNodes.length - 1; l++) {
      const curr = layersNodes[l];
      const next = layersNodes[l + 1];

      curr.forEach((n1) => {
        next.forEach((n2) => {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([n1, n2]);
          const line = new THREE.Line(lineGeo, lineMat);
          scene.add(line);
        });
      });
    }

    // Mouse rotation
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const animate = () => {
      scene.rotation.y = mouseX * 0.2;
      scene.rotation.x = -mouseY * 0.2;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      lineMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-48 rounded-2xl bg-gradient-to-r from-[#0b1120] via-[#0f172a] to-[#0b1120] border border-slate-800 overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-pointer" />
      <div className="absolute top-3 left-4 flex items-center gap-2 text-xs font-mono">
        <Brain className="w-4 h-4 text-sky-400" />
        <span className="text-slate-200 font-semibold">Three.js LSTM Neural Network Visualizer</span>
        <span className="text-[10px] text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded font-mono">v2.4.1 Model</span>
      </div>
    </div>
  );
};
