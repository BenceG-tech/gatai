import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { sphereGraph } from "@/lib/neural-sphere";

/*
 * Interactive neural sphere (Three.js via React Three Fiber). Lazy-loaded on
 * the client only, so three.js never enters the SSR bundle. Nodes and synapses
 * follow the hero's explosion-sphere language; impulses travel along the edges
 * and cascade from node to node. The sphere turns with the section's scroll
 * progress and leans toward the cursor.
 */

export type SpherePointer = { x: number; y: number; active: boolean };

type Props = {
  progress: RefObject<number>;
  pointer: RefObject<SpherePointer>;
  active: boolean;
  lite: boolean;
  onReady?: () => void;
  onContextLost?: () => void;
};

const RADIUS = 1.6;
const SILVER = new THREE.Color("#DFE5EE");
const AZURE = new THREE.Color("#2F9BFF");
const ICE = new THREE.Color("#BFE4FF");

const nodeVertex = /* glsl */ `
  attribute float aSize;
  attribute float aGlow;
  attribute vec3 aColor;
  uniform float uScale;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vGlow;
  varying float vDepth;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vDepth = smoothstep(-8.2, -4.2, mv.z);
    vColor = aColor;
    vGlow = aGlow;
    gl_PointSize = aSize * (1.0 + aGlow * 1.8) * uScale * uPixelRatio / -mv.z;
  }
`;

const nodeFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vGlow;
  varying float vDepth;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.16, d);
    float halo = smoothstep(0.5, 0.0, d) * (0.18 + 0.6 * vGlow);
    float alpha = (core * 0.9 + halo) * mix(0.22, 1.0, vDepth);
    if (alpha < 0.01) discard;
    vec3 colour = mix(vColor, vec3(1.0), clamp(vGlow * 0.55, 0.0, 1.0));
    gl_FragColor = vec4(colour, alpha);
  }
