import { useEffect, useRef } from 'react';

interface UseFocusManagementOptions {
  isOpen: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  initialFocusSelector?: string;
}

export function useFocusManagement({
  isOpen,
  restoreFocus = true,
  trapFocus = true,
  initialFocusSelector
}: UseFocusManagementOptions) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      if (restoreFocus) {
        triggerRef.current = document.activeElement as HTMLElement;
      }
      
      // Move focus to modal/dialog
      setTimeout(() => {
        if (containerRef.current) {
          const initialElement = initialFocusSelector 
            ? containerRef.current.querySelector(initialFocusSelector) as HTMLElement
            : containerRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              ) as HTMLElement;
          
          if (initialElement) {
            initialElement.focus();
          } else {
            // If no focusable element found, focus the container itself
            containerRef.current.setAttribute('tabindex', '-1');
            containerRef.current.focus();
          }
        }
      }, 0);

      // Trap focus if enabled
      if (trapFocus) {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Tab' && containerRef.current) {
            const focusableElements = containerRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }

          // Close on Escape key
          if (e.key === 'Escape') {
            // This should be handled by the parent component
            // We'll dispatch a custom event for it
            const escapeEvent = new CustomEvent('modal-escape');
            containerRef.current?.dispatchEvent(escapeEvent);
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    } else if (restoreFocus && triggerRef.current) {
      // Return focus to trigger element when modal closes
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen, restoreFocus, trapFocus, initialFocusSelector]);

  return { containerRef, triggerRef };
}