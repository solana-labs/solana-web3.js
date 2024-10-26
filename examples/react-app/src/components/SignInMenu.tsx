import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button, Callout, DropdownMenu } from '@radix-ui/themes';
import { SolanaSignIn } from '@solana/wallet-standard-features';
import type { UiWallet } from '@wallet-standard/react';
import { useWallets } from '@wallet-standard/react';
import { useContext, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { SelectedWalletAccountContext } from '../context/SelectedWalletAccountContext';
import { ErrorDialog } from './ErrorDialog';
import { SignInMenuItem } from './SignInMenuItem';
import { UnconnectableWalletMenuItem } from './UnconnectableWalletMenuItem';

type Props = Readonly<{
    children: React.ReactNode;
}>;

export function SignInMenu({ children }: Props) {
    const { current: NO_ERROR } = useRef(Symbol());
    const wallets = useWallets();
    const [_, setSelectedWalletAccount] = useContext(SelectedWalletAccountContext);
    const [error, setError] = useState(NO_ERROR);
    const [forceClose, setForceClose] = useState(false);
    function renderItem(wallet: UiWallet) {
        return (
            <ErrorBoundary
                fallbackRender={({ error }) => <UnconnectableWalletMenuItem error={error} wallet={wallet} />}
                key={`wallet:${wallet.name}`}
            >
                <SignInMenuItem
                    onSignIn={account => {
                        setSelectedWalletAccount(account);
                        setForceClose(true);
                    }}
                    onError={setError}
                    wallet={wallet}
                />
            </ErrorBoundary>
        );
    }
    const walletsThatSupportSignInWithSolana = [];
    for (const wallet of wallets) {
        if (wallet.features.includes(SolanaSignIn)) {
            walletsThatSupportSignInWithSolana.push(wallet);
        }
    }
    return (
        <>
            <DropdownMenu.Root open={forceClose ? false : undefined} onOpenChange={setForceClose.bind(null, false)}>
                <DropdownMenu.Trigger>
                    <Button>
                        {children}
                        <DropdownMenu.TriggerIcon />
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {walletsThatSupportSignInWithSolana.length === 0 ? (
                        <Callout.Root color="orange" highContrast>
                            <Callout.Icon>
                                <ExclamationTriangleIcon />
                            </Callout.Icon>
                            <Callout.Text>
                                This browser has no wallets installed that support{' '}
                                <a href="https://phantom.app/learn/developers/sign-in-with-solana" target="_blank">
                                    Sign In With Solana
                                </a>
                                .
                            </Callout.Text>
                        </Callout.Root>
                    ) : (
                        walletsThatSupportSignInWithSolana.map(renderItem)
                    )}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            {error !== NO_ERROR ? <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} /> : null}
        </>
    );
}
