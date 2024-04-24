'use client';

import CallContainer from '@/components/CallContainer';
import ErrorScreen from '@/components/ErrorScreen';
import { User } from '@stream-io/video-client';
import { useCallback, useEffect, useState } from 'react';

type HomeState = {
  apiKey: string;
  user: User;
  token: string;
};

export default function Home() {
  const [homeState, setHomeState] = useState<HomeState | undefined>();
  const [error, setError] = useState<string | undefined>();
  const getUserTokenFunction = useCallback(getUserToken, []);

  useEffect(() => {
    // TODO: replace by login mechanism and real IDs
    const userId = 'SampleUser_6d798e3c-9cd1-4018-8940-b3bed4816dee';
    getUserTokenFunction(userId, 'Sample User');
  }, [getUserTokenFunction]);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (homeState) {
    return <CallContainer {...homeState} />;
  }

  return (
    <section className='w-screen-h-screen flex items-center justify-center'>
      <h1 className='animate-pulse'>Loading</h1>
    </section>
  );

  async function getUserToken(userId: string, userName: string) {
    const response = await fetch('/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId }),
    });

    const responseBody = await response.json();
    const token = responseBody.token;

    if (!token) {
      setError('No token found');
    }

    const user: User = {
      id: userId,
      name: userName,
      image: `https://getstream.io/random_png/?id=${userId}&name=${userName}`,
    };

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (apiKey) {
      setHomeState({ apiKey: apiKey, user: user, token: token });
    } else {
      setError('API key not found. Please add to your environment file.');
    }
  }
}
