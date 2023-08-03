// TODO: Again, until we can manipulate the local validator more,
// this test can't be implemented properly.
describe('getHighestSnapshotSlot', () => {
    describe('when there is at least one valid snapshot', () => {
        it.todo('returns the highest snapshot slot information that the node has snapshots for');
    });

    describe('when there are no snapshots yet', () => {
        // TODO:
        //  Error code -32008
        //  Message: "No snapshot"
        it.todo('throws an error');
    });
});
