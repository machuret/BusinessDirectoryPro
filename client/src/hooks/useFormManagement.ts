import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}

/**
 * useFormManagement - Advanced form state management hook with validation and submission handling
 * 
 * Provides comprehensive form state management including field updates, validation,
 * error handling, and submission workflow. Supports type-safe operations with generic
 * typing, automatic dirty state tracking, and optimistic UI updates. Handles complex
 * form scenarios with field-level validation, batch updates, and reset functionality.
 * 
 * @param initialValues - Initial form data object with all form fields
 * @param validate - Optional validation function returning field-level errors
 * @param onSubmit - Async submission handler receiving validated form data
 * 
 * @returns Object containing form state, actions, and status information
 * @returns returns.formState - Complete form state including data, errors, and flags
 * @returns returns.updateField - Function to update individual form fields
 * @returns returns.updateFields - Function to update multiple fields at once
 * @returns returns.setErrors - Function to manually set field-level errors
 * @returns returns.handleSubmit - Form submission handler with validation
 * @returns returns.reset - Function to reset form to initial state
 * @returns returns.isValid - Boolean indicating if form passes validation
 * 
 * @example
 * // Basic form management
 * const form = useFormManagement({
 *   initialValues: { name: '', email: '' },
 *   validate: (values) => {
 *     const errors = {};
 *     if (!values.email) errors.email = 'Required';
 *     return errors;
 *   },
 *   onSubmit: async (data) => submitToApi(data)
 * });
 * 
 * @example
 * // Advanced form with complex validation
 * const businessForm = useFormManagement({
 *   initialValues: businessData,
 *   validate: validateBusinessData,
 *   onSubmit: updateBusiness
 * });
 */
export function useFormManagement<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialValues,
    errors: {},
    isSubmitting: false,
    isDirty: false,
  });

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: undefined },
    }));
  }, []);

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates },
      isDirty: true,
    }));
  }, []);

  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState(prev => ({ ...prev, errors }));
  }, []);

  const clearErrors = useCallback(() => {
    setFormState(prev => ({ ...prev, errors: {} }));
  }, []);

  const reset = useCallback((newValues?: T) => {
    setFormState({
      data: newValues || initialValues,
      errors: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialValues]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate form
    const validationErrors = validate ? validate(formState.data) : {};
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      await onSubmit(formState.data);
      setFormState(prev => ({ ...prev, isSubmitting: false, isDirty: false }));
    } catch (error) {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      toast({
        title: "Submission Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }, [formState.data, validate, onSubmit, setErrors, toast]);

  return {
    values: formState.data,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    isDirty: formState.isDirty,
    updateField,
    updateFields,
    setErrors,
    clearErrors,
    reset,
    handleSubmit,
  };
}

// Hook for managing modal states
export function useModalState(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

// Hook for managing selection states (checkboxes, multi-select)
export function useSelection<T>(initialSelected: T[] = []) {
  const [selected, setSelected] = useState<T[]>(initialSelected);

  const select = useCallback((item: T) => {
    setSelected(prev => [...prev, item]);
  }, []);

  const deselect = useCallback((item: T) => {
    setSelected(prev => prev.filter(i => i !== item));
  }, []);

  const toggle = useCallback((item: T) => {
    setSelected(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelected(items);
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
  }, []);

  const isSelected = useCallback((item: T) => {
    return selected.includes(item);
  }, [selected]);

  return {
    selected,
    select,
    deselect,
    toggle,
    selectAll,
    clear,
    isSelected,
    count: selected.length,
    isEmpty: selected.length === 0,
  };
}