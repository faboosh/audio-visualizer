import * as PIXI from "pixi.js";
import * as THREE from "three";
import {
  getScaledFFT,
  getTiltedFFT,
  expScale,
  interpolateFFTBands,
} from "./audioUtils";

let camera: THREE.Camera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

export function ThreeJSAudio(
  threeJSMount,
  audioMount,
  setupFunction,
  updateFunction
) {
  const audio = setupAudio(audioMount);

  setup();

  function setup() {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      200
    );
    camera.position.z = 1;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(update);
    threeJSMount.appendChild(renderer.domElement);
    setupFunction(camera, scene, renderer, audio);
  }

  function update(delta) {
    updateFunction(camera, scene, renderer, audio, delta);
  }

  return function unmount() {
    threeJSMount.removeChild(renderer.domElement);
  };
}

export type AudioData = {
  analyser: AnalyserNode;
  dataArray: Uint8Array;
  bufferLength: number;
  getFFT: ({
    numBands,
    frequencyScale,
    exponential,
    temporalSmoothing,
    frequencySmoothing,
    tilt,
  }: {
    numBands?: number;
    frequencyScale?: number[][];
    exponential?: number;
    temporalSmoothing?: number;
    frequencySmoothing?: number;
    tilt?: number;
  }) => number[];
};

let context: AudioContext, src;

export function setupAudio(audioElem): AudioData {
  context = context || new AudioContext();
  src = src || context.createMediaElementSource(audioElem);
  const analyser = context.createAnalyser();
  const FFT_SIZE = 16384;

  src.connect(analyser);
  analyser.connect(context.destination);
  analyser.fftSize = FFT_SIZE;

  const bufferLength = analyser.frequencyBinCount;
  let dataArray = new Uint8Array(bufferLength);
  let prevFFTBands = null;

  function frequencyToIndex(freq: number = 0, dataArray) {
    const freqProgress = freq / (context.sampleRate / 2);
    const numIndicies = dataArray.length - 1;
    return Math.floor(freqProgress * numIndicies);
  }

  function getFrequencyFromProgress(progress, frequencyScale) {
    const [closestFreq, closestProgress, index] = frequencyScale.reduce(
      (prev, curr, i) => {
        const [prevFreq, prevProgress] = prev;
        const [currFreq, currProgress] = curr;
        return Math.abs(currProgress - progress) <
          Math.abs(prevProgress - progress)
          ? [currFreq, currProgress, i]
          : [prevFreq, prevProgress, prev[2] ?? 0];
      }
    );

    if (closestProgress == progress) return closestFreq;

    const [nextFreq, nextProgress] =
      progress > closestProgress
        ? frequencyScale[index + 1]
        : frequencyScale[index - 1];
    const progressRange = nextProgress - closestProgress;
    const change = (progress - closestProgress) / progressRange;
    const freqRange = nextFreq - closestFreq;
    return closestFreq + freqRange * change;
  }

  function getFFT({
    numBands = 100,
    frequencyScale = [
      [30, 0],
      [100, 0.1],
      [300, 0.4],
      [700, 0.5],
      [10000, 1],
    ],
    exponential = 1,
    temporalSmoothing = 0.8,
    frequencySmoothing = 0,
    tilt = 1,
  }): number[] {
    analyser.getByteFrequencyData(dataArray);
    let fftBands = [];

    for (let i = 0; i < numBands; i++) {
      const progress = i / (numBands - 1);
      const frequency = getFrequencyFromProgress(progress, frequencyScale);
      const index = frequencyToIndex(frequency, dataArray);

      fftBands.push(dataArray[index]);
    }

    fftBands = getTiltedFFT(fftBands, { tilt });

    fftBands = fftBands.map((band) => {
      const amp = expScale(band, 0, 255, exponential) / 255;
      return amp > 1 ? 1 : amp;
    });

    fftBands = interpolateFFTBands(fftBands, { frequencySmoothing });

    if (prevFFTBands) {
      fftBands = fftBands.map((band, i) => {
        const prevBand = prevFFTBands[i];
        const diff = band - prevBand;

        return prevBand + diff * (1 - temporalSmoothing);
      });
    }

    prevFFTBands = fftBands;

    return fftBands;
  }

  return {
    analyser,
    dataArray,
    bufferLength,
    getFFT,
  };
}

function indexToFrequency(sampleRate, dataArray, i) {
  const progress = i / (dataArray.length - 1);
  return (sampleRate / 2) * progress;
}
