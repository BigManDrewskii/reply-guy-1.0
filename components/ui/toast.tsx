// Toast Notification Component
import React, { useEffect, useState } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
  actions?: ToastAction[];
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose, actions }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // If there are actions, don't auto-dismiss
    if (actions && actions.length > 0) return;

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, actions]);

  return (
    <div
      className={`
        fixed bottom-4 left-4 right-4 z-50
        bg-[#ededed] text-[#000]
        px-4 py-3 rounded-lg
        shadow-lg
        font-medium text-sm
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      style={{ maxWidth: '340px' }}
    >
      <div className="flex flex-col gap-2">
        <div>{message}</div>
        {actions && actions.length > 0 && (
          <div className="flex gap-2 justify-end">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md
                  transition-colors duration-200
                  ${action.primary
                    ? 'bg-[#0070f3] text-white hover:bg-[#0060df]'
                    : 'bg-[#262626] text-[#ededed] hover:bg-[#333]'
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Manager Hook
interface ToastItem {
  id: string;
  message: string;
  actions?: ToastAction[];
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, actions?: ToastAction[]) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, actions }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastContainer: React.FC = () => {
    if (toasts.length === 0) return null;

    return (
      <>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            actions={toast.actions}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </>
    );
  };

  return { showToast, ToastContainer };
};
