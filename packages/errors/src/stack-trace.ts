export function safeCaptureStackTrace(...args: Parameters<typeof Error.captureStackTrace>): void {
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(...args);
    }
}
