import { Badge, Box, DropdownMenu, Flex, Heading } from '@radix-ui/themes';
import { useContext } from 'react';

import { ChainContext } from '../context/ChainContext';
import { ConnectWalletMenu } from './ConnectWalletMenu';
import { SignInMenu } from './SignInMenu';

export function Nav() {
    const { displayName: currentChainName, chain, setChain } = useContext(ChainContext);
    const currentChainBadge = (
        <Badge color="gray" style={{ verticalAlign: 'middle' }}>
            {currentChainName}
        </Badge>
    );
    return (
        <Box
            style={{
                backgroundColor: 'var(--gray-1)',
                borderBottom: '1px solid var(--gray-a6)',
                zIndex: 1,
            }}
            position="sticky"
            p="3"
            top="0"
        >
            <Flex gap="4" justify="between" align="center">
                <Box flexGrow="1">
                    <Heading as="h1" size={{ initial: '4', xs: '6' }} truncate>
                        Solana React App{' '}
                        {setChain ? (
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>{currentChainBadge}</DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    <DropdownMenu.RadioGroup
                                        onValueChange={value => {
                                            setChain(value as 'solana:${string}');
                                        }}
                                        value={chain}
                                    >
                                        {process.env.REACT_EXAMPLE_APP_ENABLE_MAINNET === 'true' ? (
                                            <DropdownMenu.RadioItem value="solana:mainnet">
                                                Mainnet Beta
                                            </DropdownMenu.RadioItem>
                                        ) : null}
                                        <DropdownMenu.RadioItem value="solana:devnet">Devnet</DropdownMenu.RadioItem>
                                        <DropdownMenu.RadioItem value="solana:testnet">Testnet</DropdownMenu.RadioItem>
                                    </DropdownMenu.RadioGroup>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        ) : (
                            currentChainBadge
                        )}
                    </Heading>
                </Box>
                <ConnectWalletMenu>Connect Wallet</ConnectWalletMenu>
                <SignInMenu>Sign In</SignInMenu>
            </Flex>
        </Box>
    );
}
