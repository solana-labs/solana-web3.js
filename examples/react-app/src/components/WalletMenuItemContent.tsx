import { Avatar, Flex, Spinner, Text } from '@radix-ui/themes';
import type { UiWallet } from '@wallet-standard/react';
import React from 'react';

type Props = Readonly<{
    children?: React.ReactNode;
    loading?: boolean;
    wallet: UiWallet;
}>;

export function WalletMenuItemContent({ children, loading, wallet }: Props) {
    return (
        <Flex align="center" gap="2">
            <Spinner loading={!!loading}>
                <Avatar
                    fallback={<Text size="1">{wallet.name.slice(0, 1)}</Text>}
                    radius="none"
                    src={wallet.icon}
                    style={{ height: 18, width: 18 }}
                />
            </Spinner>
            <Text truncate>{children ?? wallet.name}</Text>
        </Flex>
    );
}
