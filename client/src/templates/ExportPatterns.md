# Component Export Patterns

## Standardized Export Rules

### 1. Named Exports (Preferred)
```tsx
// ✅ Good: Named export
export function ComponentName() {
  return <div>Content</div>;
}

// ✅ Optional: Default export for backward compatibility
export default ComponentName;
```

### 2. Component Interface Pattern
```tsx
// ✅ Always define props interface
interface ComponentNameProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function ComponentName({ title, children, className }: ComponentNameProps) {
  return <div className={className}>{title}{children}</div>;
}
```

### 3. Compound Component Pattern
```tsx
// ✅ Main component with sub-components
export function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Content = function CardContent({ children }: { children: ReactNode }) {
  return <div className="card-content">{children}</div>;
};
```

### 4. Hook Export Pattern
```tsx
// ✅ Named export for hooks
export function useCustomHook() {
  const [state, setState] = useState(null);
  return { state, setState };
}
```

### 5. Utility Export Pattern
```tsx
// ✅ Named exports for utilities
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function validateEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}
```

## File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `BusinessCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useBusinessData.ts`)
- Utilities: `camelCase.ts` (e.g., `formatUtils.ts`)
- Types: `PascalCase.ts` (e.g., `BusinessTypes.ts`)

## Import Patterns

```tsx
// ✅ Preferred: Named imports
import { ComponentName, AnotherComponent } from "./components";
import { useCustomHook } from "./hooks";

// ✅ Default imports only when necessary
import ComponentName from "./ComponentName";
```

## Folder Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form-specific components
│   ├── business/     # Business-related components
│   └── layout/       # Layout components
├── hooks/            # Custom hooks
├── utils/            # Utility functions
├── types/            # Type definitions
└── templates/        # Component templates
```