export class Connection<TRpcEndpoint extends string> {
    #endpoint: TRpcEndpoint;
    constructor(putativeEndpoint: TRpcEndpoint) {
        if (/^https?:/.test(putativeEndpoint) === false) {
            throw new TypeError('Endpoint URL must start with `http:` or `https:`.');
        }
        this.#endpoint = putativeEndpoint;
    }
    get rpcEndpoint() {
        return this.#endpoint;
    }
}
