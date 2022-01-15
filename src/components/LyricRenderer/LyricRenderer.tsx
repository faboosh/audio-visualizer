import React, { useState, useEffect } from "react";
import getLyrics, { LyricManager } from "./parser";
import styled from "styled-components";

const LyricWrapper = styled.div`
  position: fixed;
  color: #ffe74d;
  z-index: 1000;
  font-family: "Montserrat", sans-serif;
  font-weight: 900;
  font-size: 4rem;
  text-transform: uppercase;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;

  @keyframes shake {
    0% {
      transform: translate(-50%, -50%);
    }

    25% {
      transform: translate(-49%, -49%);
    }

    50% {
      transform: translate(-51%, -49%);
    }

    50% {
      transform: translate(-51%, -51%);
    }
  }
  &.shake {
    animation: 0.1s 4 alternate shake;
  }
`;

export default function LyricRenderer({
  lyricSlug,
  audio,
}: {
  lyricSlug: string;
  audio: HTMLAudioElement;
}) {
  const [lm, setLM] = useState<null | LyricManager>(null);
  const [currentLyric, setCurrentLyric] = useState("");

  async function handleGetLyrics(lyricSlug: string) {
    const lm = await getLyrics(lyricSlug);
    setLM(lm);
  }

  useEffect(() => {
    if (lyricSlug) {
      handleGetLyrics(lyricSlug);
    }
  }, [lyricSlug]);

  useEffect(() => {
    if (audio && lm) {
      const interval = setInterval(() => {
        const time = audio.currentTime;
        const lyric = lm.getLyricAt(time);
        setCurrentLyric(lyric);
      }, 1000 / 30);

      return () => {
        clearInterval(interval);
      };
    }
  }, [audio, lm]);

  const classlist = currentLyric === currentLyric.toUpperCase() ? "shake" : "";

  return <LyricWrapper className={classlist}>{currentLyric}</LyricWrapper>;
}
