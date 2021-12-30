import { AudioData } from "./setup";
import chroma from "chroma-js";
import * as PIXI from "pixi.js";
import {
  AdvancedBloomFilter,
  MotionBlurFilter,
  KawaseBlurFilter,
  GlitchFilter,
  CRTFilter,
} from "pixi-filters";
const numBands = 800;

const stage = new PIXI.Container();
const objects: PIXI.Sprite[] = [];

export function setup(app: PIXI.Application, audio: AudioData) {
  const width = app.renderer.width;
  const height = app.renderer.height;
  app.stage = stage;

  const bloom = new AdvancedBloomFilter({
    threshold: 0.5,
    brightness: 1,
    bloomScale: 1,
    blur: 1,
    quality: 5,
  });

  stage.filters = [bloom];

  for (let i = 0; i < numBands; i++) {
    const progress = i / numBands;
    const texture = generateTexture(
      app,
      `hsl(${180 + progress * 180}, 70%, 70%)`
    );
    const sprite = new PIXI.Sprite(texture);
    // sprite.filters = [new MotionBlurFilter([sprite.x, sprite.y])];
    sprite.x = width / 2;
    sprite.y = height / 2;
    objects.push(sprite);
  }

  stage.addChild(...objects);

  return {
    objects: {},
    options: {
      numBands: 100,
    },
  };
}

function avg(arr: number[]) {
  return arr.reduce((acc, curr) => acc + curr) / arr.length;
}

let elapsed = 0;
export function update(
  app: PIXI.Application,
  audio: AudioData,
  data: any,
  delta: number
) {
  elapsed += delta;

  const width = app.renderer.width;
  const height = app.renderer.height;

  const fftData = audio.getFFT({
    numBands,
    frequencyScale: [
      [30, 0],
      [80, 0.1],
      [300, 0.6],
      [700, 1],
      // [10000, 1],
    ],
    temporalSmoothing: 0.1,
    frequencySmoothing: 3,
    tilt: -0.5,
    exponential: 0.99,
  });

  const bassVolume = avg(fftData.slice(0, Math.floor(numBands / 4)));

  for (let i = 0; i < fftData.length; i++) {
    const even = i % 2 == 0;
    const progress = i / fftData.length;
    const amp = fftData[i];
    const radius = amp * (height / 2) * bassVolume;
    // const theta = progress * Math.PI * 2 + elapsed * 0.01;
    const theta = even
      ? Math.PI + progress * Math.PI
      : Math.PI - progress * Math.PI;
    const x = width / 2;
    const y = height / 2;

    objects[i].alpha = amp * bassVolume;
    placeInCircle(objects[i], radius, theta - Math.PI / 2, x, y);
  }

  // stage.transform.skew.x = Math.sin(elapsed * 0.002) * 0.2;
  // stage.transform.skew.y = Math.sin(elapsed * 0.005) * 0.2;

  // stage.transform.scale.set(bassVolume);

  app.render();
}

function generateTexture(app, hslColor = "hsl(0, 0%, 100%)") {
  const hexColor = chroma(hslColor).hex();
  const gr = new PIXI.Graphics();
  gr.beginFill(PIXI.utils.string2hex(hexColor));
  gr.lineStyle(0);
  gr.drawCircle(0, 0, 2);
  gr.endFill();

  const texture = app.renderer.generateTexture(gr);

  return texture;
}

function placeInCircle(
  obj: PIXI.Sprite,
  r: number,
  rads: number,
  cx: number,
  cy: number
) {
  const cX = cx + r * Math.cos(rads);
  const cY = cy + r * Math.sin(rads);
  obj.x = cX;
  obj.y = cY;
}
