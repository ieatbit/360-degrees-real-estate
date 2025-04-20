import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: ToastProps[];
}

export function useToast() {
  const [, setToasts] = useState<ToastState>({ toasts: [] });

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
    setToasts((state) => {
      const newToast = {
        title,
        description,
        variant,
        duration,
      };
      
      // In a real implementation, we would add the toast to the array
      // and handle showing/hiding them in the UI
      console.log('Toast:', newToast);
      
      return {
        toasts: [...state.toasts, newToast],
      };
    });
  }, []);

  return { toast };
} 