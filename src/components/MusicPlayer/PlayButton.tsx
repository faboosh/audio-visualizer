import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  cursor: pointer;
  aspect-ratio: 1;

  svg {
    width: 100%;
    height: 100%;
  }
`;

function PlaySVG() {
  return (
    <svg
      width="186"
      height="186"
      viewBox="0 0 186 186"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_1_2)">
        <path d="M171 93L31.5 173.54L31.5 12.4596L171 93Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_1_2">
          <rect width="186" height="186" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function PauseSVG() {
  return (
    <svg
      width="186"
      height="186"
      viewBox="0 0 186 186"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="21" y="16" width="46" height="154" fill="white" />
      <rect x="116" y="16" width="46" height="154" fill="white" />
    </svg>
  );
}

export default function PlayButton({
  isPlaying = false,
  onClick = () => {},
}: {
  isPlaying: boolean;
  onClick: any;
}) {
  return (
    <Container onClick={onClick}>
      {isPlaying ? <PauseSVG /> : <PlaySVG />}
    </Container>
  );
}
