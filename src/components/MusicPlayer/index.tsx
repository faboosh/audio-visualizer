import React, { useEffect, useRef, useState } from "react";
import FilePicker from "./FilePicker";
import styled from "styled-components";
import AudioAnalyzerTwoJS from "./AudioAnalyzerTwoJS/AudioAnalyzerTwoJS";
import AudioAnalyzerPixiJS from "./AudioAnalyzerPixiJS/AudioAnalyzerPixiJS";
import AudioAnalyzerThreeJS from "./AudioAnalyzerThreeJS/AudioAnalyzerThreeJS";
import PlayButton from "./PlayButton";

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
  visibility: hidden;
`;

const PlayButtonWrapper = styled.div`
  width: 2rem;
  height: 2rem;
  margin-left: 0.5rem;
`;

const VolumeSlider = styled.div<{ volume: number }>`
  width: 100%;
  position: relative;

  label:after,
  label:before {
    position: absolute;
    border-radius: 0.5rem;
    content: "";
  }

  label:before {
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.05);
  }

  label:after {
    left: ${(props) => `calc(${props.volume}% - ${props.volume / 100}rem)`};
    height: 100%;
    width: 1rem;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.5);
  }

  input[type="range"] {
    position: relative;
    z-index: 1;
    width: 100%;
    opacity: 0;
  }
`;

const VolumeSliderWrapper = styled.div`
  width: 15rem;
  display: flex;
  align-items: center;
  margin: 0 0.5rem;

  p {
    text-transform: uppercase;
    font-family: "Montserrat", sans-serif;
    font-weight: bolder;
    margin-right: 1rem;
  }
`;

const ControlWrapper = styled.div`
  position: fixed;
  z-index: 10000;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
`;

export default function MusicPlayer({
  onAudioMounted,
  songSlug,
}: {
  onAudioMounted: Function;
  songSlug: string;
}) {
  const [audioFile, setAudioFile] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<null | HTMLAudioElement>();

  async function handleAudioFile(audioFile) {
    setAudioFile(audioFile);
    const audioURL = await fileToBase64(audioFile);
    setAudioURL(audioURL.replace("application/octet-stream", "audio/mpeg"));
  }

  async function fileToBase64(file) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve(typeof reader.result == "string" ? reader.result : "");
      reader.onerror = (error) => reject(error);
    });
  }

  function handleTogglePlay() {
    if (audioRef.current) {
      if (playing) {
        setPlaying(false);
        audioRef.current.pause();
      } else {
        setPlaying(true);
        audioRef.current.play();
      }
    }
  }

  async function downloadSong(songSlug: string) {
    const url = `songs/${songSlug}/song.mp3`;
    const audioFile = await fetch(url).then((res) => res.blob());
    handleAudioFile(audioFile);
  }

  useEffect(() => {
    if (audioRef) {
      onAudioMounted(audioRef.current);
    }
  }, [audioRef]);

  useEffect(() => {
    if (songSlug && audioRef.current) {
      downloadSong(songSlug);
    }
  }, [audioRef, songSlug]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef, volume]);

  return (
    <StyledWrapper>
      <PickerPlayerWrapper>
        <audio ref={audioRef} src={audioURL} controls></audio>
        <FilePicker onChange={handleAudioFile} />
      </PickerPlayerWrapper>
      <ControlWrapper>
        <VolumeSliderWrapper>
          <p>VOL</p>

          <VolumeSlider volume={Math.round(volume * 100)}>
            <label htmlFor="vol"></label>
            <input
              id="vol"
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
            />
          </VolumeSlider>
        </VolumeSliderWrapper>
        <PlayButtonWrapper>
          <PlayButton isPlaying={playing} onClick={handleTogglePlay} />
        </PlayButtonWrapper>
      </ControlWrapper>
      {/* <AudioAnalyzerTwoJS audioRef={audioRef} audioFile={audioFile} /> */}
      <AudioAnalyzerThreeJS audioRef={audioRef} audioFile={audioFile} />
      {/* <AudioAnalyzer audioRef={audioRef} audioFile={audioFile} /> */}
    </StyledWrapper>
  );
}
