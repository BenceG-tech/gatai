import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { approvedTexture } from "@/lib/approved-logo-texture";
import {
  logoStory,
  logoBoundary,
  movableLogoRegion,
  networkTarget,
  stableNoise,
} from "@/lib/logo-story";

type Props = {
  progress: RefObject<number>;
  requestFrame: RefObject<(() => void) | null>;
  active: boolean;
  lite: boolean;
  onContextLost: () => void;
};
const WIDTH = 12;
const HEIGHT = (WIDTH * 862) / 1824;
const vertexShader = `
  uniform float spread;
  attribute vec3 center;
  attribute vec3 destination;
  attribute float movable;
  attribute float seed;
  varying vec2 vUv;
  varying float moving;
  void main() {
    vUv = uv;
    moving = movable * spread;
    vec3 local = position - center;
    float a = moving * (seed - .5) * 2.4;
    float c = cos(a), s = sin(a);
    local.xz = mat2(c,-s,s,c) * local.xz;
    local.xy = mat2(c,-s,s,c) * local.xy;
    local *= 1.0 - moving * .22;
    vec3 point = mix(center, destination, moving) + local;
    point.y += sin(moving * 3.14159265) * (seed - .5) * .7;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(point,1.0);
  }
`;
const fragmentShader = `
  uniform sampler2D logo;
  varying vec2 vUv;
  varying float moving;
  void main() {
    vec4 texel = texture2D(logo, vUv);
    float light = max(texel.r,max(texel.g,texel.b));
    float alpha = smoothstep(.012,.055,light);
    if(alpha < .01) discard;
    // The exact approved artwork supplies every visible face throughout the motion.
    gl_FragColor = vec4(texel.rgb, alpha);
    #include <colorspace_fragment>
  }
`;

