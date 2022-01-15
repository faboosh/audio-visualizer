import React, { useEffect, useState, useRef } from "react";

import { setupAudio, ThreeJSAudio } from "./render-functions/setup";
import * as test from "./render-functions/test";

export default function AudioAnalyzerThreeJS({ audioRef, audioFile }) {
  const stage = useRef(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    if (audioFile && audioRef.current && stage.current) {
      const unmount = ThreeJSAudio(
        stage.current,
        audioRef.current,
        test.setup,
        test.update
      );
      return unmount;
    }
  }, [audioRef, stage, audioFile]);

  // useEffect(setup, []);

  return <div id="three-js" ref={stage} />;
}
