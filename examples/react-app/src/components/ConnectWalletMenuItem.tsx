import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { DropdownMenu, ThickChevronRightIcon } from '@radix-ui/themes';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/react';
import { uiWalletAccountsAreSame, useConnect, useDisconnect } from '@wallet-standard/react';
import { useCallback, useContext } from 'react';

import { SelectedWalletAccountContext } from '../context/SelectedWalletAccountContext';
import { WalletMenuItemContent } from './WalletMenuItemContent';

type Props = Readonly<{
    onAccountSelect(account: UiWalletAccount | undefined): void;
    onDisconnect(wallet: UiWallet): void;
    onError(err: unknown): void;
    wallet: UiWallet;
}>;

export function ConnectWalletMenuItem({ onAccountSelect, onDisconnect, onError, wallet }: Props) {
    const [isConnecting, connect] = useConnect(wallet);
    const [isDisconnecting, disconnect] = useDisconnect(wallet);
    const isPending = isConnecting || isDisconnecting;
    const isConnected = wallet.accounts.length > 0;
    const [selectedWalletAccount] = useContext(SelectedWalletAccountContext);
    const handleConnectClick = useCallback(async () => {
        try {
            const existingAccounts = [...wallet.accounts];
            const nextAccounts = await connect();
            // Try to choose the first never-before-seen account.
            for (const nextAccount of nextAccounts) {
                if (!existingAccounts.some(existingAccount => uiWalletAccountsAreSame(nextAccount, existingAccount))) {
                    onAccountSelect(nextAccount);
                    return;
                }
            }
            // Failing that, choose the first account in the list.
            if (nextAccounts[0]) {
                onAccountSelect(nextAccounts[0]);
            }
        } catch (e) {
            onError(e);
        }
    }, [connect, onAccountSelect, onError, wallet.accounts]);
    return (
        <DropdownMenu.Sub open={!isConnected ? false : undefined}>
            <DropdownMenuPrimitive.SubTrigger
                asChild={false}
                className={[
                    'rt-BaseMenuItem',
                    'rt-BaseMenuSubTrigger',
                    'rt-DropdownMenuItem',
                    'rt-DropdownMenuSubTrigger',
                ].join(' ')}
                disabled={isPending}
                onClick={!isConnected ? handleConnectClick : undefined}
            >
                <WalletMenuItemContent loading={isPending} wallet={wallet} />
                {isConnected ? (
                    <div className="rt-BaseMenuShortcut rt-DropdownMenuShortcut">
                        <ThickChevronRightIcon className="rt-BaseMenuSubTriggerIcon rt-DropdownMenuSubtriggerIcon" />
                    </div>
                ) : null}
            </DropdownMenuPrimitive.SubTrigger>
            <DropdownMenu.SubContent>
                <DropdownMenu.Label>Accounts</DropdownMenu.Label>
                <DropdownMenu.RadioGroup value={selectedWalletAccount?.address}>
                    {wallet.accounts.map(account => (
                        <DropdownMenu.RadioItem
                            key={account.address}
                            value={account.address}
                            onSelect={() => {
                                onAccountSelect(account);
                            }}
                        >
                            {account.address.slice(0, 8)}&hellip;
                        </DropdownMenu.RadioItem>
                    ))}
                </DropdownMenu.RadioGroup>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                    onSelect={async e => {
                        e.preventDefault();
                        await handleConnectClick();
                    }}
                >
                    Connect More
                </DropdownMenu.Item>
                <DropdownMenu.Item
                    color="red"
                    onSelect={async e => {
                        e.preventDefault();
                        try {
                            await disconnect();
                            onDisconnect(wallet);
                        } catch (e) {
                            onError(e);
                        }
                    }}
                >
                    Disconnect
                </DropdownMenu.Item>
            </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
    );
}
