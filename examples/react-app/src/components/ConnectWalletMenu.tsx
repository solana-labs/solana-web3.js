import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button, Callout, DropdownMenu } from '@radix-ui/themes';
import { StandardConnect, StandardDisconnect } from '@wallet-standard/core';
import type { UiWallet } from '@wallet-standard/react';
import { uiWalletAccountBelongsToUiWallet, useWallets } from '@wallet-standard/react';
import { useContext, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { SelectedWalletAccountContext } from '../context/SelectedWalletAccountContext';
import { ConnectWalletMenuItem } from './ConnectWalletMenuItem';
import { ErrorDialog } from './ErrorDialog';
import { UnconnectableWalletMenuItem } from './UnconnectableWalletMenuItem';
import { WalletAccountIcon } from './WalletAccountIcon';

type Props = Readonly<{
    children: React.ReactNode;
}>;

export function ConnectWalletMenu({ children }: Props) {
    const { current: NO_ERROR } = useRef(Symbol());
    const wallets = useWallets();
    const [selectedWalletAccount, setSelectedWalletAccount] = useContext(SelectedWalletAccountContext);
    const [error, setError] = useState(NO_ERROR);
    const [forceClose, setForceClose] = useState(false);
    function renderItem(wallet: UiWallet) {
        return (
            <ErrorBoundary
                fallbackRender={({ error }) => <UnconnectableWalletMenuItem error={error} wallet={wallet} />}
                key={`wallet:${wallet.name}`}
            >
                <ConnectWalletMenuItem
                    onAccountSelect={account => {
                        setSelectedWalletAccount(account);
                        setForceClose(true);
                    }}
                    onDisconnect={wallet => {
                        if (selectedWalletAccount && uiWalletAccountBelongsToUiWallet(selectedWalletAccount, wallet)) {
                            setSelectedWalletAccount(undefined);
                        }
                    }}
                    onError={setError}
                    wallet={wallet}
                />
            </ErrorBoundary>
        );
    }
    const walletsThatSupportStandardConnect = [];
    const unconnectableWallets = [];
    for (const wallet of wallets) {
        if (wallet.features.includes(StandardConnect) && wallet.features.includes(StandardDisconnect)) {
            walletsThatSupportStandardConnect.push(wallet);
        } else {
            unconnectableWallets.push(wallet);
        }
    }
    return (
        <>
            <DropdownMenu.Root open={forceClose ? false : undefined} onOpenChange={setForceClose.bind(null, false)}>
                <DropdownMenu.Trigger>
                    <Button>
                        {selectedWalletAccount ? (
                            <>
                                <WalletAccountIcon account={selectedWalletAccount} width="18" height="18" />
                                {selectedWalletAccount.address.slice(0, 8)}
                            </>
                        ) : (
                            children
                        )}
                        <DropdownMenu.TriggerIcon />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {wallets.length === 0 ? (
                        <Callout.Root color="orange" highContrast>
                            <Callout.Icon>
                                <ExclamationTriangleIcon />
                            </Callout.Icon>
                            <Callout.Text>This browser has no wallets installed.</Callout.Text>
                        </Callout.Root>
                    ) : (
                        <>
                            {walletsThatSupportStandardConnect.map(renderItem)}
                            {unconnectableWallets.length ? (
                                <>
                                    <DropdownMenu.Separator />
                                    {unconnectableWallets.map(renderItem)}
                                </>
                            ) : null}
                        </>
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            {error !== NO_ERROR ? <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} /> : null}
        </>
    );
}
