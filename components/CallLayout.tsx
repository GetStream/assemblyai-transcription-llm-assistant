'use client';

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
import { useCallback, useEffect, useRef, useState } from 'react';

export default function CallLayout(): JSX.Element {
  // Text to display what is transcribed from AssemblyAI
  const [transcribedText, setTranscribedText] = useState<string>('');

  // Collecting data from the Stream SDK using hooks
  const { useCallCallingState, useParticipantCount, useMicrophoneState } =
    useCallStateHooks();
  const participantCount = useParticipantCount();
  const callingState = useCallCallingState();
  const { mediaStream } = useMicrophoneState();

  const initializeAssemblyAI = useCallback(
    async function initializeAssemblyAI() {
      const transcriber = await createTranscriber(setTranscribedText);

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
    },
    [mediaStream]
  );

  useEffect(() => {
    const mic = initializeAssemblyAI().then(() => {
      console.log('Initialized Assembly AI');
    });

    return () => {
      // dispose assembly
      // mic.stopRecording();
    };
  }, [initializeAssemblyAI]);

  // const loader = useRef<Promise<void>>();
  // useEffect(() => {
  //   const load = (loader.current || Promise.resolve()).then(() =>
  //     import('../helpers/audio-processor.js').then(() => {
  //       const mic = initializeAssemblyAI().then(() => {
  //         console.log('Initialized Assembly AI');
  //       });
  //     })
  //   );
  // }, [initializeAssemblyAI]);

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
        <div className='flex items-center justify-center w-full absolute bottom-2'>
          <h3 className='text-white text-center bg-black rounded-xl px-6 py-1'>
            {transcribedText}
          </h3>
        </div>
      </div>
      <CallControls />
    </StreamTheme>
  );
}
