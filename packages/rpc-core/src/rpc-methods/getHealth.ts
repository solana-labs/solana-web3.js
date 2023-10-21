type GetHealthApiResponse = 'ok';

export interface GetHealthApi {
    /**
     * Returns the health status of the node ("ok" if healthy).
     */
    getHealth(): GetHealthApiResponse;
}
