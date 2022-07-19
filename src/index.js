import 'normalize.css'
import './App.css'
import React, { useCallback, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import styled, { createGlobalStyle } from 'styled-components'
import { Context } from 'Shared'
import Switch from 'react-switch'
import { ChakraProvider } from '@chakra-ui/react'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import PlayGame from 'PlayGame/PlayGame'
import Settings from 'Settings/Settings'

const Container = styled.div`
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

function App() {  
  return (
    <Container className="App">
        {/* <GlobalStyle /> */}
        <BrowserRouter>
        <Context.ContextWrapper>
          <Routes>
            <Route path="/" element={<Settings />} />
            <Route path="/play" element={<PlayGame />} />
          </Routes>
          </Context.ContextWrapper>
        </BrowserRouter>
        
    </Container>
  );
}

ReactDOM.render(
  <React.StrictMode>    
      <ChakraProvider>
        <App />
      </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
