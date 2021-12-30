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
const numBands = 1000;

const stage = new PIXI.Container();
const objects: PIXI.Sprite[] = [];

export function setup(app: PIXI.Application, audio: AudioData) {
  app.stage = stage;
  const width = app.renderer.width;
  const height = app.renderer.height;

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
  const bloom = new AdvancedBloomFilter({
    threshold: 0.5,
    brightness: 1,
    bloomScale: 1,
    blur: 1,
    quality: 5,
  });

  stage.filters = [bloom];

  return {
    objects: {},
    options: {
      numBands: 100,
    },
  };
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
    temporalSmoothing: 0.1,
    frequencySmoothing: 3,
    tilt: -0.5,
    exponential: 0.99,
  });

  for (let i = 0; i < fftData.length; i++) {
    const even = i % 2 == 0;
    const progress = i / fftData.length;
    const amp = fftData[i];
    const radius = amp * (height / 2);
    // const theta = progress * Math.PI * 2 + elapsed * 0.01;
    const theta = even
      ? Math.PI + progress * Math.PI
      : Math.PI - progress * Math.PI;
    const x = width / 2;
    const y = height / 2;

    objects[i].alpha = amp;
    placeInCircle(objects[i], radius, theta - Math.PI / 2, x, y);
  }

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
