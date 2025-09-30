/**
 * Determines the WebSocket URL based on the current location and endpoint path
 */
export function determineWebSocketURL(endpoint: string, location: Location): URL {
  // Convert HTTP protocol to WebSocket protocol
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'

  // Use the same host and port as the current page
  const host = location.host

  // Construct the WebSocket URL
  const wsUrl = new URL(`${protocol}//${host}${endpoint}`)

  return wsUrl
}
