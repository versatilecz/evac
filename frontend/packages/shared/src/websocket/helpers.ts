export function determineWebSocketURL(path: string, location: Location = self.location): URL {
  const schema = location.protocol.replace('http', 'ws')
  const hostname = location.host

  return new URL(path, `${schema}//${hostname}`)
}
