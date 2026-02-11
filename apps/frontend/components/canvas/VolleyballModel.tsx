"use client";

import * as THREE from "three";
import React, { useRef } from "react";
import { useGLTF, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function VolleyballModel(props: any) {
  const group = useRef<THREE.Group>(null);

  const { nodes, materials } = useGLTF("/models/volleyball.glb") as any;



  if (!nodes || !nodes.defaultMaterial) {
    console.error("Объект defaultMaterial не найден в модели!");
    return null;
  }

  return (
    <Float speed={5} floatIntensity={6}>
      <group ref={group} {...props} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.defaultMaterial.geometry}
          material={materials.Volleyball}
          onUpdate={(self) => self.geometry.center()}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={0.3}
        />
      </group>
    </Float>
  );
}
