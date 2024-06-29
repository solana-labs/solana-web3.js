import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Box, DropdownMenu, Text } from '@radix-ui/themes';
import type { UiWallet } from '@wallet-standard/react';
import { useState } from 'react';

import { ErrorDialog } from './ErrorDialog';
import { WalletMenuItemContent } from './WalletMenuItemContent';

type Props = Readonly<{
    error: unknown;
    wallet: UiWallet;
}>;

export function UnconnectableWalletMenuItem({ error, wallet }: Props) {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    return (
        <>
            <DropdownMenu.Item disabled onClick={() => setDialogIsOpen(true)}>
                <WalletMenuItemContent wallet={wallet}>
                    <Text style={{ textDecoration: 'line-through' }}>{wallet.name}</Text>
                </WalletMenuItemContent>
                <Box className="rt-BaseMenuShortcut rt-DropdownMenuShortcut">
                    <ExclamationTriangleIcon
                        className="rt-BaseMenuSubTriggerIcon rt-DropdownMenuSubtriggerIcon"
                        style={{ height: 14, width: 14 }}
                    />
                </Box>
            </DropdownMenu.Item>
            {dialogIsOpen ? (
                <ErrorDialog error={error} onClose={() => setDialogIsOpen(false)} title="Unconnectable wallet" />
            ) : null}
        </>
    );
}
