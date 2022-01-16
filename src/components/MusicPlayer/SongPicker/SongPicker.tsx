import React from "react";
import styled from "styled-components";

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #1d0d3d;
  display: flex;
  align-items: flex-start;
  padding: 10rem;
  justify-content: center;
  flex-direction: column;
`;
const SongButton = styled.button<{ selected: boolean }>`
  position: relative;
  background: transparent;
  color: #fde968;
  border: none;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  font-family: "Montserrat", sans-serif;
  font-weight: 900;
  font-size: 4rem;
  margin-bottom: 4rem;
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

const songs = [
  {
    slug: "det-ar-jag",
    name: "Får en (och det är jag)",
  },
  {
    slug: "stor-map",
    name: "Stor Map",
  },
];

export default function SongPicker({
  songSlug = null,
  onChange = () => {},
}: {
  songSlug: null | string;
  onChange: Function;
}) {
  return (
    <Container>
      {songs.map((song) => (
        <SongButton
          onClick={() => onChange(song.slug)}
          selected={songSlug == song.slug}
        >
          {song.name}
        </SongButton>
      ))}
    </Container>
  );
}
