import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Environment, ContactShadows, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function BuildingModel() {
  const { scene } = useGLTF('/models/building/pivotal_point/scene.gltf');
  const groupRef = useRef();
  const [diffuseMap, normalMap] = useTexture([
    '/models/building/pivotal_point/textures/Material_diffuse.png',
    '/models/building/pivotal_point/textures/Material_normal.png',
  ]);

  useEffect(() => {
    diffuseMap.flipY = false;
    normalMap.flipY = false;
    diffuseMap.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: diffuseMap,
          normalMap: normalMap,
          metalness: 0.4,
          roughness: 0.35,
        });
      }
    });

    // Auto-center the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.set(-center.x, -box.min.y, -center.z);
  }, [scene, diffuseMap, normalMap]);

  return (
   <group ref={groupRef} scale={0.0006} position={[0, -2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [9, 4, 13], fov: 45 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.3} castShadow />
      <pointLight position={[-6, 3, -4]} intensity={0.8} color="#4a9eff" />

      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
          <BuildingModel />
        </Float>
        <Environment preset="city" />
      </Suspense>

      <ContactShadows position={[0, -1.99, 0]} opacity={0.5} scale={15} blur={2} far={4} />

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.7} />
    </Canvas>
  );
}

export default HeroScene;