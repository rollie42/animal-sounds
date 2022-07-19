import { useCallback, useContext, useEffect, useRef } from 'react'
import { HFlex, VFlex, Context } from 'Shared'
import styled from 'styled-components'
import {
    Box,
    InputGroup as BaseInputGroup,
    Stack,
    Flex,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Radio, 
    RadioGroup,
    ButtonGroup as BaseButtonGroup,
    Select,
    Text,
    useCheckbox,
    useRadioGroup,
    useRadio,
    chakra,
    Button
} from '@chakra-ui/react'
import { animals } from '../StaticContent'
import { keyboardOptions, useGameSettings } from 'Context'
import { useNavigate } from 'react-router'

const Label = chakra(FormLabel, {
    baseStyle: {
        flex: 5,
        textAlign: 'center',
        mb: 2,
        mr: 0,
        fontSize: '24px'
    }
})

const ButtonGroup = chakra(BaseButtonGroup, {
    baseStyle: {
        justifyContent: 'center'
    }
})

const AnimalsContainer = chakra(Flex, {
    baseStyle: {
        justifyContent: 'center',
        flexFlow: 'wrap'
    }
})

const InputGroup = chakra('div', {
    display: 'block'
})

const LabelDiv = chakra(HFlex, {
    baseStyle: {
        alignSelf: 'center',
    }
})

const InputContainer = chakra(Box, {
    baseStyle: {
        flex: 10,
    }
})
function RadioCard(props) {
    const { getInputProps, getCheckboxProps } = useRadio(props);
    return (<>
        <Box as='label'>
            <input {...getInputProps()} />
            <Box 
                {...getCheckboxProps()}
                cursor='pointer'
                borderWidth='1px'
                borderRadius='md'
                boxShadow='md'
                _checked={{
                  bg: 'teal.600',
                  color: 'white',
                  borderColor: 'teal.600',
                }}
                _focus={{
                  boxShadow: 'outline',
                }}
                px={5}
                py={3} >
                {props.value}
            </Box>
        </Box>
    </>)
}

function RadioBtns({ label, dataKey, options }) {
    const [settings, setSettings] = useGameSettings()
    const {getRootProps, getRadioProps} = useRadioGroup({
        name: dataKey,
        value: settings[dataKey],
        onChange: (v) => setSettings({...settings, [dataKey]: v} ),
      })

    return (
    <Stack>
        <InputGroup>
            <Label><LabelDiv>{label}</LabelDiv></Label>
            <InputContainer>
                <ButtonGroup {...getRootProps()} isAttached >
                    {options.map(o => <RadioCard 
                        key={o}
                        {...getRadioProps({ value: o })}
                        label={o}
                    />)}
                </ButtonGroup>
            </InputContainer>
        </InputGroup>
    </Stack>
    )
}

function AnimalCheckbox({animal}) {
    const { state, getCheckboxProps, getInputProps, getLabelProps, htmlProps } = useCheckbox({
        isChecked: animal.active,
        onChange: () => {
            animal.active = !animal.active
            setSettings(s => ({...s}))
        }
    })
    const [ _, setSettings] = useGameSettings()
    

    return (
     <chakra.label cursor='pointer' ml="4" {...htmlProps}>
         <input {...getInputProps()} hidden />
         <Box         
            {...getLabelProps()} 
            {...getCheckboxProps()} 
            backgroundColor={state.isChecked ? '#2C7A7B' : 'grey'}
            color={state.isChecked ? 'white' : 'white'}
            padding='7px 14px'
            margin='1px'
            borderRadius='30px'
            minWidth='100px'
            textAlign='center'
        >
            {animal.id}
        </Box>
     </chakra.label>   
    )
}

function ContentOptions() {
    const [settings] = useGameSettings() 

    return (
    <Stack>
        <InputGroup>
            <Label><LabelDiv>Content</LabelDiv></Label>
            <InputContainer>
                <AnimalsContainer>
                    {settings.content.map(animal => 
                        <AnimalCheckbox key={animal.id} animal={animal} />
                    )}
                </AnimalsContainer>
            </InputContainer>
        </InputGroup>
    </Stack>
    )
}

const SelectInputGroup = chakra('div', {
    baseStyle: {
        minWidth: 'md',
        maxWidth: 'md'
    }
})

function KeyboardOptions() {
    const [settings, setSettings] = useGameSettings()
    const update = (id) => {
        setSettings(s => {return {...s, keyboardInterface: keyboardOptions.find(o => o.id === id) }})
    }
    return (
    <VFlex>
        <InputGroup>
            <Label><LabelDiv>Keyboard interaction</LabelDiv></Label>
            <SelectInputGroup>
                <Select value={settings.keyboardInterface.id} onChange={ev => update(ev.target.value)}>
                    {keyboardOptions.map(o => 
                        <option key={o.id} value={o.id}>{o.id}</option>
                    )}
                </Select>
            </SelectInputGroup>
        </InputGroup>    
        <div>
            {settings.keyboardInterface.description}
        </div>    
    </VFlex>
    )
}

const PageContainer = styled(HFlex)`
    justify-content: center;
    padding: 10px 0px 20px 0px;
`

const Container = styled(VFlex)`
    max-width: 700px;

`

const PlayButton = chakra(Button, {
    baseStyle: {
        mt: 10,
        fontSize: 36,
        height: 16,
        width: '50%'
    }
})
export default function Settings() {
    const navigate = useNavigate()
    return (
        <PageContainer>
        <Container>
            <RadioBtns 
                label={"Language"} 
                dataKey={"language"}
                options={["English", "Japanese"]} />
            <KeyboardOptions />
            <ContentOptions />
            <RadioBtns 
                label={"Ordering"} 
                dataKey={"ordering"}
                options={["Alphabetical", "Shuffle"]} />
            <PlayButton onClick={() => navigate('/play')}>Play!</PlayButton>                       
        </Container>
        </PageContainer>
    )
} 