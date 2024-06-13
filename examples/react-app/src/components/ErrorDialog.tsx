import { AlertDialog, Blockquote, Button, Flex } from '@radix-ui/themes';
import { useState } from 'react';

import { getErrorMessage } from '../errors';

type Props = Readonly<{
    error: unknown;
    onClose?(): false | void;
    title?: string;
}>;

export function ErrorDialog({ error, onClose, title }: Props) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <AlertDialog.Root
            open={isOpen}
            onOpenChange={open => {
                if (!open) {
                    if (!onClose || onClose() !== false) {
                        setIsOpen(false);
                    }
                }
            }}
        >
            <AlertDialog.Content>
                <AlertDialog.Title color="red">{title ?? 'We encountered the following error'}</AlertDialog.Title>
                <AlertDialog.Description>
                    <Blockquote>{getErrorMessage(error, 'Unknown')}</Blockquote>
                </AlertDialog.Description>
                <Flex mt="4" justify="end">
                    <AlertDialog.Action>
                        <Button variant="solid">Close</Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}
