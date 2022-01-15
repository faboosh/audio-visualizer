import React, { useState } from "react";
import LyricRenderer from "./components/LyricRenderer/LyricRenderer";
import MusicPlayer from "./components/MusicPlayer";

function App() {
  const [audioElem, setAudioElem] = useState<null | HTMLAudioElement>(null);
  function handleAudioMounted(audioElem: HTMLAudioElement) {
    setAudioElem(audioElem);
  }

  return (
    <>
      <MusicPlayer onAudioMounted={handleAudioMounted} />
      {audioElem && <LyricRenderer lyricSlug="det-ar-jag" audio={audioElem} />}
    </>
  );
}

export default App;
