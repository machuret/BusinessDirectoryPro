import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFocusManagement } from '@/hooks/useFocusManagement';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  initialFocusSelector?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  initialFocusSelector
}: AccessibleModalProps) {
  const { containerRef } = useFocusManagement({ 
    isOpen, 
    restoreFocus: true, 
    trapFocus: true,
    initialFocusSelector 
  });

  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `modal-description-${Math.random().toString(36).substr(2, 9)}` : undefined;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    const handleModalEscape = () => {
      if (closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    containerRef.current?.addEventListener('modal-escape', handleModalEscape);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      containerRef.current?.removeEventListener('modal-escape', handleModalEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape, containerRef]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          'bg-background rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Description */}
        {description && (
          <div className="px-6 pt-2">
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}