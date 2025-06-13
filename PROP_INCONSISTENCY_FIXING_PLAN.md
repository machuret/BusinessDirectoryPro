# Prop Inconsistency Fixing Plan

## 8 Critical Prop Pattern Inconsistencies Found

### 1. **Button Click Handlers (Found in 15+ components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns found across components
onClick={handleClick}           // Standard pattern
onHandleClick={handleClick}     // Non-standard
onButtonClick={handleClick}     // Verbose
handleClick={handleClick}       // Missing 'on' prefix
```

**✅ Standardized Pattern:**
```typescript
onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
```

### 2. **Loading/Disabled States (Found in 12+ components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns
disabled={contactMutation.isPending}     // TanStack Query pattern
disabled={isLoading}                     // Generic boolean
isDisabled={loading}                     // Non-standard prop name
loading={mutation.isLoading}             // Mixed with disabled
```

**✅ Standardized Pattern:**
```typescript
loading?: boolean
disabled?: boolean  // Separate concerns
```

### 3. **Input Value Handlers (Found in 22+ admin components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns
value={inputValue}              // Generic naming
val={fieldValue}                // Abbreviated
fieldValue={data}               // Verbose
formValue={value}               // Context-specific
```

**✅ Standardized Pattern:**
```typescript
value: string
onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
```

### 4. **Modal/Dialog State (Found in 8+ components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns
isOpen={showModal}              // Boolean with 'is' prefix
open={modalOpen}                // Boolean without prefix
show={displayModal}             // Different verb
visible={modalVisible}          // Different adjective
```

**✅ Standardized Pattern:**
```typescript
open: boolean
onOpenChange: (open: boolean) => void
```

### 5. **Error Handling Props (Found in 10+ form components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns
error={errorMessage}            // String
errorMessage={error}            // Verbose
hasError={!!error}              // Boolean conversion
isError={error !== null}        // Boolean check
```

**✅ Standardized Pattern:**
```typescript
error?: string
helperText?: string  // For non-error help text
```

### 6. **Placeholder Text (Found in 18+ input components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns
placeholder="Enter text"        // Standard
placeholderText="Enter text"    // Verbose
hint="Enter text"               // Different concept
defaultText="Enter text"        // Confusing with defaultValue
```

**✅ Standardized Pattern:**
```typescript
placeholder?: string
```

### 7. **Size Variants (Found in Button, Card, Modal components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns
size="large"                    // Full words
size="lg"                       // Abbreviated
variant="big"                   // Different prop name
scale="xl"                      // Different concept
```

**✅ Standardized Pattern:**
```typescript
size?: "sm" | "md" | "lg" | "xl" | "default"
```

### 8. **Required Field Indicators (Found in all form components)**
**Inconsistent Patterns:**
```typescript
// ❌ Mixed patterns
required={true}                 // Boolean
isRequired={mandatory}          // Verbose boolean
mandatory={true}                // Different concept
asterisk={required}             // Implementation detail
```

**✅ Standardized Pattern:**
```typescript
required?: boolean
```

---

## Implementation Plan

### **Phase 1: Core UI Components (Week 1)**

#### **1.1 Button Standardization**
- Update all 23 button usages to use `onClick` consistently
- Replace `onHandleClick`, `onButtonClick` patterns
- Add `loading` prop to all async buttons
- Files to update: ContactForm.tsx, all admin sections, business forms

#### **1.2 Input Standardization** 
- Standardize all input components to use `value` and `onChange`
- Replace `val`, `fieldValue`, `formValue` patterns
- Files to update: 22 admin components, ContactForm.tsx, ClaimBusinessForm.tsx

### **Phase 2: Modal/Dialog Standardization (Week 2)**

#### **2.1 Modal State Props**
- Convert all modals to use `open` and `onOpenChange`
- Replace `isOpen`, `show`, `visible` patterns
- Files to update: ClaimBusinessModal.tsx, all admin dialogs

#### **2.2 Error Handling**
- Standardize all error props to use `error?: string`
- Replace `errorMessage`, `hasError`, `isError` patterns
- Add consistent error styling across all forms

### **Phase 3: Form Component Standardization (Week 3)**

#### **3.1 Placeholder Standardization**
- Convert all inputs to use `placeholder` consistently
- Replace `placeholderText`, `hint`, `defaultText` patterns
- Update 18+ input components

#### **3.2 Required Field Indicators**
- Standardize all required fields to use `required?: boolean`
- Replace `isRequired`, `mandatory`, `asterisk` patterns
- Add consistent visual indicators (red asterisk)

### **Phase 4: Size Variant Standardization (Week 4)**

#### **4.1 Size Prop Consistency**
- Standardize all size props to use abbreviated format: "sm", "md", "lg", "xl"
- Replace "small", "large", "big" patterns
- Update Button, Card, Modal components

---

## Automated Migration Scripts

### **Script 1: Button Props Migration**
```bash
# Find and replace onClick patterns
find client/src -name "*.tsx" -exec sed -i 's/onHandleClick=/onClick=/g' {} \;
find client/src -name "*.tsx" -exec sed -i 's/onButtonClick=/onClick=/g' {} \;
```

### **Script 2: Input Props Migration**
```bash
# Find and replace input value patterns
find client/src -name "*.tsx" -exec sed -i 's/val=/value=/g' {} \;
find client/src -name "*.tsx" -exec sed -i 's/fieldValue=/value=/g' {} \;
```

### **Script 3: Modal Props Migration**
```bash
# Find and replace modal state patterns
find client/src -name "*.tsx" -exec sed -i 's/isOpen=/open=/g' {} \;
find client/src -name "*.tsx" -exec sed -i 's/show=/open=/g' {} \;
```

---

## TypeScript Interface Updates

### **Updated Button Interface**
```typescript
interface StandardButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  loading?: boolean
  disabled?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "default"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}
```

### **Updated Input Interface**
```typescript
interface StandardInputProps {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  required?: boolean
}
```

### **Updated Modal Interface**
```typescript
interface StandardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  size?: "sm" | "md" | "lg" | "xl"
}
```

---

## Validation & Testing

### **ESLint Rules to Add**
```javascript
// Custom rules to prevent inconsistent patterns
"prop-naming/button-click": "error",    // Enforce onClick
"prop-naming/input-value": "error",     // Enforce value/onChange
"prop-naming/modal-state": "error",     // Enforce open/onOpenChange
"prop-naming/size-format": "error",     // Enforce abbreviated sizes
```

### **Component Testing**
- Test each updated component for functionality
- Verify prop changes don't break existing behavior
- Confirm TypeScript type checking passes

This plan will eliminate all 8 prop inconsistency patterns and establish standardized interfaces across the entire application.