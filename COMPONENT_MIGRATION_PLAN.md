# Component Migration & Design System Implementation Plan

## Phase 1: Business Card Consolidation (In Progress)

### Target: Replace 3 business card variants with single component
- ✅ Created `business-card-consolidated.tsx` with all features
- 🔄 Need to update imports across 15+ components
- 🔄 Need to remove old components after migration

### Migration Tasks:
1. Update all imports from business-card.tsx → business-card-consolidated.tsx
2. Update all imports from business-card-enhanced.tsx → business-card-consolidated.tsx
3. Add variant props where enhanced features are needed
4. Remove deprecated components

## Phase 2: Form Component Standardization

### Components requiring form standardization:
- ContactForm.tsx (2 variants) - Use StandardizedForm
- business-contact-form.tsx - Consolidate with ContactForm
- ClaimBusinessForm.tsx - Update to use standardized fields
- All admin section forms (22 components) - Standardize patterns

### Standardization Pattern:
```typescript
// Replace mixed patterns with:
<StandardizedForm onSubmit={handleSubmit} loading={isLoading} error={error}>
  <StandardizedFormField 
    label="Field Name" 
    value={value} 
    onChange={setValue} 
    required 
    error={fieldError}
  />
  <StandardizedFormActions 
    submitText="Save" 
    onCancel={handleCancel}
    loading={isLoading}
  />
</StandardizedForm>
```

## Phase 3: Modal Pattern Consolidation

### Current inconsistent patterns found:
- Dialog vs AlertDialog vs custom modals
- Mixed trigger props: onOpen vs onOpenChange vs onClick
- Mixed state props: isOpen vs open vs show

### Target: Single StandardizedModal pattern
```typescript
<StandardizedModalWrapper
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Modal Title"
  description="Optional description"
  size="md"
>
  Modal content
</StandardizedModalWrapper>
```

## Phase 4: Admin Section Refactoring

### 22 admin sections need standardization:
- Export pattern migration (default + named exports)
- Consistent prop naming
- Standardized form patterns
- Consistent button usage

## Implementation Status:

### ✅ Completed:
- Design system audit and inventory
- StandardizedButton with loading states and featured variant
- StandardizedModal with consistent API
- StandardizedForm with error handling and validation
- Design tokens file with consistent styling

### 🔄 In Progress:
- Business card component migration
- Form component updates

### 📋 Next Steps:
1. Migrate business card imports
2. Update ContactForm to use standardized components
3. Apply consistent export patterns
4. Remove deprecated components