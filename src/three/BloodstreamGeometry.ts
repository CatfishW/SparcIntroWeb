import * as THREE from 'three';
import { bloodstreamCurve } from './curve';

export function createBloodstreamMesh() {
  const geometry = new THREE.TubeGeometry(bloodstreamCurve, 400, 3, 24, true);

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x3a0000),
    emissive: new THREE.Color(0x1a0000),
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    side: THREE.BackSide,
    roughness: 0.4,
    metalness: 0.1,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 };
    material.userData.shader = shader;

    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      // Organically pulsate/throb based on position.z and time
      float pulse = sin(position.z * 0.5 - time * 3.0) * 0.5 + 0.5;
      float throb = sin(position.z * 0.1 + time * 1.5) * 0.5;
      
      // Displace along normal to expand/contract the tube
      transformed += normal * (pulse * 0.5 + throb * 0.8);
      `
    );
  };

  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}
