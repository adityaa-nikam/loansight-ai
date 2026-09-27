import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';
import Button from '../components/common/Button';

const ConfirmContext = createContext(null);

const TONES = {
  danger: { Icon: Trash2, iconClass: 'text-error-600', iconBg: 'bg-error-100' },
  warning: { Icon: AlertTriangle, iconClass: 'text-warning-600', iconBg: 'bg-warning-100' },
  neutral: { Icon: HelpCircle, iconClass: 'text-accent-600', iconBg: 'bg-accent-100' },
};

/**
 * Promise-based replacement for window.confirm().
 *
 *   const confirm = useConfirm();
 *   if (!await confirm({ title: '…', message: '…', tone: 'danger' })) return;
 */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolverRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const triggerRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    triggerRef.current = document.activeElement;
    setRequest({
      title: options.title || 'Are you sure?',
      message: options.message || '',
      confirmLabel: options.confirmLabel || 'Confirm',
      cancelLabel: options.cancelLabel || 'Cancel',
      tone: options.tone || 'neutral',
      detail: options.detail,
    });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result) => {
    setRequest(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    // Hand focus back to whatever opened the dialog.
    if (triggerRef.current?.focus) triggerRef.current.focus();
    triggerRef.current = null;
    if (resolve) resolve(result);
  }, []);

  // Escape to cancel, Tab confined to the two actions, body scroll locked.
  useEffect(() => {
    if (!request) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        settle(false);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean);
        if (focusables.length < 2) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Destructive actions focus Cancel so Enter never destroys anything.
    const target = request.tone === 'danger' ? cancelBtnRef.current : confirmBtnRef.current;
    target?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [request, settle]);

  const tone = request ? (TONES[request.tone] || TONES.neutral) : null;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {request && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal-900/45 backdrop-blur-sm animate-fade-in"
          onClick={() => settle(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={request.message ? 'confirm-message' : undefined}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-cream-50 rounded-2xl shadow-float border border-cream-300/70 p-6 animate-scale-in"
          >
            <div className="flex items-start gap-4">
              <span className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${tone.iconBg}`}>
                <tone.Icon className={`w-5 h-5 ${tone.iconClass}`} />
              </span>
              <div className="flex-1 min-w-0">
                <h2 id="confirm-title" className="text-base font-semibold text-charcoal-900 leading-snug">
                  {request.title}
                </h2>
                {request.message && (
                  <p id="confirm-message" className="mt-1.5 text-sm text-charcoal-600 leading-relaxed">
                    {request.message}
                  </p>
                )}
                {request.detail && (
                  <p className="mt-3 text-xs font-mono text-charcoal-500 bg-cream-200 border border-cream-300/70 rounded-lg px-3 py-2 break-all">
                    {request.detail}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <Button
                ref={cancelBtnRef}
                variant="secondary"
                onClick={() => settle(false)}
              >
                {request.cancelLabel}
              </Button>
              <Button
                ref={confirmBtnRef}
                variant={request.tone === 'danger' ? 'danger' : 'primary'}
                onClick={() => settle(true)}
              >
                {request.confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return ctx;
}
