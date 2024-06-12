'use client';

import { CallingState } from '@stream-io/video-client';
import {
  useCallStateHooks,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

export default function CallLayout(): JSX.Element {
  // Collecting data from the Stream SDK using hooks
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const callingState = useCallCallingState();

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
      </div>
      <div className='flex items-center justify-between mx-4'>
        <CallControls />
      </div>
    </StreamTheme>
  );
}
