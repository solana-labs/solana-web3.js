import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

type Result<T> =
    | {
          __type: 'error';
          current: Error;
          reset: () => void;
      }
    | {
          __type: 'result';
          current?: T;
      };

type TestComponentProps<THookReturn> = {
    executor(): THookReturn;
    resultRef: Result<THookReturn>;
};

function TestComponentHookRenderer<THookFn extends (...args: never) => unknown>({
    executor,
    resultRef,
}: TestComponentProps<ReturnType<THookFn>>) {
    resultRef.current = executor();
    return null;
}

function TestComponent<THookFn extends (...args: never) => unknown>({
    executor,
    resultRef,
}: TestComponentProps<ReturnType<THookFn>>) {
    return (
        <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => {
                resultRef.__type = 'error';
                resultRef.current = error;
                (resultRef as Extract<typeof resultRef, { __type: 'error' }>).reset = resetErrorBoundary;
                return null;
            }}
            onReset={() => {
                resultRef.__type = 'result';
                delete resultRef.current;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (resultRef as any).reset;
            }}
        >
            <TestComponentHookRenderer executor={executor} resultRef={resultRef} />
        </ErrorBoundary>
    );
}

export function renderHook<THookReturn>(executor: () => THookReturn): {
    rerenderHook(nextExecutor: () => THookReturn): void;
    result: Readonly<Result<THookReturn>>;
} {
    const result = { __type: 'result' } as Result<THookReturn>;
    let testRenderer: ReactTestRenderer;
    void act(() => {
        testRenderer = create(<TestComponent executor={executor} resultRef={result} />);
    });
    return {
        rerenderHook(nextExecutor) {
            void act(() => {
                testRenderer.update(<TestComponent executor={nextExecutor} resultRef={result} />);
            });
        },
        result,
    };
}
