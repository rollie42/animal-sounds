import { useGameSettings } from 'Context';
import { useCallback, useEffect, useState } from 'react';
import { HFlex, VFlex } from 'Shared';
import styled from 'styled-components';

const EngKeyboardKeyContainer = styled.span`
  border: 1px solid black;
  background-color: #f3f3f3;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  text-align: center;
  font-size: 130px;
  font-weight: 700;
  height: 100%;
  cursor: pointer;
  ${props => 
    props.keyStyle === 'hidden' ? `
      cursor: initial;
      color: transparent;
    ` : props.keyStyle === 'disabled' ? `
      cursor: used;
      color: gainsboro;
    ` : props.keyStyle === 'normal' ? `
      cursor: pointer;
    ` : ``
  }
`;
function EngKeyboardKey({ letter, word, curLetterIdx, setCurLetterIdx }) {
  const [settings] = useGameSettings()
  var status = 'unneeded'
  if (word[curLetterIdx] === letter) {
    status = 'current'
  } else if (word.includes(letter, curLetterIdx)) {
    status = 'needed'
  } else if (word.includes(letter)) {
    status = 'used'
  }

  var style = 'hidden'
  if (settings.keyboardInterface.level === 1) {
    if (status === 'needed' || status === 'current') {
      style = 'normal'
    } else if (status === 'used') {
      style = 'disabled'
    } 
  } else if (settings.keyboardInterface.level === 2) {
    // TODO
    if (status === 'needed' || status === 'current') {
      style = 'normal'
    } else if (status === 'used') {
      style = 'disabled'
    } 
  } else if (settings.keyboardInterface.level === 3) {
    // TODO
    if (status === 'needed' || status === 'current') {
      style = 'normal'
    } else if (status === 'used') {
      style = 'disabled'
    } 
  }
  const keyClick = useCallback(() => {
    if (status === 'current') {
      setCurLetterIdx(curLetterIdx + 1)
      console.log('update')
    }
  }, [curLetterIdx, setCurLetterIdx, status])

  if (letter === 'B') {
    console.log(curLetterIdx, status, style)
  }

  return (
    <EngKeyboardKeyContainer onClick={keyClick} keyStyle={style}>
      {letter}
    </EngKeyboardKeyContainer>
  );
}
const EngKeyboardContainer = styled(VFlex)`
  flex-direction: column;
`;
const EngKeyboardRow = styled(HFlex)`
  height: 30%;  
`;
export function EngKeyboard({ word, onComplete }) {
  const [curLetterIdx, setCurLetterIdx] = useState(0)
  const rows = ["qwertyuio", "asdfghjkl", "zxcvbnmp"].map(r => r.toUpperCase().split(''))
  useEffect(() => {
    if (curLetterIdx >= word.length) {
      onComplete()
    }
  }, [curLetterIdx, onComplete, word.length])
  

  return (
    <EngKeyboardContainer>
      {rows.map(r => 
        <EngKeyboardRow key={r}>
          {r.map(l => 
            <EngKeyboardKey word={word.toUpperCase()} curLetterIdx={curLetterIdx} setCurLetterIdx={setCurLetterIdx} key={l} letter={l} />
          )}
        </EngKeyboardRow>  
      )}
    </EngKeyboardContainer>
  );
}
