import { useVideoClient } from '@/hooks/useVideoClient';
import { User } from '@stream-io/video-client';
import { StreamVideo } from '@stream-io/video-react-sdk';
import ErrorScreen from './ErrorScreen';
import MyCall from './MyCall';

export default function CallContainer({
  apiKey,
  user,
  token,
}: {
  apiKey: string;
  user: User;
  token: string;
}): JSX.Element {
  const videoClient = useVideoClient({
    apiKey,
    user,
    tokenOrProvider: token,
  });

  // TODO: replace by input mechanism
  const callId = '123412341234';
  if (videoClient) {
    return (
      <StreamVideo client={videoClient}>
        <MyCall callId={callId} />
      </StreamVideo>
    );
  }
  return <ErrorScreen error='Client could not be initialized' />;
}
