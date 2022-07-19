import BitArray from '@bitarray/es6'
import { decode, encode } from 'base64-arraybuffer'
import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { animals } from './StaticContent'

const mask = "01101001010010100111101010001110101011010101011110100101010101010101010010101010011010101"
export const serializeSettings = (settings) => {
    const vals = []

    vals.push(settings.language === 'English')
    vals.push(settings.ordering === 'Alphabetical')
    vals.push(settings.keyboardInterface.level > 1)
    vals.push(settings.keyboardInterface.level > 0)
    for (const animal of settings.content) {
        vals.push(animal.active)
    }
    let arr = BitArray.from(vals)
    // console.log('Orig arr', arr)
    arr = arr['^'](BitArray.from(mask.slice(0, vals.length)))
    // console.log('Masked arr', arr)
    
    const encoded = encode(arr.buffer).replaceAll("+", "-").replaceAll("/", "_")
    return encoded
}

export const deserializeSettings = (encoded) => {
    const buffer = decode(encoded.replaceAll("-", "+").replaceAll("_", "/"))
    const vals = []
    for(const b of new Uint8Array(buffer)) {
        for (let i = 0; i < 8; i++) {
            vals.push(!!(b & (1 << i)))
        }
    }
    let arr = BitArray.from(vals)
    //console.log('Masked arr', arr)
    arr = arr['^'](BitArray.from(mask.slice(0, vals.length)))
    //console.log('Orig arr', arr)
    const settings = {

    }

    const itr = arr.values()
    const v = () => itr.next().value
    settings.language = v() ? 'English' : 'Japanese'
    settings.ordering = v() ? 'Alphabetical' : 'Shuffle'
    const targetLevel = v() * 2 + v()
    settings.keyboardInterface = keyboardOptions.find(o => o.level === targetLevel)
    settings.content = Object.values(animals).map(animal => ({...animal, active: v()}))
    
    return settings    
}

const GameSettings = React.createContext({})
const useGameSettings = () => useContext(GameSettings)

export const keyboardOptions = [
    {
        id: 'None',
        level: 0,
        ages: 'All ages',
        description: 'No keyboard usage involved; just click and listen!'
    },
    {
        id: 'Beginner',
        level: 1,
        ages: '4+',
        description: 'Intro to letters and where they are on the keyboard, with lots of hints'
    },
    {
        id: 'Novice',
        level: 2,
        ages: '5+',
        description: 'More letters, hints come slower'
    },
    {
        id: 'Journeyman',
        level: 3,
        ages: '5+',
        description: 'All letters, hints very slow'
    },
]

export function createCtx(defaultValue) {
    const defaultUpdate = () => defaultValue;
    const ctx = React.createContext([defaultValue, defaultUpdate]);
    function Provider(props) {
        const localState = React.useState(props.defaultValue ?? defaultValue);
        return <ctx.Provider value={props.dataAccess ?? localState} {...props} />;
    }
    return [
        () => React.useContext(ctx)[0], // the value getter
        () => React.useContext(ctx)[1], // the value setter
        Provider, // the data provider, using setState internally
        ctx // The raw context object
    ];
}
const uninitializedAccess = {};
// This is an extension of the above; basically here we are saying "When the context is created, we will have a value,
// but before that, we won't"
export function createNonNullCtx() {
    // Wrap the provider to ensure we have a default value
    const [accessor, setter, provider, ctx] = createCtx(uninitializedAccess);
    function Provider(props) {
        return provider(props);
    }
    // If the user accesses this value and hasn't supplied a context provider, blow up
    const validatedAccessor = () => {
        const val = accessor();
        if (val === uninitializedAccess) {
            throw new Error(
                'Uninitialized context access - make sure this call has a context provider somewhere up the DOM stack'
            );
        }
        return val;
    };
    return [validatedAccessor, setter, Provider, ctx];
}

const SettingWatcher = () => {
    const [settings] = useGameSettings()
    const [, setSearchParams] = useSearchParams()
    useEffect(() => {
        const encoded = serializeSettings(settings)
        // const s = {...settings}
        // for(const anim of s.content) {
        //     delete anim.thumbnails
        //     delete anim.sounds
        // }
        setSearchParams({config: encoded}, { replace: true })
    }, [setSearchParams, settings])
    
    return null;
}
function ContextWrapper({children}) {
    const [searchParams] = useSearchParams()

    let defaultSettings = { 
        language: 'English', 
        keyboardInterface: keyboardOptions[0],
        ordering: 'Shuffle',
        content: Object.values(animals).map(animal => ({...animal, active: true}))
    }

    const providedConfig = searchParams.get('config')
    if (providedConfig) {
        defaultSettings = deserializeSettings(providedConfig)
    }
    const [gameState, setGameState] = useState(defaultSettings)
    const wr = (s) => {
        setGameState(s)
    }
    
    return (
        <GameSettings.Provider value={[gameState, wr]}>
            <SettingWatcher />
            {children}
        </GameSettings.Provider>
    )
}

export { useGameSettings, ContextWrapper }