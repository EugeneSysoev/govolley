"use client";

import * as THREE from "three";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function VolleyballModel(props: any) {
  const group = useRef<THREE.Group>(null);

  const { nodes, materials } = useGLTF("/models/volleyball.glb") as any;

  if (!nodes || !nodes.defaultMaterial) {
    console.error("Объект defaultMaterial не найден в модели!");
    return null;
  }

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.defaultMaterial.geometry}
        material={materials.Volleyball || materials.defaultMaterial}
        onUpdate={(self) => self.geometry.center()}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={0.3}
      />
    </group>
  );
}

useGLTF.preload("/models/volleyball.glb");
