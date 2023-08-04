describe('getBlockCommitment', () => {
    // TODO: We need a good way to feed `getBlockCommitment` a recent block.
    // This would actually return a value for commitment.
    // This is tricky to do without `getSlot`, and we'll need some kind
    // of manipulation capability over test-validator to pull it off without
    // another RPC call.
    it.todo('returns the block commitment for a recent block');

    // TODO: We also need a reliable way to feed `getBlockCommitment` an old block.
    it.todo('returns the block commitment for an older block, which has null commitment');
});
