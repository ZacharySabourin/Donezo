import { useCallback, useEffect, useState } from "react";

/**
 * Options for configuring the `useAsync` hook.
 *
 * @template T - The type of data resolved by the asynchronous function.
 */
interface UseAsyncOptions<T> {
  /** The asynchronous function/promise to execute. */
  asyncFn: () => Promise<T>;

  /**
   * Whether to execute the function immediately on mount.
   * @default true
   */
  immediate?: boolean;

  /** Callback fired if the asynchronous function throws an error. */
  onError: (error: Error) => void;
}

/**
 * The return shape of the `useAsync` hook.
 *
 * @template T - The type of data stored in state.
 */
export interface UseAsyncResult<T> {
  /** The data returned from the async function, or `null` if pending/errored. */
  data: T | null;

  /** Direct state setter for the `data` value. */
  setData: React.Dispatch<React.SetStateAction<T | null>>;

  /** Indicates whether the async operation is currently in flight. */
  loading: boolean;

  /** Direct state setter for the `loading` flag. */
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  /** Function to manually re-trigger the execution of `asyncFn`. */
  refetch: () => Promise<void>;
}

/**
 * Custom React hook for handling asynchronous operations with loading and error states.
 * Automatically runs on mount if `immediate` is set to `true`, and handles cleanup to
 * prevent race conditions / unmounted state updates.
 *
 * @template T - The expected resolve type of the asynchronous operation.
 *
 * @param options - Configuration options including the async function and event handlers.
 * @returns An object containing the current `data`, `loading` state, state setters, and a `refetch` trigger.
 *
 * @example
 * ```tsx
 * const { data, loading, refetch } = useAsync({
 *   asyncFn: fetchUserData,
 *   immediate: true,
 *   onError: (err) => console.error(err),
 * });
 * ```
 */
export function useAsync<T>({
  asyncFn,
  immediate = true,
  onError,
}: UseAsyncOptions<T>): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);

  // Manual refetch trigger
  const execute: () => Promise<void> = useCallback(async () => {
    setLoading(true);
    try {
      const result: Awaited<T | null> = await asyncFn();
      setData(result);
    } catch (error) {
      setData(null);
      onError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [asyncFn, onError]);

  // Initial load effect with cleanup guard
  useEffect(() => {
    if (!immediate) {
      return;
    }

    let ignore = false;

    async function run() {
      setLoading(true);
      try {
        const result = await asyncFn();
        if (!ignore) {
          setData(result);
        }
      } catch (error) {
        if (!ignore) {
          setData(null);
          onError(error as Error);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void run();

    // Cleanup callback
    return () => {
      ignore = true;
    };
  }, [asyncFn, immediate, onError]);

  return { data, setData, loading, setLoading, refetch: execute };
}