`;

type Pulse = {
  edge: number;
  t: number;
  speed: number;
  forward: boolean;
  hops: number;
};

function NeuralSphere({
  progress,
  pointer,
  lite,
}: Pick<Props, "progress" | "pointer" | "lite">) {
  const graph = useMemo(
    () =>
      sphereGraph(lite ? 220 : 420, {
        neighbours: 3,
        maxDistance: lite ? 0.62 : 0.46,
      }),
    [lite],
  );
  const group = useRef<THREE.Group>(null);
  const motion = useRef({ px: 0, py: 0, spin: 0 });

  const nodes = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const position = new Float32Array(graph.count * 3);
    const colour = new Float32Array(graph.count * 3);
    const size = new Float32Array(graph.count);
    const glow = new Float32Array(graph.count);
    for (let i = 0; i < graph.count; i++) {
      for (let k = 0; k < 3; k++)
        position[i * 3 + k] = graph.positions[i * 3 + k]! * RADIUS;
      const c = graph.azure[i] ? AZURE : SILVER;
      colour.set([c.r, c.g, c.b], i * 3);
      size[i] = (graph.azure[i] ? 1.35 : 1) * (0.85 + ((i * 7919) % 100) / 220);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colour, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    const glowAttr = new THREE.BufferAttribute(glow, 1);
    glowAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("aGlow", glowAttr);
    const material = new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      uniforms: {
        uScale: { value: lite ? 40 : 34 },
        uPixelRatio: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material, glow, glowAttr };
  }, [graph, lite]);

  const lines = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const edgeCount = graph.edges.length / 2;
    const position = new Float32Array(edgeCount * 6);
    const base = new Float32Array(edgeCount * 6);
    for (let e = 0; e < edgeCount; e++) {
      const a = graph.edges[e * 2]!;
      const b = graph.edges[e * 2 + 1]!;
      for (let k = 0; k < 3; k++) {
        position[e * 6 + k] = graph.positions[a * 3 + k]! * RADIUS;
        position[e * 6 + 3 + k] = graph.positions[b * 3 + k]! * RADIUS;
      }
      const both = graph.azure[a] && graph.azure[b];
      const c = both ? AZURE : ICE;
      const strength = both ? 0.55 : 0.26;
      base.set([c.r * strength, c.g * strength, c.b * strength], e * 6);
      base.set([c.r * strength, c.g * strength, c.b * strength], e * 6 + 3);
    }
    const colour = new Float32Array(base);
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    const colourAttr = new THREE.BufferAttribute(colour, 3);
    colourAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("color", colourAttr);
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return {
      geometry,
      material,
      base,
      colour,
      colourAttr,
      glow: new Float32Array(edgeCount),
    };
  }, [graph]);

  const pulses = useMemo(() => {
    const count = lite ? 28 : 64;
    const geometry = new THREE.BufferGeometry();
    const position = new Float32Array(count * 3);
    const colour = new Float32Array(count * 3);
    const size = new Float32Array(count).fill(1.6);
    const glow = new Float32Array(count).fill(0.6);
    const edgeCount = graph.edges.length / 2;
    const list: Pulse[] = Array.from({ length: count }, (_, i) => ({
      edge: (i * 7919) % edgeCount,
      t: (i * 0.137) % 1,
      speed: 0.7 + ((i * 31) % 17) / 17,
      forward: i % 2 === 0,
      hops: 0,
    }));
    list.forEach((_, i) => {
      const c = i % 3 === 0 ? new THREE.Color("#FFFFFF") : AZURE;
      colour.set([c.r, c.g, c.b], i * 3);
    });
    const posAttr = new THREE.BufferAttribute(position, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", posAttr);
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colour, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geometry.setAttribute("aGlow", new THREE.BufferAttribute(glow, 1));
    const material = nodes.material.clone();
    return { geometry, material, list, position, posAttr };
  }, [graph, lite, nodes.material]);

  const core = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(47,155,255,0.55)");
      g.addColorStop(0.35, "rgba(47,155,255,0.16)");
      g.addColorStop(1, "rgba(47,155,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useEffect(
    () => () => {
      nodes.geometry.dispose();
      nodes.material.dispose();
      lines.geometry.dispose();
      lines.material.dispose();
      pulses.geometry.dispose();
      pulses.material.dispose();
      core.map?.dispose();
      core.dispose();
    },
    [nodes, lines, pulses, core],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const g = group.current;
    if (!g) return;
    const ratio = state.gl.getPixelRatio();
    nodes.material.uniforms["uPixelRatio"]!.value = ratio;
    pulses.material.uniforms["uPixelRatio"]!.value = ratio;

    // lean toward the cursor, turn with scroll and time
    const m = motion.current;
    const ptr = pointer.current;
    const ease = 1 - Math.exp(-dt * 3.2);
    m.px += ((ptr?.active ? ptr.x : 0) - m.px) * ease;
    m.py += ((ptr?.active ? ptr.y : 0) - m.py) * ease;
    m.spin += dt * 0.07;
    g.rotation.y =
      (progress.current ?? 0) * Math.PI * 1.6 + m.spin + m.px * 0.5;
    g.rotation.x = 0.35 + m.py * 0.32;
    g.position.x = m.px * 0.16;
    g.position.y = -m.py * 0.12;

    // impulses travel along synapses and cascade into neighbouring edges
    const { edges, adjacency, positions } = graph;
    const edgeCount = edges.length / 2;
    pulses.list.forEach((pulse, i) => {
      pulse.t += pulse.speed * dt;
      if (pulse.t >= 1) {
        const a = edges[pulse.edge * 2]!;
        const b = edges[pulse.edge * 2 + 1]!;
        const arrived = pulse.forward ? b : a;
        nodes.glow[arrived] = 1;
        const options = adjacency[arrived] ?? [];
        const next =
          pulse.hops < 6 && options.length > 1 && Math.random() < 0.82
            ? options[(Math.random() * options.length) | 0]!
            : (Math.random() * edgeCount) | 0;
        pulse.hops = next === pulse.edge ? 0 : pulse.hops + 1;
        pulse.edge = next;
        pulse.forward =
          edges[next * 2] === arrived || edges[next * 2 + 1] !== arrived;
        pulse.t = 0;
        pulse.speed = 0.7 + Math.random() * 1.1;
      }
      const a = edges[pulse.edge * 2]!;
      const b = edges[pulse.edge * 2 + 1]!;
      const from = pulse.forward ? a : b;
      const to = pulse.forward ? b : a;
      for (let k = 0; k < 3; k++) {
        const p0 = positions[from * 3 + k]!;
        const p1 = positions[to * 3 + k]!;
        pulses.position[i * 3 + k] = (p0 + (p1 - p0) * pulse.t) * RADIUS;
      }
      lines.glow[pulse.edge] = 1;
    });
    pulses.posAttr.needsUpdate = true;

    const decayNode = Math.exp(-dt * 2.4);
    for (let i = 0; i < nodes.glow.length; i++)
      nodes.glow[i] = (nodes.glow[i] ?? 0) * decayNode;
    nodes.glowAttr.needsUpdate = true;

    const decayEdge = Math.exp(-dt * 3.5);
    for (let e = 0; e < edgeCount; e++) {
      const glow = (lines.glow[e] = (lines.glow[e] ?? 0) * decayEdge);
      for (let v = 0; v < 2; v++) {
        const o = e * 6 + v * 3;
        lines.colour[o] = lines.base[o]! + AZURE.r * glow * 0.75;
        lines.colour[o + 1] = lines.base[o + 1]! + AZURE.g * glow * 0.75;
        lines.colour[o + 2] = lines.base[o + 2]! + AZURE.b * glow * 0.75;
      }
    }
    lines.colourAttr.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <sprite material={core} scale={[RADIUS * 2.6, RADIUS * 2.6, 1]} />
      <lineSegments geometry={lines.geometry} material={lines.material} />
      <points geometry={nodes.geometry} material={nodes.material} />
      <points geometry={pulses.geometry} material={pulses.material} />
    </group>
  );
}

export default function NeuralSphereScene({
  progress,
  pointer,
  active,
  lite,
  onReady,
  onContextLost,
}: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, lite ? 1.5 : 2]}
      camera={{ position: [0, 0, 6.2], fov: 38, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost?.();
        });
        onReady?.();
      }}
      aria-hidden="true"
    >
      <NeuralSphere progress={progress} pointer={pointer} lite={lite} />
    </Canvas>
  );
}
