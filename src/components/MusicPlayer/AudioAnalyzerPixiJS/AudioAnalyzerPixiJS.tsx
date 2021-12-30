import React, { useEffect, useState, useRef } from "react";

import { setupAudio, PixiJSAudio } from "./render-functions/setup";
import * as test from "./render-functions/test";
import * as whack from "./render-functions/whack";

export default function AudioAnalyzerPixiJS({ audioRef, audioFile }) {
  const stage = useRef(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    if (audioFile && audioRef.current && stage.current) {
      const unmount = PixiJSAudio(
        stage.current,
        audioRef.current,
        whack.setup,
        whack.update
      );
      return unmount;
    }
  }, [audioRef, stage, audioFile]);

  // useEffect(setup, []);

  return <div id="two-js" ref={stage} />;
}
