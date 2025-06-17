# Component Documentation Template - Gold Standard

## Overview

This document provides the standardized TSDoc template for documenting React components in the business directory platform. Use the PageForm.tsx component as the reference implementation.

---

## Complete Documentation Template

```typescript
/**
 * ComponentName - Brief one-sentence description of what the component does and its primary purpose.
 * 
 * Detailed description explaining the component's functionality, use cases, and key features.
 * Include information about state management, validation, integrations, and workflow support.
 * Mention any complex logic, external dependencies, or business rules implemented.
 * 
 * @param propName - Description of the prop, its purpose, and when it's used
 * @param optionalProp - Optional description with default behavior. Defaults to [value]. Explain impact of different values
 * @param callbackProp - Callback function description with signature and when it's triggered
 * @param complexProp - For objects/arrays, describe structure and expected data format
 * 
 * @returns JSX.Element - Describe the rendered output, key UI elements, and layout structure
 * 
 * @example
 * // Basic usage scenario
 * <ComponentName 
 *   requiredProp="value"
 *   onAction={(data) => handleAction(data)}
 * />
 * 
 * @example
 * // Advanced usage with optional props
 * <ComponentName 
 *   requiredProp="value"
 *   optionalProp={customValue}
 *   isLoading={mutation.isPending}
 *   onAction={(data) => handleAction(data)}
 *   onCancel={() => setModalOpen(false)}
 * />
 * 
 * @example
 * // Specific use case (e.g., editing mode)
 * <ComponentName 
 *   initialData={existingData}
 *   mode="edit"
 *   onSubmit={(data) => updateRecord(id, data)}
 * />
 */
```

---

## Documentation Standards

### 1. Component Summary
- **First Line**: Component name followed by clear, concise description
- **Length**: One sentence maximum
- **Focus**: Primary purpose and key functionality

### 2. Detailed Description
- **Purpose**: Explain what the component does and why it exists
- **Features**: List key capabilities and integrations
- **Context**: Describe when and where it's used
- **Technical Details**: Mention validation, state management, external dependencies

### 3. Parameter Documentation (@param)
- **Format**: `@param paramName - Description with purpose and behavior`
- **Required Props**: State purpose and expected usage
- **Optional Props**: Include default values and behavior when omitted
- **Callbacks**: Describe function signature and trigger conditions
- **Complex Types**: Explain object structure and data format

### 4. Return Value Documentation (@returns)
- **Format**: `@returns JSX.Element - Description of rendered output`
- **Content**: Describe main UI elements and layout structure
- **Behavior**: Mention responsive design or conditional rendering

### 5. Usage Examples (@example)
- **Minimum**: 2-3 examples showing different usage patterns
- **Basic Usage**: Simple, common implementation
- **Advanced Usage**: With optional props and complex scenarios
- **Specific Cases**: Edge cases or specialized implementations

---

## Real-World Example: PageForm Component

```typescript
/**
 * PageForm - A comprehensive form component for creating and editing pages, blog posts, and help articles with rich text editing capabilities.
 * 
 * This component provides a complete content management interface with form validation, 
 * SEO metadata fields, rich text editing via ReactQuill, and flexible submission handling.
 * Supports both creation and editing workflows with proper form state management and validation.
 * 
 * @param onSubmit - Callback function triggered when form is submitted with valid data
 * @param initialValues - Optional initial form values for editing existing pages. When provided, populates form fields with existing data
 * @param isSubmitting - Optional boolean indicating form submission state. Defaults to false. Controls button disabled state and loading text
 * @param submitLabel - Optional custom text for submit button. Defaults to "Save Page". Allows customization for different contexts
 * @param showCancel - Optional boolean to display cancel button. Defaults to false. Useful in modal or multi-step workflows
 * @param onCancel - Optional callback function for cancel button click. Required when showCancel is true
 * 
 * @returns JSX.Element - A responsive form with title, slug, content (rich text), meta description, meta keywords, type selection, and status controls
 * 
 * @example
 * // Creating a new page
 * <PageForm 
 *   onSubmit={(data) => createPage(data)}
 *   submitLabel="Create Page"
 * />
 * 
 * @example
 * // Editing an existing page with cancel option
 * <PageForm 
 *   onSubmit={(data) => updatePage(pageId, data)}
 *   initialValues={{
 *     title: "About Us",
 *     slug: "about-us",
 *     content: "<p>Welcome to our company...</p>",
 *     status: "published",
 *     type: "page"
 *   }}
 *   isSubmitting={mutation.isPending}
 *   submitLabel="Update Page"
 *   showCancel={true}
 *   onCancel={() => setIsEditing(false)}
 * />
 */
```

