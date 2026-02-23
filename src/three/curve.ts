import * as THREE from 'three';

const numPoints = 50;
const points: THREE.Vector3[] = [];

for (let i = 0; i < numPoints; i++) {
  const t = i / numPoints;
  const angle = t * Math.PI * 2;
  
  const x = Math.sin(angle) * 30 + Math.sin(angle * 4) * 8;
  const y = Math.sin(angle * 3) * 15 + Math.cos(angle * 2) * 5;
  const z = Math.cos(angle) * 80 + Math.sin(angle * 5) * 10;
  
  points.push(new THREE.Vector3(x, y, z));
}

export const bloodstreamCurve = new THREE.CatmullRomCurve3(points, true);
