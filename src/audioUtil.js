import { sleep } from "utils";

var _audioCtx = undefined
const getAudioCtx = () => {
    if (_audioCtx === undefined)
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx
}

export const playAudio = async (audioBuffer, signal, maxDuration = 4) => {
    const audioCtx = getAudioCtx()
    const audioSource = audioCtx.createBufferSource();
    const b = await audioCtx.decodeAudioData(audioBuffer)
    audioSource.buffer = b
    audioSource.connect(audioCtx.destination)
    audioSource.start(0)
    await sleep((Math.min(b.duration, maxDuration) + .3) * 1000, {signal})
    audioSource.stop()
}