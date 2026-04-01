import { useState, useEffect, useRef } from "react";

export default function useContainerSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
