import Two, { Vector } from "twojs-ts";
import { AudioData } from "./setupTwoJS";
const numBands = 500;
const objects: Two.Rectangl[] = [];

export function setup(two: Two, audio: AudioData) {
  for (let i = 0; i < numBands; i++) {
    const progress = i / numBands;
    const obj = two.makeRectangle(progress * two.width, two.height, 5, 5);

    placeInCircle(
      obj,
      0,
      progress * Math.PI * 2,
      two.width / 2,
      two.height / 2
    );

    obj.noStroke();
    obj.fill = `hsl(${360 * progress}, 50%, 50%)`;
    objects.push(obj);
  }
  return {
    objects: {},
    options: {
      numBands: 100,
    },
  };
}

function placeInCircle(
  obj: Two.Shape,
  r: number,
  rads: number,
  cx: number,
  cy: number
) {
  const cX = cx + r * Math.cos(rads);
  const cY = cy + r * Math.sin(rads);
  obj.translation.x = cX;
  obj.translation.y = cY;
}

// let now = performance.now();
// const startDelta = () => (now = performance.now());
// const endDelta = (prefix) => console.log(prefix, performance.now() - now);

export function update(two: Two, audio: AudioData, data: any) {
  // // @ts-expect-error
  // two.remove(...objects);
  const fftData = audio.getFFT({
    numBands,
    scale: 0.01,
    smoothing: 0.3,
    tilt: -0.8,
    exponential: 0.99,
    highpass: 0,
  });

  // console.log(fftData);
  // console.log(objects);
  for (let i = 0; i < fftData.length; i++) {
    const progress = i / fftData.length;
    // objects[i].translation.y = two.height - fftData[i] * 500;
    // objects[i].opacity = fftData[i];
    placeInCircle(
      objects[i],
      (fftData[i] * two.height) / 2,
      progress * Math.PI * 2,
      two.width / 2,
      two.height / 2
    );
  }
}
