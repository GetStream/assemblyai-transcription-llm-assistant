![Blog-BuildAI-VideoCalling-2400x1350px](https://github.com/user-attachments/assets/2b112203-9c90-4b28-9b28-a09bf01e4d9f)

# Build an AI-powered video conferencing app with Next.js and AssemblyAI

This project demonstrates how to build a video conferencing app with [Next.js](https://nextjs.org) and [AssemblyAI](https://www.assemblyai.com).

It shows how to set up live transcription services as well as a fun LLM integration to have a personal AI assistant ready by simply saying a trigger word.

To get a detailed walk-through of the project, you can follow the [blog post](https://www.assemblyai.com/blog/p/73107aeb-1325-4fcb-a045-90cda59fa755/).

Features:

- Video calling, powered by [Stream](https://getstream.io/try-for-free/)
- Realtime transcriptions powered by AssemblyAI
- LLM integration by calling a trigger word (using AssemblyAI's LeMUR integration)
- Access the history of the meeting when asking the LLM questions

# Running the project locally

Follow these steps to get the project up and running for you.

## Step 0: Project requirements

This project requires us to have [Node.js 18.17](https://nodejs.org/) or later installed to build with [Next.js](https://nextjs.org/).

## Step 1: Setup access to a Stream backend

Head to the [Stream Dashboard](https://dashboard.getstream.io/) and create an account. Create a new project to build up your application (all handled and managed by Stream).

This is necessary because you need two properties from this.

1. Your API key
2. Your Secret

See the red rectangle in the screenshot below on where you can retrieve this information from the Dashboard.

<img width="1511" alt="stream-apikey-and-secret" src="https://github.com/GetStream/nextjs-chat-template/assets/12433593/40201ab8-4c55-426d-94bc-e89649849ffc">

Create a `.env.local` file at the project's root and add the API key and the secret. A template file (`.env.template`) is available to view. Ensure you follow the correct naming conventions.

Inside `app/page.tsx`, you must update the values of `userId` and `userName` to be actual values instead of `undefined`.

If you forget to do this, your app will show an error, displaying what you have missed.

## Step 2: Setup an AssemblyAI account

Follow the link to create an [AssemblyAI Account](https://www.assemblyai.com/) for the real-time transcription and LLM functionality.

## Step 3: Run the project

First, install all the dependencies for the project:

```bash
npm install
# or
yarn
```

You're ready to run the app with the command:

```bash
npm run dev
# or
yarn dev
```

---

If you want to learn more you can also check out these links:

- [AssemblyAI Streaming Docs](https://www.assemblyai.com/docs/getting-started/transcribe-streaming-audio-from-a-microphone/typescript)
- [AssemblyAI LeMUR Docs](https://www.assemblyai.com/docs/lemur/ask-questions)
- [Stream Video Docs](https://gstrm.io/video-docs-assemblyai)
- [Stream Chat Docs](https://gstrm.io/chat-docs-assemblyai)
- [Stream React SDK](https://gstrm.io/video-react-docs-assemblyai)
