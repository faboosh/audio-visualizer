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
const numRows = 18;
const numCols = 32;
const numBands = numRows * numCols;

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
    sprite.anchor.set(0.5);
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
    // frequencyScale: [
    //   [30, 0],
    //   [80, 0.1],
    //   [300, 0.6],
    //   [700, 1],
    //   // [10000, 1],
    // ],
    temporalSmoothing: 0,
    frequencySmoothing: 3,
    tilt: -0.5,
    exponential: 0.99,
  });

  const aspectRatio = height / width;

  const bassVolume = avg(fftData.slice(0, Math.floor(numBands / 4)));
  // const numCols = Math.floor(fftData.length / 20);
  // const numRows = Math.floor(numCols * aspectRatio);
  let currRow = 0;

  // console.log(numCols, numRows);

  const split = splitIntoChunks(fftData, numRows);
  const rowHeight = height / numRows;
  let object = 0;

  for (let i = 0; i < split.length; i++) {
    const chunk = split[i];

    for (let j = 0; j < chunk.length; j++) {
      const amp = chunk[j];
      const progress = j / chunk.length;
      const even = (j + i) % 2 == 0;

      objects[object].alpha = Math.pow(amp, 3);
      // objects[j].scale.set(1 + amp * 1);
      objects[object].position.set(
        progress * width + width * 0.02,
        height - i * rowHeight + height * 0.0
      );

      objects[object].rotation = even ? elapsed * 0.02 : -elapsed * 0.02;

      object += 1;
    }
  }

  // for (let i = 0; i < fftData.length; i++) {
  //   const offset = i % numCols;
  //   const row = i % numRows;

  //   // const row = i % numRows;

  //   const amp = fftData[i];
  //   // const radius = amp * (height / 2);
  //   // const ampSin = Math.sin(amp * Math.PI * 1.5);

  //   if (row == 0) currRow += 1;
  // }

  // stage.transform.skew.x = Math.sin(elapsed * 0.002) * 0.2;
  // stage.transform.skew.y = Math.sin(elapsed * 0.005) * 0.2;

  // stage.transform.scale.set(bassVolume);

  app.render();
}

function generateTexture(app, hslColor = "hsl(0, 0%, 100%)") {
  const hexColor = chroma(hslColor).hex();
  const gr = new PIXI.Graphics();
  const side = -50;
  gr.beginFill(PIXI.utils.string2hex(hexColor));
  gr.lineStyle(0);
  gr.drawPolygon(0, 0, side / 2, side * 0.866025, side, 0);
  // gr.transform.rotation = Math.PI;
  // gr.drawCircle(0, 0, 2);
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

function splitIntoChunks(arr, perChunk = 2) {
  return arr.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
}
