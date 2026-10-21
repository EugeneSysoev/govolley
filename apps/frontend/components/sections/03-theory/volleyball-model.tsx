"use client";

import * as THREE from "three";
import { useRef, useEffect } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export function VolleyballModel(props: ThreeElements["group"]) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF("/models/volleyball.glb");

  const mesh = nodes.defaultMaterial;
  useEffect(() => {
    if (mesh instanceof THREE.Mesh) {
      mesh.geometry.center();
    }
  }, [mesh]);

  if (!(mesh instanceof THREE.Mesh)) return null;

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={mesh.geometry}
        material={materials.Volleyball || materials.defaultMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={0.3}
      />
    </group>
  );
}

useGLTF.preload("/models/volleyball.glb");
