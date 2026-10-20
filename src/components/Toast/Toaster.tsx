import { useEffect, useState } from "react";
import { dismissToast, subscribeToasts, ToastItem } from "./toast";

const STYLES: Record<ToastItem["kind"], { icon: string; className: string }> = {
  success: { icon: "✓", className: "border-green-800 text-green-200" },
  error: { icon: "!", className: "border-red-800 text-red-200" },
  info: { icon: "i", className: "border-neutral-700 text-neutral-200" },
};

const Toaster = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setItems), []);

  return (
    <div
      className="fixed z-[100] bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {items.map((item) => (
        <div
          key={item.id}
          role={item.kind === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-neutral-950/95 backdrop-blur px-4 py-3 text-sm shadow-2xl ${
            STYLES[item.kind].className
          }`}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
            {STYLES[item.kind].icon}
          </span>
          <p className="flex-1 text-white/90">{item.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(item.id)}
            className="text-neutral-500 hover:text-white"
            aria-label="Mbyll"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