---

## Component Type Categories

### 1. Form Components
**Documentation Focus:**
- Validation rules and schema
- Form submission behavior
- Field types and validation messages
- Initial values and editing support

**Example Props to Document:**
- `onSubmit`, `initialValues`, `validation`, `isSubmitting`

### 2. Data Display Components  
**Documentation Focus:**
- Data structure requirements
- Loading and error states
- Filtering and sorting capabilities
- Interaction patterns

**Example Props to Document:**
- `data`, `isLoading`, `onFilter`, `onSort`, `renderItem`

### 3. Modal/Dialog Components
**Documentation Focus:**
- Opening/closing behavior
- Content requirements
- Action buttons and callbacks
- Size and positioning options

**Example Props to Document:**
- `open`, `onOpenChange`, `title`, `children`, `size`

### 4. Navigation Components
**Documentation Focus:**
- Route structure and navigation
- Active state management
- Permission-based rendering
- Responsive behavior

**Example Props to Document:**
- `routes`, `activeRoute`, `onNavigate`, `permissions`

### 5. Business Logic Components
**Documentation Focus:**
- Business rules and workflows
- State management patterns
- API integrations
- Error handling strategies

**Example Props to Document:**
- `businessId`, `userId`, `onUpdate`, `permissions`, `workflow`

---

## Quality Checklist

### ✅ Before Submitting Documentation

**Component Summary:**
- [ ] One clear sentence describing component purpose
- [ ] Includes key functionality and integrations

**Parameter Documentation:**
- [ ] All props documented with @param tags
- [ ] Optional props include default values
- [ ] Complex props explain data structure
- [ ] Callback props describe trigger conditions

**Return Documentation:**
- [ ] @returns tag describes rendered output
- [ ] Mentions key UI elements and layout

**Usage Examples:**
- [ ] At least 2-3 practical examples
- [ ] Covers basic and advanced usage
- [ ] Shows realistic prop values and callbacks
- [ ] Demonstrates different use cases

**Technical Details:**
- [ ] Mentions validation rules if applicable
- [ ] Describes state management approach
- [ ] Notes external dependencies (ReactQuill, etc.)
- [ ] Explains business logic or workflows

---

## Implementation Priority

### Phase 1: Critical Components (Week 1)
1. **BusinessesSection.tsx** (604 lines) - Most complex user-facing component
2. **business-card.tsx** - Core display component used throughout app
3. **useBusinessData.ts** - Primary data fetching hook

### Phase 2: Admin Components (Week 2)
4. **AdminBusinessesPage** - Admin business management
5. **UserManagement** - Admin user operations
6. **BusinessManagement** - Business CRUD operations

### Phase 3: Utility Components (Week 3)
7. **LoadingState** - Loading state patterns
8. **ErrorBoundary** - Error handling
9. **Form components** - Standard form patterns

### Phase 4: Remaining Components (Week 4)
10. Complete remaining 80+ components following established patterns

---

## Tools and Automation

### TSDoc Generation
```bash
# Install TypeDoc for automated documentation
npm install --save-dev typedoc

# Generate API documentation
npm run docs:generate

# Serve documentation locally
npm run docs:serve
```

### Documentation Linting
```json
// Add to ESLint config
{
  "rules": {
    "jsdoc/require-jsdoc": ["warn", {
      "require": {
        "FunctionDeclaration": true,
        "ClassDeclaration": true,
        "ArrowFunctionExpression": false
      }
    }]
  }
}
```

This template establishes the gold standard for component documentation across the project, ensuring consistent, comprehensive documentation that significantly reduces onboarding time for new developers.