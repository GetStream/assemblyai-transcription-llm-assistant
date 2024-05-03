export async function getAssemblyToken(): Promise<string | undefined> {
  const response = await fetch('/api/assemblyToken', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const responseBody = await response.json();
  const token = responseBody.token;
  return token;
}
