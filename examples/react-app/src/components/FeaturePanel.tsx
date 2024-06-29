import { DataList } from '@radix-ui/themes';
import React from 'react';

type Props = Readonly<{
    children: React.ReactNode;
    label: React.ReactNode;
}>;

export function FeaturePanel({ children, label }: Props) {
    return (
        <DataList.Item align={{ initial: 'start', sm: 'center' }}>
            <DataList.Label>{label}</DataList.Label>
            <DataList.Value style={{ width: '100%' }}>{children}</DataList.Value>
        </DataList.Item>
    );
}
