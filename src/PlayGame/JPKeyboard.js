import { playAudio } from 'audioUtil';
import { createCtx, createNonNullCtx, useGameSettings } from 'Context';
import { useCallback, useEffect, useState } from 'react';
import { HFlex, VFlex } from 'Shared';
import styled from 'styled-components';
import { useTtsApi } from 'tts_api_client';
import { baify, paify } from './JPKana';

const JPFlyoutKeyContainer = styled.div`
  padding: 0px 12px;
`

const JPKeyFlyoutContainer = styled(VFlex)`
  height: unset;
  width: unset;
  flex: 0;
  background-color: grey;
  color: #e2e2e2;
  filter: drop-shadow(12px 12px 16px black);
  font-size: 14vh;
`

const JPFlyoutKey = ({letter, isCenter}) => {
  const [settings] = useGameSettings()
  const curLetterIdx = useCurLetterIdx()
  const setCurLetterIdx = useSetCurLetterIdx()
  const setFlyoutKana = useSetFlyoutKana()
  const ttsApi = useTtsApi()
  const word = useWord()
  const isCur = letter === word[curLetterIdx]

  const onSelect = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (isCur) {
      const audio = await ttsApi.getAudio(letter)
      await playAudio(Uint8Array.from(audio.audioContent.data).buffer)
      setCurLetterIdx(idx => idx + 1)
      setFlyoutKana(undefined)
    }
  }

  const displayLetter = settings.keyboardInterface.level < 3 && !isCur && !isCenter ? '' : letter

  return (<JPFlyoutKeyContainer onClick={onSelect}>{displayLetter}</JPFlyoutKeyContainer>)
}

const JPFlyoutFullContainer = styled.div`
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
`

const JPKeyFlyoutRow = styled(HFlex)`
  flex: 0;
`

const consumeClick = (e) => {
  e.preventDefault();
  e.stopPropagation();
}

const JPKeyFlyout = () => {
  const kanaSet = useFlyoutKana()

  if (kanaSet === undefined) {
    return null
  }

  return (
  <JPFlyoutFullContainer onClick={consumeClick}>
    <JPKeyFlyoutContainer>
      <JPKeyFlyoutRow>
        <JPFlyoutKey letter={kanaSet[2]} />
      </JPKeyFlyoutRow>
      <JPKeyFlyoutRow>
        <JPFlyoutKey letter={kanaSet[1]} />
        <JPFlyoutKey letter={kanaSet[0]} isCenter={true}/>
        <JPFlyoutKey letter={kanaSet[3]} />
      </JPKeyFlyoutRow>
      <JPKeyFlyoutRow>
        <JPFlyoutKey letter={kanaSet[4]} />
      </JPKeyFlyoutRow>
    </JPKeyFlyoutContainer>
  </JPFlyoutFullContainer>
  )
}

const JPKeyboardKeyContainer = styled.span`
  aspect-ratio: 1 / 1;
  padding: 0px 12px;
  border: 1px solid black;
  background-color: #f3f3f3;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 15.5vh;
  font-weight: 700;
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

const WordContainer = styled.div`
  writing-mode: vertical-rl;
  color: white;
  margin-left: 1em;
  font-size: 11vh;
`

function Word() {
  const word = useWord()
  const curLetterIdx = useCurLetterIdx()
  return (<WordContainer>{word.substr(0, curLetterIdx)}</WordContainer>)
}

function JPKeyboardKey({ kanaSet }) {
  const [settings] = useGameSettings()
  const setFlyoutKana = useSetFlyoutKana()
  const curLetterIdx = useCurLetterIdx()
  const setCurLetterIdx = useSetCurLetterIdx()
  const word = useWord()

  const baSet = baify(kanaSet)
  const paSet = paify(kanaSet)

  // This is the letters in order that we care, so if the word is 'abcdefg' and cur index is 3, 
  // this becomes 'defgcba'

  const matchString = word.substring(curLetterIdx) + word.substring(0, curLetterIdx).split('').reverse().join()

  // find first letter matching any of these sets
  for (const char of matchString) {
    if (kanaSet.includes(char)){
      break
    } else if (baSet.includes(char)) {
      kanaSet = baSet
      break
    } else if (paSet.includes(char)) {
      kanaSet = paSet
      break
    }
  }

  var status = 'unneeded'
  if (kanaSet.includes(word[curLetterIdx])) {
    status = 'current'
  } else if (kanaSet.some(k => word.includes(k, curLetterIdx))) {
    status = 'needed'
  } else if (kanaSet.some(k => word.includes(k))) {
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
    if (status === 'needed' || status === 'current') {
      style = 'normal'
    } else if (status === 'used') {
      style = 'disabled'
    } 
  } else if (settings.keyboardInterface.level === 3) {
    if (status === 'needed' || status === 'current') {
      style = 'normal'
    } else if (status === 'used') {
      style = 'disabled'
    } 
  }

  var baseKana = kanaSet[0]
  if (settings.keyboardInterface.level === 1) {
    if (status === 'current' || status === 'needed') {
      // Find first kana in the word in this set
      baseKana = word.substring(curLetterIdx).split('').find(k => kanaSet.includes(k))
    } else {
      // Show the last kana used in this set
      const usedLetters = word.substring(0, curLetterIdx).split('')
      baseKana = usedLetters.reverse().find(k => kanaSet.includes(k))
    }
  }
  
  const keyClick = useCallback(() => {
    if (status === 'current') {
      if (settings.keyboardInterface.level === 1)
        setCurLetterIdx(curLetterIdx + 1)
      else
        setFlyoutKana(kanaSet)
    }
  }, [status, kanaSet])
  
  useEffect(() => {
    if (status !== 'current') {
      setFlyoutKana(undefined);
    }
  }, [status])  

  return (
    <JPKeyboardKeyContainer onClick={keyClick} keyStyle={style}>
      {baseKana}
    </JPKeyboardKeyContainer>
  );
}

const JPKeyboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 2px;
`;

const JPKeyboardContent = styled(HFlex)`

`

const JPKeyboardSideContent = styled.div`
  min-width: 10vw;  
  max-width: 10vw;  
`

const [useCurLetterIdx, useSetCurLetterIdx, CurLetterIdxProvider] = createNonNullCtx()
const [useFlyoutKana, useSetFlyoutKana, FlyoutKanaProvider] = createCtx()
const [useWord, , WordProvider] = createNonNullCtx()

export function JPKeyboard({ word, onComplete }) {
  const [curLetterIdx, setCurLetterIdx] = useState(0)
  const [flyoutKana, setFlyoutKana] = useState(undefined)
  const kana = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'や　ゆ　よ', 'らりるれろ', '　　　　　', 'わをん　　', '　　　　　']

  useEffect(() => {
    if (curLetterIdx >= word.length) {
      onComplete()
    }
  }, [curLetterIdx, onComplete, word])

  return (
    <FlyoutKanaProvider defaultValue={undefined}>
      <CurLetterIdxProvider dataAccess={[curLetterIdx, setCurLetterIdx]}>
        <WordProvider defaultValue={word}>
          <JPKeyFlyout />
          <JPKeyboardContent>
            <JPKeyboardSideContent></JPKeyboardSideContent>
            <JPKeyboardContainer>
              {kana.map((ks, i) =>  
                <JPKeyboardKey key={i} kanaSet={ks.split('')} />
              )}
            </JPKeyboardContainer>
            <JPKeyboardSideContent>
              <Word />
            </JPKeyboardSideContent>
            
          </JPKeyboardContent>
        </WordProvider>
      </CurLetterIdxProvider>
    </FlyoutKanaProvider>
  );
}
