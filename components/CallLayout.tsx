'use client';

import Image from 'next/image';
import { createMicrophone } from '@/helpers/createMicrophone';
import { createTranscriber } from '@/helpers/createTranscriber';
import { CallingState } from '@stream-io/video-client';
import {
  useCallStateHooks,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useCallback, useEffect, useState } from 'react';
import robotImage from '../assets/robot.png';
import llamaImage from '../assets/llama.png';
import { RealtimeTranscriber } from 'assemblyai';

export default function CallLayout(): JSX.Element {
  // Text to display what is transcribed from AssemblyAI
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [robotActive, setRobotActive] = useState<boolean>(false);
  const [llamaActive, setLlamaActive] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [processingPrompt, setProcessingPrompt] = useState<boolean>(false);
  const [llamaResponse, setLlamaResponse] = useState<string>('');
  const [transcriber, setTranscriber] = useState<
    RealtimeTranscriber | undefined
  >(undefined);
  const [mic, setMic] = useState<
    | {
        startRecording(onAudioCallback: any): Promise<void>;
        stopRecording(): void;
      }
    | undefined
  >(undefined);
  // Collecting data from the Stream SDK using hooks
  const { useCallCallingState, useParticipantCount, useMicrophoneState } =
    useCallStateHooks();
  const participantCount = useParticipantCount();
  const callingState = useCallCallingState();
  const { mediaStream } = useMicrophoneState();

  const initializeAssemblyAI = useCallback(
    async function initializeAssemblyAI() {
      const transcriber = await createTranscriber(
        setTranscribedText,
        setLlamaActive,
        setPrompt
      );

      if (!transcriber) {
        console.error('Transcriber is not created');
        return;
      }
      await transcriber.connect();

      if (!mediaStream) {
        console.error('No media stream found');
        return;
      }
      const mic = createMicrophone(mediaStream);
      console.log('Mic: ', mic, ', starting recording');
      mic.startRecording((audioData: any) => {
        // console.log('[Option 2] Audio data: ', audioData);
        transcriber.sendAudio(audioData);
      });
      setMic(mic);
      setTranscriber(transcriber);
    },
    [mediaStream]
  );

  const processPrompt = useCallback(
    async function processPrompt(prompt: string) {
      if (!processingPrompt) {
        setProcessingPrompt(true);
        const response = await fetch('/api/lemurRequest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt }),
        });

        const responseBody = await response.json();
        const lemurResponse = responseBody.response;
        console.log(lemurResponse);
        setLlamaResponse(lemurResponse);
        setProcessingPrompt(false);

        setTimeout(() => {
          setLlamaResponse('');
        }, 5000);
      }
    },
    [processingPrompt]
  );

  useEffect(() => {
    if (!llamaActive) {
      console.info('Prompt input is done.');
      console.info('Prompt: ', prompt);
      if (prompt.length > 0) {
        processPrompt(prompt);
      }
      setPrompt('');
    }
  }, [llamaActive, prompt, processPrompt]);

  useEffect(() => {
    if (robotActive) {
      console.log('Robot is active');
      initializeAssemblyAI().then(() => {
        console.log('Initialized Assembly AI');
      });
    } else {
      if (mic) {
        mic.stopRecording();
        transcriber?.close(false);
        setMic(undefined);
        setTranscriber(undefined);
      }
    }
  }, [robotActive, initializeAssemblyAI, mic, transcriber]);

  if (callingState !== CallingState.JOINED) {
    return (
      <section className='h-screen w-screen flex items-center justify-center animate-pulse font-bold'>
        Loading...
      </section>
    );
  }

  return (
    <StreamTheme>
      <h2>Participants: {participantCount}</h2>
      <div className='relative overflow-hidden rounded-xl'>
        <SpeakerLayout participantsBarPosition='bottom' />
        {llamaResponse && (
          <div className='absolute top-4 right-4 bg-white text-black p-2 rounded-lg shadow-md'>
            {llamaResponse}
          </div>
        )}
        <div className='flex items-center justify-center w-full absolute bottom-2'>
          <h3 className='text-white text-center bg-black rounded-xl px-6 py-1'>
            {transcribedText}
          </h3>
        </div>
        <div
          className={`absolute transition ease-in-out duration-300 bottom-1 right-4 ${
            llamaActive
              ? 'translate-x-0 translate-y-0 opacity-100'
              : 'translate-x-60 translate-y-60 opacity-0'
          }`}
        >
          <Image
            src={llamaImage}
            width={200}
            height={200}
            alt='llama'
            className='relative'
          />
        </div>
      </div>
      <div className='flex items-center justify-between mx-4'>
        <CallControls />
        <button
          className='ml-8'
          onClick={() => setRobotActive((currentValue) => !currentValue)}
        >
          <Image
            src={robotImage}
            width={50}
            height={50}
            alt='robot'
            className={`border-2 border-black dark:bg-white rounded-full transition-colors ease-in-out duration-200 ${
              robotActive ? 'bg-black animate-pulse' : ''
            }`}
          />
        </button>
      </div>
    </StreamTheme>
  );
}
