import { useGameSettings } from "Context"

export const useTtsApi = () => {
    return new Api(useGameSettings()[0])    
}
class Api {
    constructor(settings) {
        const langMap = {
            English: 'en',
            Japanese: 'jp'
          }
        this.language = langMap[settings.language]
    }

    async getAudio(text, signal) {
        const resp = await fetch("https://asia-northeast1-animal-sounds-341512.cloudfunctions.net/animal-sound-tts",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    animal: text,
                    voice: 'male',
                    language: this.language
                }),
                signal
            }
        )
        return await resp.json()
    }
}