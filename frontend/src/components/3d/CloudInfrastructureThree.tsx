import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { CloudResource } from '../../types/cloudscaler';
import { Sparkles, Server } from 'lucide-react';

interface CloudInfrastructureThreeProps {
  resources?: CloudResource[];
  onSelectResource?: (resource: CloudResource) => void;
}

export const CloudInfrastructureThree: React.FC<CloudInfrastructureThreeProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 50);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);

    // 3. Floating 3D Cloud Particles Group
    const cloudGroup = new THREE.Group();
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Generate points clustered in a cloud ellipsoid shape
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 4.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.6; // wider in X
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7; // squished in Y
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.9;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    const cloudParticles = new THREE.Points(geometry, material);
    cloudGroup.add(cloudParticles);
    scene.add(cloudGroup);

    // 4. Floating 3D Resource Nodes
    const nodeData = [
      { id: 'mock-app-vm-1', name: 'mock-app-vm-1', color: 0xf59e0b, pos: new THREE.Vector3(-3.2, 0.8, 1.2) },   // Amber
      { id: 'mock-web-server-1', name: 'mock-web-server-1', color: 0x10b981, pos: new THREE.Vector3(0, -1.2, -0.5) },    // Green
      { id: 'mock-db-server-1', name: 'mock-db-server-1', color: 0xef4444, pos: new THREE.Vector3(3.2, 1.0, 1.0) }      // Red
    ];

    const sphereGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const nodesMeshes: THREE.Mesh[] = [];

    nodeData.forEach((data) => {
      const mat = new THREE.MeshPhongMaterial({
        color: data.color,
        emissive: data.color,
        emissiveIntensity: 0.4,
        shininess: 90
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.copy(data.pos);
      cloudGroup.add(mesh);
      nodesMeshes.push(mesh);
    });

    // 5. Connecting Lines between nodes
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.2,
      gapSize: 0.1,
      opacity: 0.4,
      transparent: true
    });

    for (let i = 0; i < nodeData.length; i++) {
      for (let j = i + 1; j < nodeData.length; j++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([nodeData[i].pos, nodeData[j].pos]);
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        cloudGroup.add(line);
      }
    }

    // 6. Mouse Parallax Interactivity
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      // Gentle floating & rotation
      cloudGroup.rotation.y += 0.003;
      cloudGroup.rotation.x = Math.sin(Date.now() * 0.001) * 0.08;

      // Mouse Parallax smoothing
      targetX += (mouseX * 0.4 - targetX) * 0.05;
      targetY += (-mouseY * 0.4 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      // Pulse node scaling
      nodesMeshes.forEach((mesh, idx) => {
        const scale = 1 + Math.sin(Date.now() * 0.003 + idx) * 0.08;
        mesh.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 8. Resize Handler
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
      geometry.dispose();
      material.dispose();
      sphereGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-56 rounded-2xl bg-gradient-to-r from-[#0b1120] via-[#0f172a] to-[#0b1120] border border-slate-800 overflow-hidden group">
      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Subtle Top Banner */}
      <div className="absolute top-3 left-4 flex items-center gap-2 text-xs font-mono">
        <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
        <span className="text-slate-200 font-semibold">Three.js Cloud Infrastructure Mesh</span>
        <span className="text-[10px] text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded font-mono">Subtle Parallax</span>
      </div>

      {/* Node Legend Overlay */}
      <div className="absolute bottom-3 right-4 flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> VM-1</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> WEB-1</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> DB-1</span>
      </div>
    </div>
  );
};
