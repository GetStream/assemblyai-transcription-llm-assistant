import { StreamClient } from '@stream-io/node-sdk';

export async function POST(request: Request) {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  if (!apiKey) {
    return Response.error();
  }

  const streamSecret = process.env.STREAM_SECRET;

  if (!streamSecret) {
    return Response.error();
  }

  const serverClient = new StreamClient(apiKey, streamSecret);
  const body = await request.json();
  console.log('[/api/token] Body:', body);

  const userId = body?.userId;

  if (!userId) {
    return Response.error();
  }

  const token = serverClient.createToken(userId);

  const response = {
    userId: userId,
    token: token,
  };

  return Response.json(response);
}
