import * as THREE from 'three';
import { bloodstreamCurve } from './curve';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export function createParticles() {
  const group = new THREE.Group();


  const rbcs = createRBCs(1500);
  group.add(rbcs);


  const germs = createGerms(400);
  group.add(germs);


  const oxygen = createOxygen(800);
  group.add(oxygen);


  const platelets = createPlatelets(200);
  group.add(platelets);

  group.userData = {
    update: (delta: number) => {
      group.children.forEach((child) => {
        if (child instanceof THREE.InstancedMesh && child.userData.update) {
          child.userData.update(delta);
        }
      });
    }
  };

  return group;
}

function createRBCs(count: number) {
  const geometry = new THREE.SphereGeometry(0.2, 16, 16);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    const normalizedDist = dist / 0.2;
    const squash = 0.5 + 0.5 * Math.pow(normalizedDist, 2.0);
    positions.setY(i, y * squash * 0.4);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xaa0000,
    emissive: 0x330000,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.5,
  });

  return setupInstancedMesh(geometry, material, count, 0.05, 0.8, 1.2);
}

function createGerms(count: number) {
  const geometry = new THREE.IcosahedronGeometry(0.1, 3);
  
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x440088,
    emissive: 0x110022,
    roughness: 0.4,
    metalness: 0.3,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 };
    shader.vertexShader = `
      uniform float time;
      varying float vNoise;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      float noise = sin(position.x * 15.0 + time * 3.0) * 
                    cos(position.y * 15.0 + time * 2.0) * 
                    sin(position.z * 15.0 + time * 4.0);
      vNoise = noise;
      transformed += normal * noise * 0.04;
      `
    );

    shader.fragmentShader = `
      varying float vNoise;
      ${shader.fragmentShader}
    `.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec3 sicklyGreen = vec3(0.4, 0.7, 0.1);
      vec3 deepPurple = vec3(0.2, 0.0, 0.4);
      diffuseColor.rgb = mix(deepPurple, sicklyGreen, smoothstep(-0.5, 0.5, vNoise));
      `
    );

    material.userData.shader = shader;
  };

  const mesh = setupInstancedMesh(geometry, material, count, 0.07, 0.5, 1.5);
  
  const originalUpdate = mesh.userData.update;
  mesh.userData.update = (delta: number) => {
    originalUpdate(delta);
    if (material.userData.shader) {
      material.userData.shader.uniforms.time.value += delta;
    }
  };

  return mesh;
}

function createOxygen(count: number) {
  const sphere1 = new THREE.SphereGeometry(0.05, 8, 8);
  const sphere2 = new THREE.SphereGeometry(0.05, 8, 8);
  sphere2.translate(0.06, 0, 0);
  
  const geometry = BufferGeometryUtils.mergeGeometries([sphere1, sphere2]);
  
  const material = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    emissive: 0x4488ff,
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.8,
  });

  return setupInstancedMesh(geometry, material, count, 0.09, 0.3, 0.7);
}

function createPlatelets(count: number) {
  const geometry = new THREE.IcosahedronGeometry(0.15, 1);
  geometry.scale(1, 0.3, 1);
  
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const noise = (Math.random() - 0.5) * 0.05;
    positions.setX(i, x + noise);
    positions.setY(i, y + noise);
    positions.setZ(i, z + noise);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.0,
    transmission: 0.8,
    thickness: 0.1,
    transparent: true,
    opacity: 0.9,
  });

  return setupInstancedMesh(geometry, material, count, 0.04, 1.0, 2.0);
}

function setupInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  count: number,
  baseSpeed: number,
  minScale: number,
  maxScale: number
) {
  const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
  
  const tValues = new Float32Array(count);
  const speeds = new Float32Array(count);
  const rotSpeeds = new Float32Array(count * 2);
  const offsets: THREE.Vector3[] = [];
  const rotations: THREE.Euler[] = [];
  const scales: number[] = [];
  
  const dummy = new THREE.Object3D();
  
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    tValues[i] = t;
    speeds[i] = 0.8 + Math.random() * 0.4;
    rotSpeeds[i * 2] = Math.random() * 0.5;
    rotSpeeds[i * 2 + 1] = Math.random() * 0.3;
    
    const angle = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.5) * 2.8;
    
    offsets.push(new THREE.Vector3(
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      (Math.random() - 0.5) * 1.0
    ));
    
    rotations.push(new THREE.Euler(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    ));

    scales.push(minScale + Math.random() * (maxScale - minScale));
    
    updateInstanceMatrix(dummy, instancedMesh, i, t, offsets[i], rotations[i], scales[i]);
  }
  
  instancedMesh.instanceMatrix.needsUpdate = true;
  
  instancedMesh.userData = {
    tValues,
    offsets,
    rotations,
    scales,
    update: (delta: number) => {
      for (let i = 0; i < count; i++) {
        tValues[i] += delta * baseSpeed * speeds[i];
        
        if (tValues[i] > 1) tValues[i] -= 1;
        
        rotations[i].x += delta * rotSpeeds[i * 2];
        rotations[i].y += delta * rotSpeeds[i * 2 + 1];
        
        updateInstanceMatrix(dummy, instancedMesh, i, tValues[i], offsets[i], rotations[i], scales[i]);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
    }
  };
  
  return instancedMesh;
}

const _up = new THREE.Vector3();
const _axisX = new THREE.Vector3();
const _axisY = new THREE.Vector3();
const _localOffset = new THREE.Vector3();

function updateInstanceMatrix(
  dummy: THREE.Object3D, 
  mesh: THREE.InstancedMesh, 
  index: number, 
  t: number, 
  offset: THREE.Vector3, 
  rotation: THREE.Euler,
  scale: number
) {
  const point = bloodstreamCurve.getPointAt(t);
  const tangent = bloodstreamCurve.getTangentAt(t).normalize();
  
  _up.set(0, 1, 0);
  if (Math.abs(tangent.y) > 0.99) _up.set(1, 0, 0);
  
  _axisX.crossVectors(_up, tangent).normalize();
  _axisY.crossVectors(tangent, _axisX).normalize();
  
  _localOffset.set(0, 0, 0)
    .addScaledVector(_axisX, offset.x)
    .addScaledVector(_axisY, offset.y)
    .addScaledVector(tangent, offset.z);
    
  dummy.position.copy(point).add(_localOffset);
  dummy.rotation.copy(rotation);
  dummy.scale.setScalar(scale);
  
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}
