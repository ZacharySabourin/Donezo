import { useEffect, useState } from "react";

/**
 * Custom React hook used to add a buffer between a value change and the effect that it will trigger, usually an API call.
 * @param value The value to debounce
 * @param delay The delay in ms. Default is 800ms
 * @returns The debounced value
 */
export default function useDebounce(value: any, delay: number = 800): string {
  const [debouncedValue, setDebouncedValue] = useState<any>(value);

  // Used to allow for a brief pause after typing before sending a text update to the server
  useEffect(() => {
    // After 1000ms, updates the debounced text to trigger an API call
    const timeoutHandler = setTimeout(() => {
      setDebouncedValue(value);
    }, 1000);

    // Resets the timer every time the text is updated
    return () => {
      clearTimeout(timeoutHandler);
    };
  }, [value, delay]);

  return debouncedValue;
}
