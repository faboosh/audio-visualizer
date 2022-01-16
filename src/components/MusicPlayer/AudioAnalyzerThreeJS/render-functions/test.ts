import * as THREE from "three";
import { Camera } from "three";
import { AudioData } from "./setup";

const numBands = 50;
const numRows = 50;

const mul = 3;
const spacing = 10;
const objects: THREE.Mesh[] = [];
const fftDataList: number[][] = [];

export function setup(
  camera: THREE.Camera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  audio: AudioData
) {
  const { width, height } = getSize(renderer);
  camera.position.z = 5;

  const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  const material = new THREE.MeshBasicMaterial({
    color: "#27becc",
  });

  for (let j = 0; j < numRows; j++) {
    const zProgress = j / (numBands - 1);
    for (let i = 0; i < numBands; i++) {
      const progress = i / (numBands - 1);
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (progress - 0.5 - zProgress * 1 + zProgress) * spacing;
      cube.position.z = -zProgress * spacing + 2;
      cube.scale.set(0.05, 0.05, 0.05);
      objects.push(cube);

      // Add cube to Scene
      scene.add(cube);
    }
  }

  camera.position.y = 2;
  renderer.setClearColor(0x1d0d3d, 1);
}

const start = performance.now();
let lastPush = performance.now();

export function update(
  camera: THREE.Camera,
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  audio: AudioData
) {
  const { width, height } = getSize(renderer);
  const elapsed = performance.now() - start;
  const sinceLastPush = performance.now() - lastPush;

  // if (sinceLastPush > 1000 / 60) {
  //   lastPush = performance.now();
  if (fftDataList.length > numRows * mul) fftDataList.pop();
  const fftData = audio.getFFT({
    numBands,
    temporalSmoothing: 0.7,
    frequencySmoothing: 3,
    tilt: -1,
    exponential: 0.99,
  });

  fftDataList.unshift(fftData);

  let cubeIndex = 0;
  for (let j = 0; j < numRows; j++) {
    const fftData = fftDataList[j * mul];
    const zProgress = j / (numRows - 1);
    // const ampMod = 1 - Math.sin(progress * Math.PI * 0.5);
    const ampMod = 1;
    if (fftData) {
      for (let i = 0; i < fftData.length; i++) {
        const progress = i / fftData.length;
        const amp = fftData[i];
        const cube = objects[cubeIndex];
        cubeIndex++;

        // cube.position.z = Math.sin(elapsed * 0.001) * (progress - 0.5) * 3;
        const y = amp * ampMod;
        cube.position.y = amp * ampMod;
        const scale = amp * ampMod * 0.5 * (1 - zProgress);
        cube.scale.set(scale, scale, scale);
      }
    } else {
      console.log("break");
      break;
    }
  }
  // }

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
