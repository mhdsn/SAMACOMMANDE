import { useState, useEffect } from "react";

export default function useMediaQuery() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setWidth(window.innerWidth), 100);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}
