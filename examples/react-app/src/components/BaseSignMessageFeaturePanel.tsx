import { Pencil1Icon } from '@radix-ui/react-icons';
import { Blockquote, Box, Button, Code, DataList, Dialog, Flex, TextField } from '@radix-ui/themes';
import { getBase64Decoder } from '@solana/web3.js';
import type { ReadonlyUint8Array } from '@wallet-standard/core';
import type { SyntheticEvent } from 'react';
import { useRef, useState } from 'react';

import { ErrorDialog } from '../components/ErrorDialog';

type Props = Readonly<{
    signMessage(message: ReadonlyUint8Array): Promise<ReadonlyUint8Array>;
}>;

export function BaseSignMessageFeaturePanel({ signMessage }: Props) {
    const { current: NO_ERROR } = useRef(Symbol());
    const [isSigningMessage, setIsSigningMessage] = useState(false);
    const [error, setError] = useState(NO_ERROR);
    const [lastSignature, setLastSignature] = useState<ReadonlyUint8Array | undefined>();
    const [text, setText] = useState<string>();
    return (
        <Flex asChild gap="2" direction={{ initial: 'column', sm: 'row' }} style={{ width: '100%' }}>
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    setError(NO_ERROR);
                    setIsSigningMessage(true);
                    try {
                        const signature = await signMessage(new TextEncoder().encode(text));
                        setLastSignature(signature);
                    } catch (e) {
                        setLastSignature(undefined);
                        setError(e);
                    } finally {
                        setIsSigningMessage(false);
                    }
                }}
            >
                <Box flexGrow="1">
                    <TextField.Root
                        placeholder="Write a message to sign"
                        onChange={(e: SyntheticEvent<HTMLInputElement>) => setText(e.currentTarget.value)}
                        value={text}
                    >
                        <TextField.Slot>
                            <Pencil1Icon />
                        </TextField.Slot>
                    </TextField.Root>
                </Box>
                <Dialog.Root
                    open={!!lastSignature}
                    onOpenChange={open => {
                        if (!open) {
                            setLastSignature(undefined);
                        }
                    }}
                >
                    <Dialog.Trigger>
                        <Button
                            color={error ? undefined : 'red'}
                            disabled={!text}
                            loading={isSigningMessage}
                            type="submit"
                        >
                            Sign Message
                        </Button>
                    </Dialog.Trigger>
                    {lastSignature ? (
                        <Dialog.Content
                            onClick={e => {
                                e.stopPropagation();
                            }}
                        >
                            <Dialog.Title>You Signed a Message!</Dialog.Title>
                            <DataList.Root orientation={{ initial: 'vertical', sm: 'horizontal' }}>
                                <DataList.Item>
                                    <DataList.Label minWidth="88px">Message</DataList.Label>
                                    <DataList.Value>
                                        <Blockquote>{text}</Blockquote>
                                    </DataList.Value>
                                </DataList.Item>
                                <DataList.Item>
                                    <DataList.Label minWidth="88px">Signature</DataList.Label>
                                    <DataList.Value>
                                        <Code truncate>{getBase64Decoder().decode(lastSignature)}</Code>
                                    </DataList.Value>
                                </DataList.Item>
                            </DataList.Root>
                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                    <Button>Cool!</Button>
                                </Dialog.Close>
                            </Flex>
                        </Dialog.Content>
                    ) : null}
                </Dialog.Root>
                {error !== NO_ERROR ? (
                    <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} title="Failed to sign message" />
                ) : null}
            </form>
        </Flex>
    );
}
