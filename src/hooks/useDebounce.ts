import { useEffect, useState } from "react";

/**
 * Custom React hook used to add a buffer between a value change and the effect that it will trigger, usually an API call.
 * @param value The value to debounce
 * @param delay The delay in ms. Default is 800ms
 * @returns The debounced value
 */
export default function useDebounce(value: any, delay: number = 800): string {
  const [debouncedValue, setDebouncedValue] = useState<any>(value);

  // Used to allow for a brief pause after typing before sending an update to the server
  useEffect(() => {
    // After a delay, updates the debounced value to trigger an API call
    const timeoutHandler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Resets the timer every time the value or the delay is updated
    return () => {
      clearTimeout(timeoutHandler);
    };
  }, [value, delay]);

  return debouncedValue;
}
