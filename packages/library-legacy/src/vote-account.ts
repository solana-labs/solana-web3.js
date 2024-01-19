import * as BufferLayout from '@solana/buffer-layout';
import type {Buffer} from 'buffer';

import * as Layout from './layout';
import {PublicKey} from './publickey';
import {toBuffer} from './utils/to-buffer';

export const VOTE_PROGRAM_ID = new PublicKey(
  'Vote111111111111111111111111111111111111111',
);

export type Lockout = {
  slot: number;
  confirmationCount: number;
};

/**
 * History of how many credits earned by the end of each epoch
 */
export type EpochCredits = Readonly<{
  epoch: number;
  credits: number;
  prevCredits: number;
}>;

export type AuthorizedVoter = Readonly<{
  epoch: number;
  authorizedVoter: PublicKey;
}>;

type AuthorizedVoterRaw = Readonly<{
  authorizedVoter: Uint8Array;
  epoch: number;
}>;

type PriorVoters = Readonly<{
  buf: PriorVoterRaw[];
  idx: number;
  isEmpty: number;
}>;

export type PriorVoter = Readonly<{
  authorizedPubkey: PublicKey;
  epochOfLastAuthorizedSwitch: number;
  targetEpoch: number;
}>;

type PriorVoterRaw = Readonly<{
  authorizedPubkey: Uint8Array;
  epochOfLastAuthorizedSwitch: number;
  targetEpoch: number;
}>;

export type BlockTimestamp = Readonly<{
  slot: number;
  timestamp: number;
}>;

// https://github.com/solana-labs/solana/blob/v1.17/sdk/program/src/vote/state/vote_state_versions.rs#L4
type VoteAccountVersions = 'V0_23_5' | 'V1_14_11' | 'CURRENT' | 'UNKNOWN'
type VoteAccountVersion = Readonly<Record<VoteAccountVersions, {}>>
const VoteAccountVersionLayout = BufferLayout.union(BufferLayout.u32(), BufferLayout.struct([BufferLayout.u32()]));
VoteAccountVersionLayout.addVariant(0, BufferLayout.struct([]), 'V0_23_5');
VoteAccountVersionLayout.addVariant(1, BufferLayout.struct([]), 'V1_14_11');
VoteAccountVersionLayout.addVariant(2, BufferLayout.struct([]), 'CURRENT');

/**
 * See https://github.com/solana-labs/solana/blob/v1.17.15/sdk/program/src/vote/state/vote_state_1_14_11.rs#L8
 */
type VoteAccountData_1_14_11 = Readonly<{
  authorizedVoters: AuthorizedVoterRaw[];
  authorizedWithdrawer: Uint8Array;
  commission: number;
  epochCredits: EpochCredits[];
  lastTimestamp: BlockTimestamp;
  nodePubkey: Uint8Array;
  priorVoters: PriorVoters;
  rootSlot: number | null;
  votes: Lockout[];
}>;

/**
 * See https://github.com/solana-labs/solana/blob/v1.17.15/sdk/program/src/vote/state/vote_state_0_23_5.rs#L7
 */
type VoteAccountData_0_23_5 = Readonly<{
  nodePubkey: Uint8Array
  authorizedVoter: Uint8Array
  authorizedVoterEpoch: number
  priorVoters: PriorVoters
  authorizedWithdrawer: Uint8Array
  commission: number
  votes: Lockout[]
  rootSlot: number | null
  epochCredits: EpochCredits[]
  lastTimestamp: BlockTimestamp
}>

/**
 * See https://github.com/solana-labs/solana/blob/8a12ed029cfa38d4a45400916c2463fb82bbec8c/programs/vote_api/src/vote_state.rs#L68-L88
 *
 * @internal
 */
