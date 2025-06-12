# Component Templates and Code Consistency Guide

## Overview
This directory contains standardized templates and patterns for maintaining consistent code structure across the business directory application.

## Templates Available

### 1. ComponentTemplate.tsx
- Standard component structure with props interface
- Named export pattern with default export for compatibility
- Compound component pattern for complex components

### 2. PageTemplate.tsx
- Standardized page layout with Header/Footer
- Built-in loading and error state handling
- SEO-friendly structure with title and description support

### 3. FormTemplate.tsx
- Consistent form layout and validation patterns
- Integrated loading states for submissions
- Standardized field wrapper components

## Usage Examples

### Basic Component
```tsx
import { ComponentTemplate } from "@/templates/ComponentTemplate";

interface MyComponentProps {
  title: string;
  children: ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <ComponentTemplate title={title}>
      {children}
    </ComponentTemplate>
  );
}

export default MyComponent;
```

### Page Component
```tsx
import { PageTemplate } from "@/templates/PageTemplate";

export function MyPage() {
  return (
    <PageTemplate 
      title="Page Title"
      description="Page description for SEO"
    >
      <div>Page content</div>
    </PageTemplate>
  );
}
```

### Form Component
```tsx
import { FormTemplate, FormField } from "@/templates/FormTemplate";

export function MyForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <FormTemplate
      title="Form Title"
      onSubmit={handleSubmit}
      submitText="Save"
    >
      <FormField label="Name" required>
        <Input />
      </FormField>
    </FormTemplate>
  );
}
```

## Code Standards Applied

### Export Patterns
- ✅ Primary: Named exports (`export function ComponentName`)
- ✅ Secondary: Default exports for backward compatibility
- ✅ Interfaces: Always define props interfaces
- ✅ Naming: PascalCase for components, camelCase for functions

### File Organization
- Components grouped by feature/domain
- Consistent file naming conventions
- Clear separation of concerns

### Error and Loading States
- Standardized error boundaries and error states
- Consistent loading indicators
- Graceful fallback handling

### Form Management
- Centralized form state management
- Consistent validation patterns
- Reusable form components

## Benefits
1. **Consistency**: Uniform code structure across the application
2. **Maintainability**: Easier to update and modify components
3. **Developer Experience**: Clear patterns for new developers
4. **Quality**: Built-in error handling and loading states
5. **Performance**: Optimized component patterns