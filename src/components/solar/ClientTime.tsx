import { useEffect, useState } from "react";

/** Locale time formatting is client-only to avoid SSR hydration mismatches. */
export function ClientTime({ at }: { at: number }) {
  const [text, setText] = useState("—");
  useEffect(() => {
    setText(new Date(at).toLocaleTimeString());
  }, [at]);
  return <>{text}</>;
}
