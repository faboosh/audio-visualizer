import * as THREE from "three";
import { AudioData } from "./setup";

const numBands = 15;

const objects: THREE.Mesh[] = [];

export function setup(
  camera: THREE.Camera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  audio: AudioData
) {
  const { width, height } = getSize(renderer);
  camera.position.z = 5;

  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshBasicMaterial({
    color: "#27becc",
  });
  const spacing = 5;

  for (let i = 0; i < numBands; i++) {
    const progress = i / (numBands - 1);
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = (progress - 0.5) * spacing;
    cube.position.z = 0;
    cube.scale.y = 0.1;
    objects.push(cube);

    // Add cube to Scene
    scene.add(cube);
  }
  camera.position.y = 2;
  renderer.setClearColor(0x1d0d3d, 1);
}

const start = performance.now();

export function update(
  camera: THREE.Camera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  audio: AudioData
) {
  const { width, height } = getSize(renderer);
  const elapsed = performance.now() - start;

  const fftData = audio.getFFT({
    numBands,
    temporalSmoothing: 0.4,
    frequencySmoothing: 3,
    tilt: -0.5,
    exponential: 0.99,
  });

  for (let i = 0; i < fftData.length; i++) {
    const progress = i / fftData.length;
    const amp = fftData[i];
    const cube = objects[i];

    // cube.position.z = Math.sin(elapsed * 0.001) * (progress - 0.5) * 3;

    cube.scale.y = amp;
  }

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  // Render the scene
  renderer.render(scene, camera);

  // console.log(size);
}

function getSize(renderer: THREE.WebGLRenderer) {
  const size = new THREE.Vector2(0, 0);
  renderer.getSize(size);
  const height = size.y;
  const width = size.x;
  return {
    width,
    height,
  };
}
