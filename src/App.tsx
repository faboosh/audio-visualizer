import React, { useState } from "react";
import LyricRenderer from "./components/LyricRenderer/LyricRenderer";
import MusicPlayer from "./components/MusicPlayer";
import styled from "styled-components";

const InteractContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #1d0d3d;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InteractButton = styled.button`
  position: relative;
  background: #ffe74d;
  color: #8f822c;
  border: none;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  font-family: "Montserrat", sans-serif;
  font-weight: 900;
  font-size: 4rem;
  cursor: pointer;
  transition: 0.5s all;

  &:hover {
    color: #fde968;
    background: transparent;
  }

  &:after {
    content: "";
    position: absolute;
    top: 0rem;
    bottom: 0rem;
    right: 0rem;
    left: 0rem;
    border: 5px solid transparent;
    border-radius: 1rem;
    transition: 0.5s all;
  }

  &:hover:after {
    border: 5px solid #fde968;
  }
`;

function App() {
  const [interacted, setInteracted] = useState(false);
  const [audioElem, setAudioElem] = useState<null | HTMLAudioElement>(null);
  function handleAudioMounted(audioElem: HTMLAudioElement) {
    setAudioElem(audioElem);
  }

  return (
    <>
      {!interacted && (
        <>
          <InteractContainer>
            <InteractButton onClick={() => setInteracted(true)}>
              START
            </InteractButton>
          </InteractContainer>
        </>
      )}
      {interacted && (
        <>
          <MusicPlayer
            songSlug="det-ar-jag"
            onAudioMounted={handleAudioMounted}
          />
          {audioElem && (
            <LyricRenderer lyricSlug="det-ar-jag" audio={audioElem} />
          )}
        </>
      )}
    </>
  );
}

export default App;
