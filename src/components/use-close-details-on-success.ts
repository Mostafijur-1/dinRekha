"use client";

import { useEffect, useRef } from "react";

export function useCloseDetailsOnSuccess(state: { status: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      detailsRef.current?.removeAttribute("open");
    }
  }, [state]);

  return detailsRef;
}
