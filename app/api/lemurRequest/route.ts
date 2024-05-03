import { AssemblyAI } from 'assemblyai';

export async function POST(request: Request) {
  const apiKey = process.env.ASSEMBLY_API_KEY;
  if (!apiKey) {
    return Response.error();
  }

  const client = new AssemblyAI({ apiKey: apiKey });
  const body = await request.json();

  const prompt = body?.prompt;

  if (!prompt) {
    return Response.error();
  }
  const lemurResponse = await client.lemur.task({
    prompt: prompt,
    // My first prompt idea: 'You act as an assistant during a video call. You get a question and I want you to answer it directly without repeating it. If you do not know the answer, clearly state that.',
    input_text: prompt,
  });

  const response = {
    prompt: prompt,
    response: lemurResponse.response,
  };

  return Response.json(response);
}
