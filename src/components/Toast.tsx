"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const CONFIG: Record<ToastType, { icon: React.ElementType; color: string }> = {
  success: { icon: CheckCircle,    color: "text-success border-success/10 bg-success/5" },
  error:   { icon: AlertCircle,    color: "text-danger  border-danger/10  bg-danger/5"  },
  warning: { icon: AlertTriangle,  color: "text-warning border-warning/10 bg-warning/5" },
  info:    { icon: Info,            color: "text-info    border-info/10    bg-info/5"    },
};

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  const { icon: Icon, color } = CONFIG[item.type];
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const t = setTimeout(() => onRemove(item.id), 4000);
    return () => clearTimeout(t);
  }, [item.id, onRemove]);

  return (
    <div className="glass pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-soft border w-80 animate-slide-up">
      <div className={`p-1 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <h5 className="text-xs font-bold text-gray-800 font-display leading-tight">{item.title}</h5>
        <p className="text-[11px] text-gray-500 mt-0.5">{item.message}</p>
      </div>
      <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-text cursor-pointer">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback(
    (title: string, message: string, type: ToastType = "success") => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, title, message, type }]);
    },
    []
  );

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-50 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
