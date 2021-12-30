import React from "react";
import styled from "styled-components";

const StyledInputWrapper = styled.div`
  height: 100%;
  display: flex;
`;
const StyledLabel = styled.label`
  background-color: hsl(293, 48%, 50%);
  padding: 0.5rem 0.7rem;
  border-radius: 0.25rem;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  cursor: pointer;
  height: 100%;
  display: block;
`;

const StyledInput = styled.input`
  display: none;
`;

export default function FilePicker({ onChange = (e: any) => {} }) {
  return (
    <StyledInputWrapper>
      <StyledLabel htmlFor="file-picker">Upload Sound</StyledLabel>
      <StyledInput type="file" name="" id="file-picker" onChange={onChange} />
    </StyledInputWrapper>
  );
}
