import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Text, Tooltip } from '@radix-ui/themes';
import { address } from '@solana/web3.js';
import type { UiWalletAccount } from '@wallet-standard/react';
import { useContext, useMemo } from 'react';
import useSWRSubscription from 'swr/subscription';

import { ChainContext } from '../context/ChainContext';
import { RpcContext } from '../context/RpcContext';
import { getErrorMessage } from '../errors';
import { balanceSubscribe } from '../functions/balance';
import { ErrorDialog } from './ErrorDialog';

type Props = Readonly<{
    account: UiWalletAccount;
}>;

const seenErrors = new WeakSet();

export function Balance({ account }: Props) {
    const { chain } = useContext(ChainContext);
    const { rpc, rpcSubscriptions } = useContext(RpcContext);
    const subscribe = useMemo(() => balanceSubscribe.bind(null, rpc, rpcSubscriptions), [rpc, rpcSubscriptions]);
    const { data: lamports, error } = useSWRSubscription({ address: address(account.address), chain }, subscribe);
    if (error && !seenErrors.has(error)) {
        return (
            <>
                <ErrorDialog
                    error={error}
                    key={`${account.address}:${chain}`}
                    onClose={() => {
                        seenErrors.add(error);
                    }}
                    title="Failed to fetch account balance"
                />
                <Text>
                    <Tooltip content={<>Could not fetch balance: {getErrorMessage(error, 'Unknown reason')}</>}>
                        <ExclamationTriangleIcon
                            color="red"
                            style={{ height: 16, verticalAlign: 'text-bottom', width: 16 }}
                        />
                    </Tooltip>
                </Text>
            </>
        );
    } else if (lamports == null) {
        return <Text>&ndash;</Text>;
    } else {
        const formattedSolValue = new Intl.NumberFormat(undefined, { maximumFractionDigits: 5 }).format(
            // @ts-expect-error This format string is 100% allowed now.
            `${lamports}E-9`,
        );
        return <Text>{`${formattedSolValue} \u25CE`}</Text>;
    }
}
