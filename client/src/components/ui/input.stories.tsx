import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Search as SearchIcon, Mail, Lock, Eye, EyeOff, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';

/**
 * The Input component is a foundational form element in our design system.
 * It provides consistent styling, validation states, and accessibility features.
 * 
 * ## Design Guidelines
 * - Always pair with Label components for accessibility
 * - Use appropriate input types for data validation
 * - Provide clear placeholder text when helpful
 * - Show validation states with proper error messages
 * - Consider using icons for enhanced user experience
 */
const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component that supports various types, states, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date'],
      description: 'The type of input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when input is empty',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text input with standard styling.
 */
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

/**
 * Email input with proper validation and type.
 */
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email address',
  },
};

/**
 * Password input for sensitive information.
 */
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

/**
 * Search input with appropriate styling.
 */
export const SearchInput: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

/**
 * Disabled input showing inactive state.
 */
export const Disabled: Story = {
  args: {
    placeholder: 'This input is disabled',
    disabled: true,
    value: 'Disabled input value',
  },
};

/**
 * Required input with validation indicator.
 */
export const Required: Story = {
  args: {
    placeholder: 'This field is required',
    required: true,
  },
};

/**
 * Input with label demonstrating proper form structure.
 */
export const WithLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-label">Full Name</Label>
      <Input {...args} id="input-with-label" />
    </div>
  ),
  args: {
    placeholder: 'Enter your full name',
  },
};

/**
 * Input with icon for enhanced visual context.
 */
export const WithIcon: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-icon">Email Address</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input {...args} id="input-with-icon" className="pl-10" />
      </div>
    </div>
  ),
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

/**
 * Password input with toggle visibility functionality.
 */
function PasswordWithToggle() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="password-toggle">Password</Label>
      <div className="relative">
        <Input
          id="password-toggle"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}

export const PasswordToggle: Story = {
  render: () => <PasswordWithToggle />,
  parameters: {
    docs: {
      description: {
        story: 'Password input with toggle visibility functionality for better user experience.',
      },
    },
  },
};

/**
 * Search input with search icon and clear functionality.
 */
function SearchWithIcon() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="space-y-2">
      <Label htmlFor="search-input">Search</Label>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="search-input"
          type="search"
          placeholder="Search for anything..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setSearchValue('')}
            aria-label="Clear search"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

export const SearchWithClear: Story = {
  render: () => <SearchWithIcon />,
  parameters: {
    docs: {
      description: {
        story: 'Search input with icon and clear functionality.',
      },
    },
  },
};

/**
 * Collection of different input types for comparison.
 */
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-2">
        <Label htmlFor="text-input">Text</Label>
        <Input id="text-input" type="text" placeholder="Enter text" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-input">Email</Label>
        <Input id="email-input" type="email" placeholder="Enter email" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-input">Password</Label>
        <Input id="password-input" type="password" placeholder="Enter password" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="number-input">Number</Label>
        <Input id="number-input" type="number" placeholder="Enter number" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tel-input">Phone</Label>
        <Input id="tel-input" type="tel" placeholder="Enter phone number" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="url-input">URL</Label>
        <Input id="url-input" type="url" placeholder="Enter website URL" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date-input">Date</Label>
        <Input id="date-input" type="date" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of different input types available in the design system.',
      },
    },
  },
};

/**
 * Form validation states demonstration.
 */
function ValidationStates() {
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirm: '',
  });

  const validateForm = () => {
    const newErrors = { email: '', password: '', confirm: '' };
    
    // Simple validation for demo
    if (!document.getElementById('validation-email')?.value) {
      newErrors.email = 'Email is required';
    }
    if (!document.getElementById('validation-password')?.value) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
  };

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Form Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="validation-email">Email</Label>
          <Input
            id="validation-email"
            type="email"
            placeholder="Enter your email"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="validation-password">Password</Label>
          <Input
            id="validation-password"
            type="password"
            placeholder="Enter your password"
            className={errors.password ? 'border-destructive' : ''}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="validation-confirm">Confirm Password</Label>
          <Input
            id="validation-confirm"
            type="password"
            placeholder="Confirm your password"
            className={errors.confirm ? 'border-destructive' : ''}
          />
          {errors.confirm && (
            <p className="text-sm text-destructive">{errors.confirm}</p>
          )}
        </div>
        
        <Button onClick={validateForm} className="w-full">
          Validate Form
        </Button>
      </CardContent>
    </Card>
  );
}

export const ValidationDemo: Story = {
  render: () => <ValidationStates />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of form validation states and error handling.',
      },
    },
  },
};

/**
 * Specialized input patterns for common use cases.
 */
export const SpecializedInputs: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-2">
        <Label htmlFor="currency-input">Price</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="currency-input"
            type="number"
            placeholder="0.00"
            className="pl-10"
            step="0.01"
            min="0"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date-input-icon">Event Date</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="date-input-icon"
            type="date"
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="secure-input">Security Code</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="secure-input"
            type="password"
            placeholder="Enter security code"
            className="pl-10"
            maxLength={6}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Specialized input patterns for common business use cases.',
      },
    },
  },
};

/**
 * Accessibility demonstration showing proper implementation.
 */
export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-2">
        <Label htmlFor="accessible-required">
          Full Name
          <span className="text-destructive ml-1" aria-label="required">*</span>
        </Label>
        <Input
          id="accessible-required"
          placeholder="Enter your full name"
          required
          aria-describedby="name-hint"
        />
        <p id="name-hint" className="text-sm text-muted-foreground">
          Enter your first and last name as they appear on official documents.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accessible-email">Email Address</Label>
        <Input
          id="accessible-email"
          type="email"
          placeholder="example@domain.com"
          aria-describedby="email-hint"
        />
        <p id="email-hint" className="text-sm text-muted-foreground">
          We'll never share your email with anyone else.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accessible-password">Password</Label>
        <Input
          id="accessible-password"
          type="password"
          placeholder="Create a secure password"
          aria-describedby="password-requirements"
        />
        <div id="password-requirements" className="text-sm text-muted-foreground">
          <p>Password must contain:</p>
          <ul className="list-disc list-inside ml-2">
            <li>At least 8 characters</li>
            <li>One uppercase letter</li>
            <li>One number</li>
          </ul>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Proper accessibility implementation with ARIA attributes and descriptive content.',
      },
    },
  },
};