/**
 * EXAMPLE
 * Create a custom RPC transport that will only send a certain number of requests per second.
 *
 * Before running any of the examples in this monorepo, make sure to set up a test validator by
 * running `pnpm test:live-with-test-validator:setup` in the root directory.
 *
 * To run this example, execute `pnpm start` in this directory.
 */
import { createLoggerWithTimestamp } from '@solana/example-utils/createLogger.js';
import {
    ClusterUrl,
    createDefaultRpcTransport,
    createSolanaRpcFromTransport,
    mainnet,
    RpcTransportFromClusterUrl,
} from '@solana/web3.js';

const log = createLoggerWithTimestamp('Throttling transport');

/**
 * SETUP: Define the maximum requests-per-second this RPC should make.
 */
const MAX_RPS = 2;

/**
 * STEP 1: CUSTOM THROTTLING TRANSPORT
 * Create a function that will wrap an existing transport to implement rate-limiting logic. The
 * wrapper should delegate calls to the underlying transport as and when appropriate.
 */
type QueuedRequest<TClusterUrl extends ClusterUrl> = Readonly<{
    config: Parameters<RpcTransportFromClusterUrl<TClusterUrl>>[0];
    reject: (reason?: unknown) => void;
    requestNumber: number;
    resolve: (value: PromiseLike<unknown> | unknown) => void;
}>;
function getThrottledTransport<TClusterUrl extends ClusterUrl>(
    originalTransport: RpcTransportFromClusterUrl<TClusterUrl>,
): RpcTransportFromClusterUrl<TClusterUrl> {
    /**
     * Keep track of how many more requests are allowed to be made in the curent 1 second span.
     */
    let requestBudgetRemaining = MAX_RPS;
    /**
     * When the first request is made, schedule a reset of the request budget for 1 second from now,
     * and store the timer of that scheduled reset here.
     */
    let pendingQueueRunTimerId: NodeJS.Timeout | undefined;
    /**
     * Keep a queue of requests and resolve/reject functions.
     */
    const queuedRequests: QueuedRequest<TClusterUrl>[] = [];
    function processQueue() {
        if (requestBudgetRemaining === 0) {
            return;
        }
        log.debug({ numQueuedRequests: queuedRequests.length }, '[transport] Processing request queue');
        while (queuedRequests.length && requestBudgetRemaining > 0) {
            const request = queuedRequests.shift()!;
            log.debug({ requestBudgetRemaining }, '[transport] Processing request %d', request.requestNumber);
            if (request.config.signal?.aborted) {
                log.debug('[transport] Skipping aborted request %d', request.requestNumber);
                continue;
            }
            log.debug('[transport] Starting request %d', request.requestNumber);
            /**
             * When a request's slot comes up, delegate it to the underlying transport.
             */
            originalTransport(request.config).then(request.resolve).catch(request.reject);
            requestBudgetRemaining--;
            if (pendingQueueRunTimerId === undefined) {
                log.debug('[transport] Setting request budget reset deadline for 1 second from now');
                pendingQueueRunTimerId = setTimeout(() => {
                    log.debug('[transport] Replenishing request budget');
                    pendingQueueRunTimerId = undefined;
                    requestBudgetRemaining = MAX_RPS;
                    processQueue();
                }, 1_000 /* 1 second */);
            }
        }
    }
    let requestCount = 0;
    return function throttlingTransport(config) {
        /**
         * Whenever the throttling transport is called, return a promise for the response, to be
         * resolved by the rate-limiting request queue processor.
         */
        return new Promise((resolve, reject) => {
            queuedRequests.push({
                config,
                reject,
                requestNumber: ++requestCount,
                resolve,
            } as QueuedRequest<TClusterUrl>);
            if (config.signal) {
                config.signal.addEventListener('abort', function () {
                    reject(this.reason);
                });
            }
            processQueue();
        });
    } as RpcTransportFromClusterUrl<TClusterUrl>;
}

/**
 * STEP 2: RPC CONNECTION WITH CUSTOM TRANSPORT
 * Create a default RPC transport, wrap it in a throttled transport, then create a Solana RPC
 * instance from the resulting transport.
 */
const defaultTransport = createDefaultRpcTransport({
    url: mainnet('https://api.mainnet-beta.solana.com'),
});
const throttledTransport = getThrottledTransport(defaultTransport);
const throttledRpc = createSolanaRpcFromTransport(throttledTransport);

/**
 * STEP 3: MAKE 11 REQUESTS AT THE SAME TIME; CANCEL THE 8TH BEFORE IT STARTS
 * Verify using the logs that only two requests are made in any 1 second span of time, and that
 * the aborted request that has yet to be made gets skipped when its slot comes up.
 */
for (let ii = 1; ii <= 11; ii++) {
    let abortSignal;
    if (ii === 8) {
        // Set the 8th request to be aborted after 2.5 seconds; before it gets made.
        const abortController = new AbortController();
        abortSignal = abortController.signal;
        setTimeout(() => {
            log.debug('Aborting request 8');
            abortController.abort('Request 8 was aborted');
        }, 2_500 /* 2.5 seconds */);
    }
    throttledRpc
        .getLatestBlockhash()
        .send({ abortSignal })
        .then(({ value }) => log.info(value, 'Request %d succeeded', ii))
        .catch(error => log.error({ error }, 'Request %d failed', ii));
}
