import {
  Call,
  StreamCall,
  useStreamVideoClient,
} from '@stream-io/video-react-sdk';
import { useCallback, useEffect, useState } from 'react';
import CallLayout from './CallLayout';
import {
  AssemblyAI,
  RealtimeTranscriber,
  RealtimeTranscript,
} from 'assemblyai';

export default function MyCall({ callId }: { callId: string }): JSX.Element {
  const [call, setCall] = useState<Call | undefined>(undefined);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const client = useStreamVideoClient();

  const [joining, setJoining] = useState(false);

  const registerTranscriptionCallback = useCallback(registerTranscription, []);

  const createCall = useCallback(async () => {
    const callToCreate = client?.call('default', callId);
    await callToCreate?.camera.disable();
    await callToCreate?.join({ create: true });
    if (callToCreate) {
      registerTranscriptionCallback(callToCreate);
    } else {
      console.error('No call to register transcriptions for.');
    }
    setCall(callToCreate);
    setJoining(false);
  }, [client, callId, registerTranscriptionCallback]);

  useEffect(() => {
    if (!client) {
      console.error('No client in MyCall component');
      return;
    }

    if (!call) {
      if (joining) {
        createCall();
      } else {
        setJoining(true);
      }
    }
  }, [call, client, createCall, joining]);

  if (!call) {
    return (
      <div className='w-full h-full text-xl font-semibold flex items-center justify-center animate-pulse'>
        Joining call ...
      </div>
    );
  }

  return (
    <StreamCall call={call}>
      <CallLayout transcribedText={transcribedText} />
    </StreamCall>
  );

  async function registerTranscription(call: Call) {
    // registerProcessor('audio-processor', AudioProcessor);
    const transcriber = await createTranscriber();
    if (!transcriber) {
      console.error('Transcriber is not created');
      return;
    }
    await transcriber.connect();
    const audioContext = new AudioContext({
      sampleRate: 16_000,
      latencyHint: 'balanced',
    });
    const registration = call.microphone.registerFilter(async (mediaStream) => {
      const source = audioContext.createMediaStreamSource(mediaStream);
      const destination = audioContext.createMediaStreamDestination();

      // const audioTracks = mediaStream.getAudioTracks();
      // if (audioTracks.length === 0) {
      //   console.error('No audio tracks found');
      //   return destination.stream;
      // }
      // const audioTrack = audioTracks[0];
      // const audioStream = new MediaStream([audioTrack]);
      // const transcriberStream = transcriber.stream();

      const t = createMicrophone(mediaStream, audioContext);
      t.startRecording((audioData: any) => {
        console.log(audioData);
      });

      // transcriber.sendAudio(source.context.audioWorklet);

      // Errors due to type mismatches
      // Readable.from(audioStream);
      // mediaStream.pipeTo(transcriber.stream());

      // Assembly example using the microphone
      // Readable.toWeb(recording.stream()).pipeTo(transcriber.stream())

      source.connect(destination);
      return destination.stream;
    });
  }

  async function createTranscriber(): Promise<RealtimeTranscriber | undefined> {
    const assemblyAIApiKey = process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY;

    if (!assemblyAIApiKey) {
      console.error('No AssemblyAI API key found');
      return;
    }
    console.info(assemblyAIApiKey);
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY!,
    });

    const token = await getAssemblyToken();
    console.log('Assembly token: ', token);
    const transcriber = client.realtime.transcriber({
      sampleRate: 16_000,
      token: token,
      //   wordBoost: ['Custom Keyword for Triggering LLM']
      //   encoding: 'pcm_mulaw',
    });

    transcriber.on('open', ({ sessionId }) => {
      console.log(`Transcriber opened with session ID: ${sessionId}`);
    });

    transcriber.on('error', (error: Error) => {
      console.error('Transcriber error:', error);
      // TODO: close transcriber
      // await transcriber.close();
    });

    transcriber.on('close', (code: number, reason: string) => {
      console.log(`Transcriber closed with code ${code} and reason: ${reason}`);
      // TODO: clean up
      // transcriber = null;
    });

    const texts: any = {};
    transcriber.on('transcript', (transcript: RealtimeTranscript) => {
      if (!transcript.text) {
        console.error('Transcript is empty');
        return;
      }

      if (transcript.message_type === 'PartialTranscript') {
        console.log('Partial:', transcript.text);
        let msg = '';
        texts[transcript.audio_start] = transcript.text;
        const keys = Object.keys(texts);
        // keys.sort((a, b) => a - b);
        for (const key of keys) {
          if (texts[key]) {
            msg += ` ${texts[key]}`;
          }
        }

        console.log('Msg: ', msg);
        setTranscribedText(msg);
      } else {
        console.log('Final:', transcript.text);
      }
    });

    return transcriber;
  }
}

async function getAssemblyToken(): Promise<string | undefined> {
  const response = await fetch('/api/assemblyToken', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  const token = responseBody.token;
  return token;
}

function createMicrophone(stream: MediaStream, audioContext: AudioContext) {
  let audioWorkletNode;
  let source;
  let audioBufferQueue = new Int16Array(0);
  return {
    async startRecording(onAudioCallback: any) {
      source = audioContext.createMediaStreamSource(stream);

      await audioContext.audioWorklet.addModule('audio-processor.js');
      audioWorkletNode = new AudioWorkletNode(audioContext, 'audio-processor');

      source.connect(audioWorkletNode);
      audioWorkletNode.connect(audioContext.destination);
      audioWorkletNode.port.onmessage = (event) => {
        const currentBuffer = new Int16Array(event.data.audio_data);
        audioBufferQueue = mergeBuffers(audioBufferQueue, currentBuffer);

        const bufferDuration =
          (audioBufferQueue.length / audioContext.sampleRate) * 1000;

        // wait until we have 100ms of audio data
        if (bufferDuration >= 100) {
          const totalSamples = Math.floor(audioContext.sampleRate * 0.1);

          const finalBuffer = new Uint8Array(
            audioBufferQueue.subarray(0, totalSamples).buffer
          );

          audioBufferQueue = audioBufferQueue.subarray(totalSamples);
          if (onAudioCallback) onAudioCallback(finalBuffer);
        }
      };
    },
    stopRecording() {
      stream?.getTracks().forEach((track) => track.stop());
      audioContext?.close();
      audioBufferQueue = new Int16Array(0);
    },
  };
}
function mergeBuffers(lhs: any, rhs: any) {
  const mergedBuffer = new Int16Array(lhs.length + rhs.length);
  mergedBuffer.set(lhs, 0);
  mergedBuffer.set(rhs, lhs.length);
  return mergedBuffer;
}
