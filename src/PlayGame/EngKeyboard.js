import { useGameSettings } from 'Context';
import { useCallback, useEffect, useState } from 'react';
import { HFlex, VFlex } from 'Shared';
import { useTtsApi } from 'tts_api_client';
import { playAudio } from 'audioUtil';
import { sleep } from 'utils';
import styled from 'styled-components';

const EngKeyboardKeyContainer = styled.span`
  border: 1px solid black;
  background-color: #f3f3f3;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  text-align: center;
  font-size: 16vh;
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
    }
  }, [curLetterIdx, setCurLetterIdx, status])

  return (
    <EngKeyboardKeyContainer onClick={keyClick} keyStyle={style}>
      {letter}
    </EngKeyboardKeyContainer>
  );
}
const EngKeyboardContainer = styled(VFlex)`
  min-height: 70%;
  max-height: 70%;

`;
const EngKeyboardRow = styled(HFlex)`
  height: 25%;
  
`;
const PageContainer = styled(VFlex)`
  
`;
const WordContainer = styled(VFlex)`
  font-size: 14vh;
  color: #e1e1e1;
`;

function Word({word, curLetterIdx}) {
  return (<WordContainer>
    {word.substring(0, curLetterIdx)}
  </WordContainer>)
}

export function EngKeyboard({ word, onComplete }) {
  const [curLetterIdx, setCurLetterIdx] = useState(0)
  const ttsApi = useTtsApi()
  const rows = ["qwertyuio", "asdfghjkl", "zxcvbnmp"].map(r => r.toUpperCase().split(''))
  useEffect(() => {
    (async () => { 
      if (curLetterIdx >= word.length) {
        await sleep(800)
        onComplete()
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curLetterIdx, word.length])

  // Speak the letters
  useEffect(() => {
    (async () => { 
      if (curLetterIdx > 0) {
        const audio = await ttsApi.getAudio(word[curLetterIdx - 1])
        await playAudio(Uint8Array.from(audio.audioContent.data).buffer)
      }
    })()
  }, [curLetterIdx])
  

  return (
    <PageContainer>
      <Word word={word.toUpperCase()} curLetterIdx={curLetterIdx} />
      <EngKeyboardContainer>
        {rows.map(r => 
          <EngKeyboardRow key={r}>
            {r.map(l => 
              <EngKeyboardKey word={word.toUpperCase()} curLetterIdx={curLetterIdx} setCurLetterIdx={setCurLetterIdx} key={l} letter={l} />
            )}
          </EngKeyboardRow>  
        )}
      </EngKeyboardContainer>
    </PageContainer>
  );
}
