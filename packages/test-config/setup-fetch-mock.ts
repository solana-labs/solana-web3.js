import fetchMock, { enableFetchMocks } from 'jest-fetch-mock-fork';
enableFetchMocks();

beforeEach(() => {
    fetchMock.doMock();
});

afterEach(() => {
    fetchMock.resetMocks();
    fetchMock.dontMock();
});
