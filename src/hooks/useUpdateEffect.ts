import { useEffect, useRef } from "react";

/**
 * Custom React hook meant to prevent a specific effect from firing while the component is mounting.
 * Used when an effect will cause an API call.
 * @param effect The effect callback function
 * @param dependencies A list of dependencies that will trigger the effect
 */
export default function useUpdateEffect(
  effect: React.EffectCallback,
  dependencies: React.DependencyList,
): void {
  const isMounted = useRef(false);

  useEffect(() => {
    // Prevents the effect from being fired while mounting, then let's it fire like usual
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, dependencies);
}
