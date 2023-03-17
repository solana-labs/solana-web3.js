import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

beforeEach(() => {
    fetchMock.doMock();
});

afterEach(() => {
    fetchMock.resetMocks();
    fetchMock.dontMock();
});
