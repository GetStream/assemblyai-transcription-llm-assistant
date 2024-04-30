import { CallingState } from '@stream-io/video-client';
import {
  useCallStateHooks,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

export default function CallLayout({
  transcribedText,
}: {
  transcribedText: string;
}): JSX.Element {
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
