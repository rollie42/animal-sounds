import { useState, useCallback, useContext, useEffect, useRef } from 'react'
import * as Context from 'Context'
import styled from 'styled-components'

export const HFlex = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
`

export const VFlex = styled(HFlex)`
    flex-direction: column;
`

const Spacer = styled.span`
    display: block;
    flex: 100;
`
export {Context, Spacer}