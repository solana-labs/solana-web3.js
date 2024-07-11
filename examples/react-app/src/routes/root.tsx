import { Box, Code, Container, DataList, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import { getUiWalletAccountStorageKey } from '@wallet-standard/react';
import { Suspense, useContext } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Balance } from '../components/Balance';
import { FeatureNotSupportedCallout } from '../components/FeatureNotSupportedCallout';
import { FeaturePanel } from '../components/FeaturePanel';
import { SolanaSignAndSendTransactionFeaturePanel } from '../components/SolanaSignAndSendTransactionFeaturePanel';
import { SolanaSignMessageFeaturePanel } from '../components/SolanaSignMessageFeaturePanel';
import { WalletAccountIcon } from '../components/WalletAccountIcon';
import { ChainContext } from '../context/ChainContext';
import { SelectedWalletAccountContext } from '../context/SelectedWalletAccountContext';

function Root() {
    const { chain } = useContext(ChainContext);
    const [selectedWalletAccount] = useContext(SelectedWalletAccountContext);
    const errorBoundaryResetKeys = [
        chain,
        selectedWalletAccount && getUiWalletAccountStorageKey(selectedWalletAccount),
    ].filter(Boolean);
    return (
        <Container mx={{ initial: '3', xs: '6' }}>
            {selectedWalletAccount ? (
                <Flex gap="6" direction="column">
                    <Flex gap="2">
                        <Flex align="center" gap="3" flexGrow="1">
                            <WalletAccountIcon account={selectedWalletAccount} height="48" width="48" />
                            <Box>
                                <Heading as="h4" size="3">
                                    {selectedWalletAccount.label ?? 'Unlabeled Account'}
                                </Heading>
                                <Code variant="outline" truncate size={{ initial: '1', xs: '2' }}>
                                    {selectedWalletAccount.address}
                                </Code>
                            </Box>
                        </Flex>
                        <Flex direction="column" align="end">
                            <Heading as="h4" size="3">
                                Balance
                            </Heading>
                            <ErrorBoundary
                                fallback={<Text>&ndash;</Text>}
                                key={`${selectedWalletAccount.address}:${chain}`}
                            >
                                <Suspense fallback={<Spinner loading my="1" />}>
                                    <Balance account={selectedWalletAccount} />
                                </Suspense>
                            </ErrorBoundary>
                        </Flex>
                    </Flex>
                    <DataList.Root orientation={{ initial: 'vertical', sm: 'horizontal' }} size="3">
                        <FeaturePanel label="Sign Message">
                            <ErrorBoundary
                                FallbackComponent={FeatureNotSupportedCallout}
                                resetKeys={errorBoundaryResetKeys}
                            >
                                <SolanaSignMessageFeaturePanel account={selectedWalletAccount} />
                            </ErrorBoundary>
                        </FeaturePanel>
                        <FeaturePanel label="Sign And Send Transaction">
                            <ErrorBoundary
                                FallbackComponent={FeatureNotSupportedCallout}
                                resetKeys={errorBoundaryResetKeys}
                            >
                                <SolanaSignAndSendTransactionFeaturePanel account={selectedWalletAccount} />
                            </ErrorBoundary>
                        </FeaturePanel>
                    </DataList.Root>
                </Flex>
            ) : (
                <Text as="p">Click &ldquo;Connect Wallet&rdquo; to get started.</Text>
            )}
        </Container>
    );
}

export default Root;
