import React, { useEffect, useState, useRef } from "react";

import { setupAudio, TwoJSAudio } from "./render-functions/setupTwoJS";
import { setup, update } from "./render-functions/test";

export default function AudioAnalyzerTwoJS({ audioRef, audioFile }) {
  const stage = useRef(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    if (audioFile && audioRef.current && stage.current) {
      const unmount = TwoJSAudio(
        stage.current,
        audioRef.current,
        setup,
        update
      );
      return unmount;
    }
  }, [audioRef, stage, audioFile]);

  // useEffect(setup, []);

  return <div id="two-js" ref={stage} />;
}
