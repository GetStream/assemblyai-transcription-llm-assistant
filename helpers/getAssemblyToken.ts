export async function getAssemblyToken(): Promise<string | undefined> {
  const response = await fetch('/api/assemblyToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const responseBody = await response.json();
  const token = responseBody.token;
  return token;
}
