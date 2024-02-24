import { fetch as undiciFetch } from 'undici';

globalThis.fetch = undiciFetch as unknown as typeof globalThis.fetch;
