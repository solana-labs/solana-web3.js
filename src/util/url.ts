// Implement makeWebsocketUrl without URL object as it is problematic in react native
export const makeWebsocketUrl = (endpoint: string) => {
  var match = endpoint.match([
    '^(https?:)//', // protocol
    '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
    '(/{0,1}[^?#]*)', // pathname
    '(\\?[^#]*|)', // search
  ].join(''));
  if (!match) {
    throw new Error('Failed to parse endpoint: ' + endpoint);
  }
  let protocol = match[1];
  let host = match[2];
  let hostname = match[3];
  let port = match[4];
  let pathname = match[5];
  let search = match[6];
  if (protocol === 'https:') {
    protocol = 'wss:';
  } else {
    protocol = 'ws:';
  }
  if (port) {
    port = String(Number(port) + 1);
    return protocol + '//' + hostname + ':' + port + pathname + search;
  }
  return protocol + '//' + host + pathname + search;
};

/*** This function left here as is from solana repository to provide conflictless merge

export function makeWebsocketUrl(endpoint: string) {
  let url = new URL(endpoint);
  const useHttps = url.protocol === 'https:';

  url.protocol = useHttps ? 'wss:' : 'ws:';
  url.host = '';

  // Only shift the port by +1 as a convention for ws(s) only if given endpoint
  // is explictly specifying the endpoint port (HTTP-based RPC), assuming
  // we're directly trying to connect to solana-validator's ws listening port.
  // When the endpoint omits the port, we're connecting to the protocol
  // default ports: http(80) or https(443) and it's assumed we're behind a reverse
  // proxy which manages WebSocket upgrade and backend port redirection.
  if (url.port !== '') {
    url.port = String(Number(url.port) + 1);
  }
  return url.toString();
}
*/