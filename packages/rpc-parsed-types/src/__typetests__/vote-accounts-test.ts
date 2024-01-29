import { Address } from '@solana/addresses';
import { Epoch, Slot, StringifiedBigInt, UnixTimestamp } from '@solana/rpc-types';

import { JsonParsedVoteAccount } from '../vote-accounts';

const account = {
    info: {
        authorizedVoters: [
            {
                authorizedVoter: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr' as Address,
                epoch: 529n as Epoch,
            },
        ],
        authorizedWithdrawer: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr' as Address,
        commission: 50,
        epochCredits: [
            {
                credits: '68697256' as StringifiedBigInt,
                epoch: 466n as Epoch,
                previousCredits: '68325825' as StringifiedBigInt,
            },
            {
                credits: '69068118' as StringifiedBigInt,
                epoch: 467n as Epoch,
                previousCredits: '68697256' as StringifiedBigInt,
            },
        ],
        lastTimestamp: {
            slot: 228884530n as Slot,
            timestamp: 1689090220 as UnixTimestamp,
        },
        nodePubkey: 'HMU77m6WSL9Xew9YvVCgz1hLuhzamz74eD9avi4XPdr' as Address,
        priorVoters: [],
        rootSlot: 228884499n as Slot,
        votes: [
            {
                confirmationCount: 31,
                slot: 228884500n as Slot,
            },
            {
                confirmationCount: 30,
                slot: 228884501n as Slot,
            },
        ],
    },
};

account satisfies JsonParsedVoteAccount;
