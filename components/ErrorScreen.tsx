export default function ErrorScreen({ error }: { error: string }): JSX.Element {
  return (
    <section className='w-screen h-screen flex items-center justify-center bg-red-100'>
      <h2>{error}</h2>
    </section>
  );
}
