import { useLayoutEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { createBloodstreamMesh } from '../three/BloodstreamGeometry';
import { createParticles } from '../three/particles';

export interface BloodstreamAPI {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  addFrameCallback: (id: string, cb: (delta: number, elapsed: number) => void) => void;
  removeFrameCallback: (id: string) => void;
}

export interface BloodstreamCanvasProps {
  className?: string;
}

class BloodstreamManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  
  private clock: THREE.Clock;
  private frameCallbacks: Map<string, (delta: number, elapsed: number) => void>;
  private animationFrameId: number | null = null;
  private container: HTMLDivElement;
  private tubeMesh: THREE.Mesh;
  private particlesGroup: THREE.Group;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.frameCallbacks = new Map();
    this.clock = new THREE.Clock();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1a0000, 0.04);
    this.scene.background = new THREE.Color(0x0a0000);

    const aspect = width / height;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 5;

    this.tubeMesh = createBloodstreamMesh();
    this.scene.add(this.tubeMesh);

    this.particlesGroup = createParticles();
    this.scene.add(this.particlesGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffaaaa, 2.0, 50);
    this.camera.add(pointLight);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x0a0000);
    
    container.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.8,
      0.8,
      0.1
    );
    this.composer.addPass(bloomPass);

    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  public addFrameCallback = (id: string, cb: (delta: number, elapsed: number) => void) => {
    this.frameCallbacks.set(id, cb);
  };

  public removeFrameCallback = (id: string) => {
    this.frameCallbacks.delete(id);
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    const tubeMaterial = this.tubeMesh.material as THREE.MeshPhysicalMaterial;
    if (tubeMaterial.userData.shader) {
      tubeMaterial.userData.shader.uniforms.time.value = elapsed;
    }

    if (this.particlesGroup.userData.update) {
      this.particlesGroup.userData.update(delta);
    }

    this.frameCallbacks.forEach(cb => cb(delta, elapsed));
    this.composer.render();
  };

  public dispose = () => {
    window.removeEventListener('resize', this.onResize);
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.frameCallbacks.clear();
    
    if (this.container && this.renderer.domElement && this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }

    this.scene.traverse((object: THREE.Object3D) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    this.composer.dispose();
    this.renderer.dispose();
  };
}

export const BloodstreamCanvas = forwardRef<BloodstreamAPI, BloodstreamCanvasProps>(
  ({ className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const managerRef = useRef<BloodstreamManager | null>(null);

    useImperativeHandle(ref, () => {
      return {
        get scene() { return managerRef.current!.scene; },
        get camera() { return managerRef.current!.camera; },
        get renderer() { return managerRef.current!.renderer; },
        addFrameCallback: (id, cb) => managerRef.current?.addFrameCallback(id, cb),
        removeFrameCallback: (id) => managerRef.current?.removeFrameCallback(id),
      };
    }, []);

    useLayoutEffect(() => {
      if (!containerRef.current) return;

      const newManager = new BloodstreamManager(containerRef.current);
      managerRef.current = newManager;

      return () => {
        newManager.dispose();
        managerRef.current = null;
      };
    }, []);

    return (
      <div 
        ref={containerRef} 
        className={`relative w-full h-full overflow-hidden ${className}`}
      />
    );
  }
);

BloodstreamCanvas.displayName = 'BloodstreamCanvas';