const VoteAccountLayout_1_14_11 = BufferLayout.struct<VoteAccountData_1_14_11>([
  Layout.publicKey('nodePubkey'),
  Layout.publicKey('authorizedWithdrawer'),
  BufferLayout.u8('commission'),
  BufferLayout.nu64(), // votes.length
  BufferLayout.seq<Lockout>(
    BufferLayout.struct([
      BufferLayout.nu64('slot'),
      BufferLayout.u32('confirmationCount'),
    ]),
    BufferLayout.offset(BufferLayout.u32(), -8),
    'votes',
  ),
  option(BufferLayout.nu64(), 'rootSlot'),
  BufferLayout.nu64(), // authorizedVoters.length
  BufferLayout.seq<AuthorizedVoterRaw>(
    BufferLayout.struct([
      BufferLayout.nu64('epoch'),
      Layout.publicKey('authorizedVoter'),
    ]),
    BufferLayout.offset(BufferLayout.u32(), -8),
    'authorizedVoters',
  ),
  BufferLayout.struct<PriorVoters>(
    [
      BufferLayout.seq(
        BufferLayout.struct([
          Layout.publicKey('authorizedPubkey'),
          BufferLayout.nu64('epochOfLastAuthorizedSwitch'),
          BufferLayout.nu64('targetEpoch'),
        ]),
        32,
        'buf',
      ),
      BufferLayout.nu64('idx'),
      BufferLayout.u8('isEmpty'),
    ],
    'priorVoters',
  ),
  BufferLayout.nu64(), // epochCredits.length
  BufferLayout.seq<EpochCredits>(
    BufferLayout.struct([
      BufferLayout.nu64('epoch'),
      BufferLayout.nu64('credits'),
      BufferLayout.nu64('prevCredits'),
    ]),
    BufferLayout.offset(BufferLayout.u32(), -8),
    'epochCredits',
  ),
  BufferLayout.struct<BlockTimestamp>(
    [BufferLayout.nu64('slot'), BufferLayout.nu64('timestamp')],
    'lastTimestamp',
  ),
]);

/** 
 * @internal
 */
const VoteAccountLayout_0_23_05 = BufferLayout.struct<VoteAccountData_0_23_5>([
  Layout.publicKey('nodePubkey'),
  Layout.publicKey('authorizedVoter'),
  BufferLayout.nu64('authorizedVoterEpoch'),
  BufferLayout.struct<PriorVoters>(
    [
      BufferLayout.seq(
        BufferLayout.struct([
          Layout.publicKey('authorizedPubkey'),
          BufferLayout.nu64('epochOfLastAuthorizedSwitch'),
          BufferLayout.nu64('targetEpoch'),
        ]),
        32,
        'buf'
      ),
      BufferLayout.nu64('idx'),
      BufferLayout.u8('isEmpty'),
    ],
    'priorVoters'
  ),
  Layout.publicKey('authorizedWithdrawer'),
  BufferLayout.u8('commission'),
  BufferLayout.nu64(), // votes.length
  BufferLayout.seq<Lockout>(
    BufferLayout.struct([
      BufferLayout.nu64('slot'),
      BufferLayout.u32('confirmationCount'),
    ]),
    BufferLayout.offset(BufferLayout.u32(), -8),
    'votes'
  ),
  option(BufferLayout.nu64(), 'rootSlot'),
  BufferLayout.nu64(), // epochCredits.length
  BufferLayout.seq<EpochCredits>(
    BufferLayout.struct([
      BufferLayout.nu64('epoch'),
      BufferLayout.nu64('credits'),
      BufferLayout.nu64('prevCredits'),
    ]),
    BufferLayout.offset(BufferLayout.u32(), -8),
    'epochCredits'
  ),
  BufferLayout.struct<BlockTimestamp>(
    [BufferLayout.nu64('slot'), BufferLayout.nu64('timestamp')],
    'lastTimestamp'
  ),
])

type VoteAccountArgs = {
  nodePubkey: PublicKey;
  authorizedWithdrawer: PublicKey;
  commission: number;
  rootSlot: number | null;
  votes: Lockout[];
  authorizedVoters: AuthorizedVoter[];
  priorVoters: PriorVoter[];
  epochCredits: EpochCredits[];
  lastTimestamp: BlockTimestamp;
};

/**
 * VoteAccount class
 */
export class VoteAccount {
  nodePubkey: PublicKey;
  authorizedWithdrawer: PublicKey;
  commission: number;
  rootSlot: number | null;
  votes: Lockout[];
  authorizedVoters: AuthorizedVoter[];
  priorVoters: PriorVoter[];
  epochCredits: EpochCredits[];
  lastTimestamp: BlockTimestamp;

  /**
   * @internal
   */
  constructor(args: VoteAccountArgs) {
    this.nodePubkey = args.nodePubkey;
    this.authorizedWithdrawer = args.authorizedWithdrawer;
    this.commission = args.commission;
    this.rootSlot = args.rootSlot;
    this.votes = args.votes;
    this.authorizedVoters = args.authorizedVoters;
    this.priorVoters = args.priorVoters;
    this.epochCredits = args.epochCredits;
    this.lastTimestamp = args.lastTimestamp;
  }

