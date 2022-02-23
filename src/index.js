import 'normalize.css'
import './App.css'
import React, { useCallback, useState } from 'react'
import ReactDOM from 'react-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { Context } from 'Shared'
import { arrRnd, shuffleArray, sleep } from 'utils'
import Toggle from 'react-toggle'
import Switch from 'react-switch'

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const animals = {

}

const animalNames = {
  en: { // defaults are fine here

  },
  jp: {
    bear: '熊',
    bird: '鳥'
  }
}
function requireAll(r) { 
  const files = r.keys()
  r.keys().forEach( a => {    
    const file = r(a)
    let rex = /\.\/Animals\/(?<animal>\w+)\/(?<arr>\w+)\//;
    const {animal, arr} = rex.exec(a).groups
    if (animals[animal] === undefined) {
      animals[animal] = { 
        id: animal.toLowerCase(), 
        thumbnails: [], 
        sounds: [],
        name(lang) { return animalNames[lang][this.id] ?? this.id}
      }
    }
    animals[animal][arr].push(file)
  }); 
  console.log(animals)
}

requireAll(require.context('./Animals/', true, /.*/));

const Container = styled.div`
  height: 100vh;
  width: 100vw;
`

const GlobalStyle = createGlobalStyle`
  div{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .thirdPartyContainer div {
    width: revert;
    height: revert;
    display: revert;
    align-items: revert;
    justify-content: revert;
    flex: revert;
  }
  img{
    width: 100%;
    
    height: 100%;
    object-fit: contain;
  }
`

const AnimalsContainer = styled.div`
  max-height: 38vw;
  min-height: 38vw;
  justify-content: flex-start;
`

const AnimalImg = styled.img`
  height: 38vw;
`

const LanguageToggleContainer = styled.span`
  position: absolute;
  top: 20px;
  right: 20px;
`
function LanguageToggle({lang, setLang}) {
  const toggle = (v) => {
    console.log(v)
    setLang(v ? 'jp' : 'en')
  }

  return (<LanguageToggleContainer className='thirdPartyContainer'>
    <span>ENG</span>
    <Switch uncheckedIcon={false} checkedIcon={false} checked={lang === 'jp'} onChange={toggle} />
    <span>JPN</span>
  </LanguageToggleContainer>

  )
}

let abortController = new AbortController()

function Animal({animal, lang}) {    
  const sounds = shuffleArray(animal.sounds)
  var sndIdx = 0
  const clickHandler = useCallback(() => {
    const handler = async () => {
      abortController.abort()
      abortController = new AbortController()
      const signal = abortController.signal
      console.log(animal)

      const resp = await fetch("https://asia-northeast1-animal-sounds-341512.cloudfunctions.net/animal-sound-tts",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            animal: animal.name(lang),
            voice: 'male',
            language: lang
          }),
          signal
        })  
      const nameTTS = await resp.json()    
      const nameArrBuffer = Uint8Array.from(nameTTS.audioContent.data)
      const nameBlob = new Blob([nameArrBuffer], { type: "audio/mp3"})
      const nameUrl = URL.createObjectURL(nameBlob)

      const nameAudioSource = audioCtx.createBufferSource();
      const b = await audioCtx.decodeAudioData(nameArrBuffer.buffer)    
      nameAudioSource.buffer = b
      nameAudioSource.connect(audioCtx.destination)
      nameAudioSource.start(0)
      await sleep((b.duration + .4) * 1000, {signal})
      nameAudioSource.stop()

      const fetr = await fetch(sounds[sndIdx].default, {signal})
      const b8 = await fetr.arrayBuffer()
      const soundAudioSource = audioCtx.createBufferSource();
      const b2 = await audioCtx.decodeAudioData(b8)
      soundAudioSource.buffer = b2
      soundAudioSource.connect(audioCtx.destination)
      soundAudioSource.start(0)
      await sleep((Math.min(b2.duration, 4.0) + .4) * 1000, {signal})
      soundAudioSource.stop()
      
      sndIdx = (sndIdx + 1) % sounds.length
    }

    handler()
  }, [lang])
  return (
    <AnimalImg  onClick={clickHandler} src={animal.thumbnails[0].default} alt={animal.name} />
  )
}
function App() {
  const [lang, setLang] = useState('en')
  return (
    <Container className="App">
        <GlobalStyle />
        <LanguageToggle lang={lang} setLang={setLang} />
        <AnimalsContainer>
          {Object.keys(animals).map(animal => <Animal lang={lang} key={animal} animal={animals[animal]} />)}
        </AnimalsContainer>
    </Container>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Context.ContextWrapper>
      <App />
    </Context.ContextWrapper>
  </React.StrictMode>,
  document.getElementById('root')
);
