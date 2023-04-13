// When building the browser bundle, this import gets replaced by `globalThis.fetch`.
import fetchImpl from 'node-fetch';

export default fetchImpl;
