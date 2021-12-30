export function getTiltedFFT(fftBands, { tilt = 1 }) {
  const min = -(tilt / 2);
  const max = tilt / 2;
  const range = max - min;
  const vals = [];
  fftBands = fftBands.map((band, i) => {
    const progress = i / (fftBands.length - 1);
    // const multiplier = range * progress - min;
    const val = range * progress + min;
    vals.push(val);
    return band * (1 - val);
  });
  return fftBands;
}

export function getScaledFFT(fftBands, { numBands, scale }) {
  const scaledBands = [];
  const numFFTBands = fftBands.length;
  const p0 = {
    x: 0,
    y: 0,
  };
  const p1 = {
    x: numFFTBands * scale,
    y: numFFTBands - numFFTBands * scale,
  };
  const p2 = {
    x: numFFTBands * scale,
    y: numFFTBands - numFFTBands * scale,
  };
  const p3 = {
    x: numFFTBands,
    y: numFFTBands,
  };

  function getIndex(i) {
    return Math.floor(bezier(i / numBands, p0, p1, p2, p3).x);
  }

  for (let i = 0; i < numBands; i++) {
    scaledBands.push(fftBands[getIndex(i)]);
  }

  return scaledBands;
}

export function expScale(num, min, max, scale) {
  const p0 = {
    x: min,
    y: min,
  };
  const p1 = {
    x: max * scale,
    y: max - max * scale,
  };
  const p2 = {
    x: max * scale,
    y: max - max * scale,
  };
  const p3 = {
    x: max,
    y: max,
  };

  const range = max - min;

  return bezier(num / range, p0, p1, p2, p3).x;
}

export function bezier(t, p0, p1, p2, p3) {
  const cX = 3 * (p1.x - p0.x),
    bX = 3 * (p2.x - p1.x) - cX,
    aX = p3.x - p0.x - cX - bX;

  const cY = 3 * (p1.y - p0.y),
    bY = 3 * (p2.y - p1.y) - cY,
    aY = p3.y - p0.y - cY - bY;

  const x = aX * Math.pow(t, 3) + bX * Math.pow(t, 2) + cX * t + p0.x;
  const y = aY * Math.pow(t, 3) + bY * Math.pow(t, 2) + cY * t + p0.y;

  return { x: x, y: y };
}
