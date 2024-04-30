import { AssemblyAI } from 'assemblyai';

export async function GET() {
  const apiKey = process.env.ASSEMBLY_API_KEY;
  if (!apiKey) {
    return Response.error();
  }

  const assemblyClient = new AssemblyAI({ apiKey: apiKey });

  const token = await assemblyClient.realtime.createTemporaryToken({
    expires_in: 3_600,
  });

  const response = {
    token: token,
  };

  return Response.json(response);
}