  /**
   * Deserialize VoteAccount from the account data.
   *
   * @param buffer account data
   * @return VoteAccount
   */
  static fromAccountData(
    buffer: Buffer | Uint8Array | Array<number>,
  ): VoteAccount {
    const versionOffset = 4;
    const version = VoteAccountVersionLayout.decode(toBuffer(buffer), 0) as VoteAccountVersion

    let voteAccountData: VoteAccountData_1_14_11 | VoteAccountData_0_23_5;
    let authorizedVoters: AuthorizedVoter[] = [];
    if (version.V0_23_5) {
      voteAccountData = VoteAccountLayout_0_23_05.decode(toBuffer(buffer), versionOffset)
      authorizedVoters = [{
        epoch: voteAccountData.authorizedVoterEpoch,
        authorizedVoter: new PublicKey(voteAccountData.authorizedVoter)
      }];
    } else if (version.V1_14_11 || version.CURRENT) {
      voteAccountData = VoteAccountLayout_1_14_11.decode(toBuffer(buffer), versionOffset)
      authorizedVoters = voteAccountData.authorizedVoters.map(parseAuthorizedVoter)
    } else {
      throw new Error(`fromAccountData: unknown vote account version: ${JSON.stringify(version)}`)
    }

    return new VoteAccount({
      nodePubkey: new PublicKey(voteAccountData.nodePubkey),
      authorizedWithdrawer: new PublicKey(voteAccountData.authorizedWithdrawer),
      commission: voteAccountData.commission,
      votes: voteAccountData.votes,
      rootSlot: voteAccountData.rootSlot,
      authorizedVoters,
      priorVoters: getPriorVoters(voteAccountData.priorVoters),
      epochCredits: voteAccountData.epochCredits,
      lastTimestamp: voteAccountData.lastTimestamp,
    });
  }
}

function parseAuthorizedVoter({
  authorizedVoter,
  epoch,
}: AuthorizedVoterRaw): AuthorizedVoter {
  return {
    epoch,
    authorizedVoter: new PublicKey(authorizedVoter),
  };
}

function parsePriorVoters({
  authorizedPubkey,
  epochOfLastAuthorizedSwitch,
  targetEpoch,
}: PriorVoterRaw): PriorVoter {
  return {
    authorizedPubkey: new PublicKey(authorizedPubkey),
    epochOfLastAuthorizedSwitch,
    targetEpoch,
  };
}

function getPriorVoters({buf, idx, isEmpty}: PriorVoters): PriorVoter[] {
  if (isEmpty) {
    return [];
  }

  return [
    ...buf.slice(idx + 1).map(parsePriorVoters),
    ...buf.slice(0, idx).map(parsePriorVoters),
  ];
}

/**
 *
 * See https://github.com/acheroncrypto/native-to-anchor/blob/master/client/packages/buffer-layout/src/index.ts
 */
export function option<T>(
  layout: BufferLayout.Layout<T>,
  property?: string
): BufferLayout.Layout<T | null> {
  return new OptionLayout<T>(layout, property)
}

class OptionLayout<T> extends BufferLayout.Layout<T | null> {
  layout: BufferLayout.Layout<T>
  discriminator: BufferLayout.Layout<number>

  constructor(layout: BufferLayout.Layout<T>, property?: string) {
    super(-1, property)
    this.layout = layout
    this.discriminator = BufferLayout.u8('option')
  }

  encode(src: T | null, b: Buffer, offset = 0): number {
    if (src === null || src === undefined) {
      return this.discriminator.encode(0, b, offset)
    }

    this.discriminator.encode(1, b, offset)
    return (
      this.discriminator.span +
      this.layout.encode(src, b, offset + this.discriminator.span)
    )
  }

  decode(b: Buffer, offset = 0): T | null {
    const discriminator = this.discriminator.decode(b, offset)
    if (discriminator === 0) {
      return null
    } else if (discriminator === 1) {
      return this.layout.decode(b, offset + this.discriminator.span)
    }

    throw new Error(
      `decode: Invalid option; discriminator: ${discriminator} : ${this.property}`
    )
  }

  getSpan(b: Buffer, offset = 0): number {
    const discriminator = this.discriminator.decode(b, offset)
    if (discriminator === 0) {
      return 1
    } else if (discriminator === 1) {
      return this.layout.getSpan(b, offset + 1) + 1
    }
    throw new Error('getSpan: Invalid option ' + this.property)
  }
}