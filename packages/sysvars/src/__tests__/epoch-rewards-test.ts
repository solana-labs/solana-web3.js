import { getSysvarEpochRewardsCodec } from '../epoch-rewards';

describe('epoch rewards', () => {
    it('decode', () => {
        // prettier-ignore
        const epochRewardsState = new Uint8Array([
            0, 45, 49, 1, 0, 0, 0, 0,    // distributionCompleteBlockHeight
            134, 74, 2, 0, 0, 0, 0, 0,   // distributedRewards
            0, 132, 215, 23, 0, 0, 0, 0, // totalRewards
        ]);
        expect(getSysvarEpochRewardsCodec().decode(epochRewardsState)).toMatchObject({
            distributedRewards: 150_150n,
            distributionCompleteBlockHeight: 20_000_000n,
            totalRewards: 400_000_000n,
        });
    });
    // TODO: This account does not seem to exist on-chain yet.
    it.todo('fetch');
});
