import { playAudio } from 'audioUtil'
import { useGameSettings } from 'Context'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { HFlex } from 'Shared'
import styled from 'styled-components'
import { useTtsApi } from 'tts_api_client'
import { shuffleArray, sleep } from 'utils'
import { EngKeyboard } from './EngKeyboard'
import { JPKeyboard } from './JPKeyboard'
import { FaArrowCircleLeft } from 'react-icons/fa'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const AnimalImg = styled.img`
  height: 38vw;
  transition: all 0.6s ease-out;
  ${({ selected }) => selected && `
    height: 100vh;
    width: 100vw;
    //position: fixed;
  `}
`

const AnimalQuizContainer = styled(HFlex)`
  background-color: #00000099;
  width: 100vw;
  height: 100vh;

`

const OverlayContainer = styled(HFlex)`
  position: fixed;
  top: 0;
  height: 100vh;
  width: 100vw;
  background-color: #28282877;
`

let currentAnimal 

function Animal({animal}) {    
  const [selected, setSelected] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [settings] = useGameSettings()
  const ttsApi = useTtsApi()
  const lang = settings.language
  const ref = useRef()
  const sounds = shuffleArray(animal.sounds)
  var sndIdx = 0
  const clickHandler = useCallback(() => {
    const handler = async () => {
      if (currentAnimal?.animal === animal) {
        return
      }

      currentAnimal?.abortController?.abort()

      currentAnimal = {
        abortController: new AbortController(),
        animal
      }
      const signal = currentAnimal.abortController.signal

      setSelected(true)
      ref.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'start'
      })

      const audio = await ttsApi.getAudio(animal.name(lang), signal)
      await playAudio(Uint8Array.from(audio.audioContent.data).buffer, signal)

      const fetr = await fetch(sounds[sndIdx], {signal})
      await playAudio(await fetr.arrayBuffer(), signal)
      
      if (settings.keyboardInterface.level === 0) {
        setSelected(false)
      } else {
        setShowKeyboard(true)
      }
      currentAnimal = undefined
      
      sndIdx = (sndIdx + 1) % sounds.length
    }

    handler()
  }, [lang, selected, setSelected, settings])

  const quizHandler = async () => {
    console.log('quiz done...')
    const audio = await ttsApi.getAudio(animal.name(lang))
    await playAudio(Uint8Array.from(audio.audioContent.data).buffer)
    await sleep(1100)
    setSelected(false)
    setShowKeyboard(false);
  }

  return (
    <>
      <AnimalImg ref={ref} selected={selected} onClick={clickHandler} src={animal.thumbnails[0]} alt={animal.name(lang)} />
      {showKeyboard && settings.keyboardInterface.level !== 0 && <OverlayContainer>        
          <AnimalQuizContainer>
            {settings.language === 'English'
              ? <EngKeyboard word={animal.id} onComplete={quizHandler}/>
              : <JPKeyboard word={animal.name(lang)} onComplete={quizHandler}/>
            }
          </AnimalQuizContainer>
        </OverlayContainer>}
    </>
  )
}

const BackButtonContainer = styled.div`
  position: fixed;
  bottom: 3vh;
  left: 5vw;
  font-size: 12vh;
  width: 14vh;
  height: 14vh;
`

function BackButton() {
  const [progress, setProgress] = useState(0)
  const timeoutFn = useRef(undefined)
  const navigate = useNavigate()

  const stopGoBack = () => {
    setProgress(0) 
    clearTimeout(timeoutFn.current)
  }

  const goBack = () => {    
    setProgress(100)
    const to = setTimeout(() => {
      navigate('/')
    }, 3700)
    
    timeoutFn.current = to
  }

  return (<BackButtonContainer className="thirdPartyContainer" onPointerDown={goBack} onPointerUp={stopGoBack}>
    <CircularProgressbarWithChildren value={progress} strokeWidth={20} styles={buildStyles({
      pathTransitionDuration: progress ? 5 : 0,
    })}>      
      <FaArrowCircleLeft />
    </CircularProgressbarWithChildren>
  </BackButtonContainer>)
}

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`

const Container = styled(HFlex)`
    justify-content: flex-start;
`

export default function PlayGame() {
    const [settings] = useGameSettings()

    var animals = settings.content.filter(animal => animal.active)
    if (settings.ordering === 'Shuffle') {
      animals = shuffleArray(animals)
    }

    return (
        <PageContainer>
        <Container>
          <BackButton />
          {animals.map(animal => <Animal key={animal.id} animal={animal} />)}
        </Container>
        </PageContainer>
    )
}
