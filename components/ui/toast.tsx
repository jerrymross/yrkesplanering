"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      showToast: (nextMessage: string) => {
        setMessage(nextMessage);
        window.setTimeout(() => setMessage(null), 2600);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-md bg-foreground px-4 py-3 text-sm text-white shadow-lg">
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast måste användas inuti ToastProvider.");
  }
  return context;
}
