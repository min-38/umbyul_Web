import { useEffect, useRef, type RefObject } from "react";

/** ref 바깥을 클릭(mousedown)하면 onOutside 호출. active 일 때만 동작. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean,
) {
  const cb = useRef(onOutside);
  cb.current = onOutside;

  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active, ref]);
}
