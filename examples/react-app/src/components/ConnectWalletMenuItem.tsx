import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { DropdownMenu, ThickChevronRightIcon } from '@radix-ui/themes';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/react';
import { useConnect, useDisconnect } from '@wallet-standard/react';
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
    const handleClick = useCallback(async () => {
        try {
            if (isConnected) {
                await disconnect();
                onDisconnect(wallet);
            } else {
                const accounts = await connect();
                if (accounts[0]) {
                    onAccountSelect(accounts[0]);
                }
            }
        } catch (e) {
            onError(e);
        }
    }, [connect, disconnect, isConnected, onAccountSelect, onDisconnect, onError, wallet]);
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
                onClick={!isConnected ? handleClick : undefined}
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
