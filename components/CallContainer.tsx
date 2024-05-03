import { useVideoClient } from '@/hooks/useVideoClient';
import { Call, User } from '@stream-io/video-client';
import { StreamCall, StreamVideo } from '@stream-io/video-react-sdk';
import ErrorScreen from './ErrorScreen';
import { useCallback, useEffect, useState } from 'react';
import CallLayout from './CallLayout';

export default function CallContainer({
  apiKey,
  user,
  token,
}: {
  apiKey: string;
  user: User;
  token: string;
}): JSX.Element {
  const [call, setCall] = useState<Call | undefined>(undefined);
  const [joining, setJoining] = useState(false);

  const videoClient = useVideoClient({
    apiKey,
    user,
    tokenOrProvider: token,
  });

  // TODO: replace by input mechanism
  const callId = '123412341234';

  const createCall = useCallback(async () => {
    const callToCreate = videoClient?.call('default', callId);
    await callToCreate?.camera.disable();
    await callToCreate?.join({ create: true });
    setCall(callToCreate);
    setJoining(false);
  }, [videoClient]);

  useEffect(() => {
    if (!videoClient) {
      return;
    }

    if (!call) {
      if (joining) {
        createCall();
      } else {
        setJoining(true);
      }
    }
  }, [call, videoClient, createCall, joining]);

  if (!call) {
    return (
      <div className='w-full h-full text-xl font-semibold flex items-center justify-center animate-pulse'>
        Joining call ...
      </div>
    );
  }

  if (!videoClient) {
    return <ErrorScreen error='Client could not be initialized' />;
  }

  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <CallLayout />
      </StreamCall>
    </StreamVideo>
  );
}