type Node = { origin: THREE.Vector3; target: THREE.Vector3; seed: number };
function makeSurface(image: HTMLImageElement) {
  const positions: number[] = [],
    uvs: number[] = [],
    centers: number[] = [];
  const destinations: number[] = [],
    movable: number[] = [],
    seeds: number[] = [];
  const nodes: Node[] = [];
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 121;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const cols = 60,
    rows = 30;
  const split = 40;
  // Follow the diagonal negative space between the T arm and the blue A.
  const point = (i: number, j: number) => {
    const seed = i + j * 113;
    const edge = i === 0 || i === cols || i === split || j === 0 || j === rows;
    const v = j / rows + (edge ? 0 : (stableNoise(seed + 19) - 0.5) * 0.012);
    const boundary = logoBoundary(v);
    const u =
      i <= split
        ? (i / split) * boundary
        : boundary + ((i - split) / (cols - split)) * (1 - boundary);
    return [u + (edge ? 0 : (stableNoise(seed) - 0.5) * 0.007), v];
  };
  let index = 0;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = point(i, j),
        b = point(i + 1, j),
        c = point(i, j + 1),
        d = point(i + 1, j + 1);
      for (const triangle of [
        [a, b, c],
        [b, d, c],
      ]) {
        const u = triangle.reduce((sum, p) => sum + p[0]!, 0) / 3;
        const v = triangle.reduce((sum, p) => sum + p[1]!, 0) / 3;
        const origin = new THREE.Vector3((u - 0.5) * WIDTH, (v - 0.5) * HEIGHT, 0);
        const move = movableLogoRegion(u, v) ? 1 : 0;
        const target = new THREE.Vector3(...networkTarget(origin.x, origin.y, index));
        for (const p of triangle) {
          positions.push((p[0]! - 0.5) * WIDTH, (p[1]! - 0.5) * HEIGHT, 0);
          uvs.push(p[0]!, p[1]!);
          centers.push(...origin.toArray());
          destinations.push(...target.toArray());
          movable.push(move);
          seeds.push(stableNoise(index + 41));
        }
        const px = Math.min(255, Math.max(0, Math.floor(u * 256)));
        const py = Math.min(120, Math.max(0, Math.floor((1 - v) * 121)));
        const pixel = (py * 256 + px) * 4;
        if (
          move &&
          Math.max(pixels[pixel]!, pixels[pixel + 1]!, pixels[pixel + 2]!) > 80 &&
          index % 3 === 0
        )
          nodes.push({ origin, target, seed: index });
        index++;
      }
    }
  const geometry = new THREE.BufferGeometry();
  for (const [name, data, size] of [
    ["position", positions, 3],
    ["uv", uvs, 2],
    ["center", centers, 3],
    ["destination", destinations, 3],
    ["movable", movable, 1],
    ["seed", seeds, 1],
  ] as const)
    geometry.setAttribute(name, new THREE.Float32BufferAttribute(data, size));
  geometry.computeBoundingSphere();
  // Each node connects to its three nearest neighbours, once, keeping lines local and legible.
  const pairs: [number, number][] = [];
  const seen = new Set<string>();
  nodes.forEach((node, i) => {
    const nearest = nodes
      .map((other, j) => ({
        j,
        d: i === j ? Infinity : node.target.distanceToSquared(other.target),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    nearest.forEach(({ j, d }) => {
      const key = [Math.min(i, j), Math.max(i, j)].join(":");
      if (d < 3.5 && !seen.has(key)) {
        seen.add(key);
        pairs.push([i, j]);
      }
    });
  });
  return { geometry, nodes, pairs };
}

function Story({ progress, requestFrame, active, onContextLost }: Props) {
  const { size, invalidate, gl } = useThree();
  const texture = useLoader(THREE.TextureLoader, approvedTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  const surface = useMemo(() => makeSurface(texture.image as HTMLImageElement), [texture]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { logo: { value: texture }, spread: { value: 0 } },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true,
        toneMapped: false,
      }),
    [texture],
  );
  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(surface.pairs.length * 6), 3),
    );
    return g;
  }, [surface]);
  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#66a9d6",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );
  const nodesMesh = useRef<THREE.InstancedMesh>(null);
  const facetsMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const current = useRef(0);
  const nodePositions = useMemo(() => surface.nodes.map(() => new THREE.Vector3()), [surface]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    requestFrame.current = invalidate;
    invalidate();
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      requestFrame.current = null;
    };
  }, [gl, invalidate, onContextLost, requestFrame]);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  useEffect(
    () => () => {
      surface.geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    },
    [surface, material, lineGeometry, lineMaterial],
  );

  useFrame(({ camera }, delta) => {
    if (!active) return;
    const difference = progress.current - current.current;
    current.current =
      Math.abs(difference) < 0.00005
        ? progress.current
        : current.current + difference * (1 - Math.exp(-12 * Math.min(delta, 0.05)));
    if (Math.abs(difference) >= 0.00005) invalidate();
    const pose = logoStory(current.current);
    material.uniforms["spread"]!.value = pose.spread;
    lineMaterial.opacity = pose.network * 0.42;
    const aspect = size.width / Math.max(1, size.height);
    // Locked framing: no focus zoom, no wordmark replacement, no camera fly-through.
    const distance = Math.max(9.6, 6.15 / (Math.tan(Math.PI / 10) * aspect));
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);
    surface.nodes.forEach((node, i) => {
      const p = nodePositions[i]!.copy(node.origin).lerp(node.target, pose.spread);
      p.y += Math.sin(pose.spread * Math.PI) * (stableNoise(node.seed + 41) - 0.5) * 0.7;
      dummy.position.copy(p);
      dummy.rotation.set(
        pose.spread * stableNoise(i) * 2,
        pose.spread * stableNoise(i + 7) * 3,
        pose.spread * 0.6,
      );
      const radius = (0.018 + stableNoise(i + 33) * 0.035) * pose.network;
      dummy.scale.setScalar(radius);
      dummy.updateMatrix();
      nodesMesh.current?.setMatrixAt(i, dummy.matrix);
      if (i % 7 === 0) {
        dummy.scale.set(0.09 * pose.network, 0.15 * pose.network, 0.045 * pose.network);
        dummy.updateMatrix();
        facetsMesh.current?.setMatrixAt(Math.floor(i / 7), dummy.matrix);
      }
    });
    if (nodesMesh.current) nodesMesh.current.instanceMatrix.needsUpdate = true;
    if (facetsMesh.current) facetsMesh.current.instanceMatrix.needsUpdate = true;
    const attr = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    surface.pairs.forEach(([a, b], i) => {
      const p = nodePositions[a]!,
        q = nodePositions[b]!;
      attr.setXYZ(i * 2, p.x, p.y, p.z);
      attr.setXYZ(i * 2 + 1, q.x, q.y, q.z);
    });
    attr.needsUpdate = true;
  });

  return (
    <>
      <mesh geometry={surface.geometry} material={material} frustumCulled={false} />
      <lineSegments geometry={lineGeometry} material={lineMaterial} frustumCulled={false} />
      <instancedMesh
        ref={nodesMesh}
        args={[undefined, undefined, surface.nodes.length]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial
          color="#b7d4e6"
          metalness={1}
          roughness={0.19}
          envMapIntensity={2.2}
        />
      </instancedMesh>
      <instancedMesh
        ref={facetsMesh}
        args={[undefined, undefined, Math.ceil(surface.nodes.length / 7)]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#6eacdb"
          metalness={1}
          roughness={0.13}
          envMapIntensity={2.7}
        />
      </instancedMesh>
    </>
  );
}

export default function LiquidScene(props: Props) {
  return (
    <Canvas
      frameloop={props.active ? "demand" : "never"}
      dpr={props.lite ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 12], fov: 36, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#050608", 1)}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 1, 3]} intensity={35} color="#2f9bff" />
      <pointLight position={[-5, 3, 2]} intensity={15} color="#d8e7ff" />
      <Environment resolution={props.lite ? 128 : 256}>
        <Lightformer
          intensity={5}
          position={[0, 4, 3]}
          rotation-x={Math.PI / 4}
          scale={[14, 1, 1]}
        />
        <Lightformer
          intensity={3}
          position={[-5, 0, 2]}
          rotation-y={Math.PI / 2}
          scale={[8, 1, 1]}
        />
        <Lightformer
          intensity={4}
          position={[5, -2, 1]}
          rotation-y={-Math.PI / 2}
          scale={[7, 0.6, 1]}
          color="#2f9bff"
        />
        <Lightformer
          intensity={2}
          position={[0, -4, 3]}
          rotation-x={-Math.PI / 4}
          scale={[10, 2, 1]}
        />
      </Environment>
      <Story {...props} />
    </Canvas>
  );
}
