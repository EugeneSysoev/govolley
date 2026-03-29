"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Float,
  ContactShadows,
} from "@react-three/drei";
import { VolleyballModel } from "./volleyball-model";

interface VolleyballSceneProps {
  inView: boolean;
}

export default function VolleyballScene({ inView }: VolleyballSceneProps) {
  if (!inView) return null;

  return (
    <Suspense
      fallback={
        <div className="text-brand-lime animate-pulse text-xs tracking-widest">
          INITIALIZING 3D...
        </div>
      }
    >
      <Canvas flat dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 42 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -2, -5]} intensity={1} color="#c2ff3f" />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />
        <Float speed={4} floatIntensity={3} rotationIntensity={0.5}>
          <VolleyballModel position={[0, 0, 0]} scale={2.3} />
        </Float>
        <Environment preset="city" />
        <OrbitControls
          enableZoom={false}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </Suspense>
  );
}
