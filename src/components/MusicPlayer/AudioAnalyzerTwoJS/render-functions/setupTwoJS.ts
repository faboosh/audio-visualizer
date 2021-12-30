import Two from "twojs-ts";
import { getScaledFFT, getTiltedFFT, expScale } from "./audioUtils";

export function TwoJSAudio(
  twoJSMount,
  audioMount,
  setupFunction,
  updateFunction
) {
  let data = {};
  const audio = setupAudio(audioMount);
  const two = new Two({
    fullscreen: true,
    autostart: true,
    type: Two.Types.webgl,
  }).appendTo(twoJSMount);

  setup();
  two.bind(Two.Events.update, update);

  function setup() {
    data = setupFunction(two, audio);
  }

  function update() {
    updateFunction(two, audio, data);
  }

  return function unmount() {
    two.unbind(Two.Events.update, update);
    two.pause();
    twoJSMount.removeChild(document.querySelector("canvas"));
  };
}

export type AudioData = {
  analyser: AnalyserNode;
  dataArray: Uint8Array;
  bufferLength: number;
  getFFT: ({
    numBands,
    scale,
    exponential,
    smoothing,
    tilt,
    lowpass,
    highpass,
  }: {
    numBands?: number;
    scale?: number;
    exponential?: number;
    smoothing?: number;
    tilt?: number;
    lowpass?: number;
    highpass?: number;
  }) => number[];
};

let context, src;

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

  function getFFT({
    numBands = 100,
    scale = 0,
    exponential = 1,
    smoothing = 0.8,
    tilt = 1,
    lowpass = 0.6,
    highpass = 0.001,
  }): number[] {
    analyser.getByteFrequencyData(dataArray);
    const lpCutoff = Math.floor((FFT_SIZE / 2) * lowpass);
    const hpCutoff = Math.floor((FFT_SIZE / 2) * highpass);
    const slicedDataArray = dataArray.slice(hpCutoff, lpCutoff);

    let fftBands = getScaledFFT(slicedDataArray, {
      numBands,
      scale,
    });

    fftBands = getTiltedFFT(fftBands, { tilt });

    fftBands = fftBands.map((band) => {
      const amp = expScale(band, 0, 255, exponential) / 255;
      return amp > 1 ? 1 : amp;
    });

    if (prevFFTBands) {
      fftBands = fftBands.map((band, i) => {
        const prevBand = prevFFTBands[i];
        const diff = band - prevBand;

        return prevBand + diff * (1 - smoothing);
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
