import { AssemblyAI } from 'assemblyai';

export async function POST(request: Request) {
  const apiKey = process.env.ASSEMBLY_API_KEY;
  if (!apiKey) {
    return Response.error();
  }

  const client = new AssemblyAI({ apiKey: apiKey });
  const body = await request.json();

  const prompt = body?.prompt;
  const fullTranscript = body?.fullTranscription;

  if (!prompt) {
    return Response.error();
  }

  const finalPrompt = `You act as an assistant during a video call. You get a question and I want you to answer it directly without repeating it.
  If you do not know the answer, clearly state that.
  Here is the user question:
  ${prompt}`;

  const lemurResponse = await client.lemur.task({
    prompt: finalPrompt,
    input_text: 'This is a conversation during a video call. Here is the history of the call so far: ' + fullTranscript,
    // TODO: For now we just give some context, but here we could add the actual meeting text.
  });

  const response = {
    prompt: prompt,
    response: lemurResponse.response,
  };

  return Response.json(response);
}
