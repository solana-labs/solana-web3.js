import { DropdownMenu } from '@radix-ui/themes';
import { useSignIn } from '@solana/react';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/react';
import React, { useCallback, useState } from 'react';

import { WalletMenuItemContent } from './WalletMenuItemContent';

type Props = Readonly<{
    onError(err: unknown): void;
    onSignIn(account: UiWalletAccount | undefined): void;
    wallet: UiWallet;
}>;

export function SignInMenuItem({ onSignIn, onError, wallet }: Props) {
    const signIn = useSignIn(wallet);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const handleSignInClick = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            try {
                setIsSigningIn(true);
                try {
                    const { account } = await signIn({
                        statement: 'You will enjoy being signed in.',
                    });
                    onSignIn(account);
                } finally {
                    setIsSigningIn(false);
                }
            } catch (e) {
                onError(e);
            }
        },
        [signIn, onSignIn, onError],
    );
    return (
        <DropdownMenu.Item onClick={handleSignInClick}>
            <WalletMenuItemContent loading={isSigningIn} wallet={wallet} />
        </DropdownMenu.Item>
    );
}
