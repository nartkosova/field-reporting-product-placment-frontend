export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

type Listener = (toasts: ToastItem[]) => void;

const DURATION_MS: Record<ToastKind, number> = {
  success: 3500,
  info: 4500,
  error: 6000,
};

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((listener) => listener(toasts));

export const dismissToast = (id: number) => {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
};

const show = (kind: ToastKind, message: string) => {
  const text = message?.trim() || (kind === "error" ? "Ndodhi një gabim." : "");
  if (!text) return;
  // Retries and parallel requests often fail with the same message.
  if (toasts.some((item) => item.kind === kind && item.message === text)) return;

  const id = nextId++;
  toasts = [...toasts.slice(-3), { id, kind, message: text }];
  emit();
  window.setTimeout(() => dismissToast(id), DURATION_MS[kind]);
};

export const toast = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
  info: (message: string) => show("info", message),
};

export const subscribeToasts = (listener: Listener) => {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
};
