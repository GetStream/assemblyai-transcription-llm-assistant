import { RealtimeTranscriber, RealtimeTranscript } from 'assemblyai';
import { getAssemblyToken } from './getAssemblyToken';
import { Dispatch, SetStateAction } from 'react';

export async function createTranscriber(
  setTranscribedText: Dispatch<SetStateAction<string>>,
  setLlamaActive: Dispatch<SetStateAction<boolean>>
): Promise<RealtimeTranscriber | undefined> {
  const token = await getAssemblyToken();
  console.log('Assembly token: ', token);
  if (!token) {
    console.error('No token found');
    return;
  }
  const transcriber = new RealtimeTranscriber({
    sampleRate: 16_000,
    token: token,
    wordBoost: ['Llama'],
    //   encoding: 'pcm_mulaw',
  });

  transcriber.on('open', ({ sessionId }) => {
    console.log(`Transcriber opened with session ID: ${sessionId}`);
  });

  transcriber.on('error', (error: Error) => {
    console.error('Transcriber error:', error);
    // TODO: close transcriber
    // await transcriber.close();
  });

  transcriber.on('close', (code: number, reason: string) => {
    console.log(`Transcriber closed with code ${code} and reason: ${reason}`);
    // TODO: clean up
    // transcriber = null;
  });

  const texts: any = {};
  transcriber.on('transcript', (transcript: RealtimeTranscript) => {
    if (!transcript.text) {
      console.error('Transcript is empty');
      return;
    }

    // Detect if we're asking something for the LLM
    if (transcript.text.toLowerCase().indexOf('llama') > 0) {
      console.info('[Transcript] Llama detected: ', transcript.text);
      setLlamaActive(true);
    } else {
      setLlamaActive(false);
    }
    if (transcript.message_type === 'PartialTranscript') {
      //   console.log('[Transcript] Partial:', transcript.text);
      let msg = '';
      texts[transcript.audio_start] = transcript.text;
      const keys = Object.keys(texts);
      // keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          msg += ` ${texts[key]}`;
        }
      }

      // console.log('Msg: ', msg);
      setTranscribedText(transcript.text);
    } else {
      //   console.log('[Transcript] Final:', transcript.text);
    }
  });

  return transcriber;
}
