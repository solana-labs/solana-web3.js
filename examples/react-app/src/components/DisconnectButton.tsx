import { ExclamationTriangleIcon, ExitIcon } from '@radix-ui/react-icons';
import { Button, Tooltip } from '@radix-ui/themes';
import type { UiWallet } from '@wallet-standard/react';
import { useDisconnect } from '@wallet-standard/react';
import { useState } from 'react';

import { NO_ERROR } from '../errors';

type Props = Readonly<{
    wallet: UiWallet;
}>;

export function DisconnectButton({
    wallet,
    ...buttonProps
}: Omit<React.ComponentProps<typeof Button>, 'color' | 'loading' | 'onClick'> & Props) {
    const [isDisconnecting, disconnect] = useDisconnect(wallet);
    const [lastError, setLastError] = useState(NO_ERROR);
    return (
        <Tooltip
            content={
                <>
                    Error:{' '}
                    {lastError && typeof lastError === 'object' && 'message' in lastError
                        ? lastError.message
                        : String(lastError)}
                </>
            }
            open={lastError !== NO_ERROR}
            side="left"
        >
            <Button
                {...buttonProps}
                color="red"
                loading={isDisconnecting}
                onClick={async () => {
                    setLastError(NO_ERROR);
                    try {
                        await disconnect();
                    } catch (e) {
                        setLastError(e);
                    }
                }}
                variant="outline"
            >
                {lastError === NO_ERROR ? <ExitIcon /> : <ExclamationTriangleIcon />}
                Disconnect
            </Button>
        </Tooltip>
    );
}
