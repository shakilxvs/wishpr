// Voice recording + voice changer. Uses browser built-ins. No library needed.
import { LIMITS } from '@/constants/limits'

export type VoiceEffect = 'none' | 'deep' | 'chipmunk' | 'robot' | 'ghost'

let mediaRecorder: MediaRecorder | null = null
let audioStream:   MediaStream   | null = null
let recordedChunks: Blob[] = []

export async function startRecording(
  effect: VoiceEffect,
  onTick:     (seconds: number) => void,
  onFinished: (blob: Blob)      => void,
): Promise<void> {
  recordedChunks = []
  audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })

  const audioCtx    = new AudioContext()
  const source      = audioCtx.createMediaStreamSource(audioStream)
  const destination = audioCtx.createMediaStreamDestination()

  // Apply effect
  if (effect === 'none') {
    source.connect(destination)
  } else if (effect === 'deep') {
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'lowshelf'
    filter.frequency.value = 300
    filter.gain.value = 10
    source.connect(filter)
    filter.connect(destination)
  } else if (effect === 'chipmunk') {
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'highshelf'
    filter.frequency.value = 2000
    filter.gain.value = 12
    source.connect(filter)
    filter.connect(destination)
  } else if (effect === 'robot') {
    const distortion = audioCtx.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1
      curve[i] = ((Math.PI + 200) * x) / (Math.PI + 200 * Math.abs(x))
    }
    distortion.curve = curve
    source.connect(distortion)
    distortion.connect(destination)
  } else if (effect === 'ghost') {
    const convolver = audioCtx.createConvolver()
    const buf = audioCtx.createBuffer(2, audioCtx.sampleRate * 1.5, audioCtx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
    }
    convolver.buffer = buf
    source.connect(convolver)
    convolver.connect(destination)
  }

  mediaRecorder = new MediaRecorder(destination.stream)
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data) }
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' })
    audioStream?.getTracks().forEach(t => t.stop())
    audioCtx.close()
    onFinished(blob)
  }

  mediaRecorder.start(100)

  // Auto-stop after max seconds
  let elapsed = 0
  const timer = setInterval(() => {
    elapsed++
    onTick(elapsed)
    if (elapsed >= LIMITS.MAX_VOICE_SECONDS) {
      clearInterval(timer)
      stopRecording()
    }
  }, 1000)
}

export function stopRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}
