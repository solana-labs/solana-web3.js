import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Callout } from '@radix-ui/themes';
import React from 'react';
import type { FallbackProps } from 'react-error-boundary';

import { getErrorMessage } from '../errors';

interface Props extends Callout.RootProps, FallbackProps {}

export function FeatureNotSupportedCallout({
    error,
    resetErrorBoundary: _,
    ...rootProps
}: Props): React.ReactElement<typeof Callout.Root> {
    return (
        <Callout.Root color="gray" size="1" {...rootProps} style={{ flexGrow: 1, ...rootProps.style }}>
            <Callout.Icon>
                <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>{getErrorMessage(error, 'This account does not support this feature')}</Callout.Text>
        </Callout.Root>
    );
}
