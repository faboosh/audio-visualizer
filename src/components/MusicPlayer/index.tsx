import React, { useEffect, useRef, useState } from "react";
import FilePicker from "./FilePicker";
import styled from "styled-components";
import AudioAnalyzerTwoJS from "./AudioAnalyzerTwoJS/AudioAnalyzerTwoJS";
import AudioAnalyzerPixiJS from "./AudioAnalyzerPixiJS/AudioAnalyzerPixiJS";
import AudioAnalyzerThreeJS from "./AudioAnalyzerThreeJS/AudioAnalyzerThreeJS";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PickerPlayerWrapper = styled.div`
  position: fixed;
  z-index: 10;
  right: 0.5rem;
  top: 0.5rem;
  display: flex;
  align-items: center;
  background: #171717;
  padding: 0.5rem 0.7rem;
  border-radius: 0.25rem;
`;

export default function MusicPlayer({
  onAudioMounted,
}: {
  onAudioMounted: Function;
}) {
  const [audioFile, setAudioFile] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const audioRef = useRef();

  function handleAudioFile(e: any) {
    const audioFile = e.target.files[0];
    setAudioFile(audioFile);
    setAudioURL(URL.createObjectURL(audioFile));
  }

  useEffect(() => {
    if (audioRef) {
      onAudioMounted(audioRef.current);
    }
  }, [audioRef]);

  return (
    <StyledWrapper>
      <PickerPlayerWrapper>
        <audio ref={audioRef} src={audioURL} controls></audio>
        <FilePicker onChange={handleAudioFile} />
      </PickerPlayerWrapper>
      {/* <AudioAnalyzerTwoJS audioRef={audioRef} audioFile={audioFile} /> */}
      <AudioAnalyzerThreeJS audioRef={audioRef} audioFile={audioFile} />
      {/* <AudioAnalyzer audioRef={audioRef} audioFile={audioFile} /> */}
    </StyledWrapper>
  );
}
