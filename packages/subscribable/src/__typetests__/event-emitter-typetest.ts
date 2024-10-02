/* eslint-disable @typescript-eslint/ban-ts-comment */

import { TypedEventEmitter, TypedEventTarget } from '../event-emitter';

type EventMap = {
    fall: Event;
    jump: CustomEvent<{ height: number }>;
    run: CustomEvent<{ velocity: number }>;
};
const emitter = null as unknown as TypedEventEmitter<EventMap>;

// [DESCRIBE] TypedEventEmitter
{
    // It adds listeners for known types
    {
        emitter.addEventListener('fall', () => {});
        emitter.addEventListener('jump', () => {});
        emitter.addEventListener('run', () => {});
    }
    // It removes listeners for known types
    {
        emitter.removeEventListener('fall', () => {});
        emitter.removeEventListener('jump', () => {});
        emitter.removeEventListener('run', () => {});
    }
    // It rejects adding listeners for unknown types
    {
        emitter.addEventListener(
            // @ts-expect-error
            'roll',
            () => {},
        );
    }
    // It rejects removing listeners for unknown types
    {
        emitter.removeEventListener(
            // @ts-expect-error
            'roll',
            () => {},
        );
    }
    // It accepts adding listeners with the appropriate signature
    {
        emitter.addEventListener('fall', ev => {
            ev satisfies Event;
        });
        emitter.addEventListener('jump', ev => {
            ev satisfies CustomEvent<{ height: number }>;
        });
        emitter.addEventListener('run', ev => {
            ev satisfies CustomEvent<{ velocity: number }>;
        });
    }
    // It accepts removing listeners with the appropriate signature
    {
        emitter.removeEventListener('fall', ev => {
            ev satisfies Event;
        });
        emitter.removeEventListener('jump', ev => {
            ev satisfies CustomEvent<{ height: number }>;
        });
        emitter.removeEventListener('run', ev => {
            ev satisfies CustomEvent<{ velocity: number }>;
        });
    }
    // It rejects adding listeners with inappropriate signatures
    {
        emitter.addEventListener('fall', ev => {
            // @ts-expect-error
            ev satisfies CustomEvent<{ style: string }>;
        });
    }
    // It rejects removing listeners with inappropriate signatures
    {
        emitter.removeEventListener('fall', ev => {
            // @ts-expect-error
            ev satisfies CustomEvent<{ style: string }>;
        });
    }
}

// [DESCRIBE] TypedEventTarget
{
    // It is a TypedEventEmitter
    {
        const eventTarget = null as unknown as TypedEventTarget<{ foo: CustomEvent<'bar'> }>;
        eventTarget satisfies TypedEventEmitter<{ foo: CustomEvent<'bar'> }>;
    }
}
