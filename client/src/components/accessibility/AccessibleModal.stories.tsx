import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';
import { AccessibleModal } from './AccessibleModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

/**
 * The AccessibleModal component provides a fully accessible modal dialog
 * with comprehensive keyboard navigation, focus management, and screen reader support.
 * 
 * ## Accessibility Features
 * - Automatic focus management and trapping
 * - Escape key to close
 * - ARIA attributes for screen readers
 * - Focus restoration when closed
 * - Click outside to close
 */
const meta = {
  title: 'Components/AccessibleModal',
  component: AccessibleModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A fully accessible modal dialog component with focus management and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    title: {
      control: 'text',
      description: 'The modal title (used for aria-labelledby)',
    },
    description: {
      control: 'text',
      description: 'Optional description (used for aria-describedby)',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether pressing Escape closes the modal',
    },
    trapFocus: {
      control: 'boolean',
      description: 'Whether to trap focus within the modal',
    },
  },
  args: {
    onClose: fn(),
    closeOnEscape: true,
    trapFocus: true,
  },
} satisfies Meta<typeof AccessibleModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive modal demo with state management.
 */
function ModalDemo({ 
  title = "Demo Modal",
  description,
  children,
  ...props 
}: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>
      <AccessibleModal
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
      >
        {children}
      </AccessibleModal>
    </div>
  );
}

/**
 * Basic modal with simple content.
 */
export const Default: Story = {
  render: (args) => (
    <ModalDemo {...args}>
      <div className="space-y-4">
        <p>This is a basic modal with default settings.</p>
        <p>Try using Tab to navigate, Escape to close, or click outside.</p>
        <Button onClick={() => {}}>Action Button</Button>
      </div>
    </ModalDemo>
  ),
  args: {
    title: 'Basic Modal',
    description: 'A simple modal demonstration',
  },
};

/**
 * Modal with form elements demonstrating focus management.
 */
export const WithForm: Story = {
  render: (args) => (
    <ModalDemo {...args}>
      <form className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Enter your message" />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Submit</Button>
          <Button variant="outline" type="button">Cancel</Button>
        </div>
      </form>
    </ModalDemo>
  ),
  args: {
    title: 'Contact Form',
    description: 'Fill out the form below to send us a message',
  },
};

/**
 * Confirmation modal for destructive actions.
 */
export const Confirmation: Story = {
  render: (args) => (
    <ModalDemo {...args}>
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="destructive">Delete Account</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </ModalDemo>
  ),
  args: {
    title: 'Delete Account',
    description: 'Are you absolutely sure you want to delete your account?',
  },
};

/**
 * Information modal with rich content.
 */
export const Information: Story = {
  render: (args) => (
    <ModalDemo {...args}>
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your settings have been successfully updated. The changes will take effect immediately.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <h4 className="font-medium">What changed:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Email notifications enabled</li>
            <li>Privacy settings updated</li>
            <li>Theme preference saved</li>
          </ul>
        </div>
        <Button>Got it</Button>
      </div>
    </ModalDemo>
  ),
  args: {
    title: 'Settings Updated',
    description: 'Your preferences have been saved successfully',
  },
};

/**
 * Success modal with celebration.
 */
export const Success: Story = {
  render: (args) => (
    <ModalDemo {...args}>
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Payment Successful!</h3>
          <p className="text-muted-foreground">
            Your order has been confirmed and will be shipped within 2-3 business days.
          </p>
        </div>
        <div className="space-y-2">
          <Button className="w-full">View Order Details</Button>
          <Button variant="outline" className="w-full">Continue Shopping</Button>
        </div>
      </div>
    </ModalDemo>
  ),
  args: {
    title: 'Order Confirmed',
    description: 'Thank you for your purchase',
  },
};

/**
 * Modal without focus trapping (not recommended for most use cases).
 */
export const NoFocusTrap: Story = {
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This modal does not trap focus (not recommended for accessibility).
      </p>
      <ModalDemo {...args}>
        <div className="space-y-4">
          <p>This modal allows focus to escape to the background.</p>
          <p>This can make it difficult for keyboard users to navigate.</p>
          <Button>Focus can escape</Button>
        </div>
      </ModalDemo>
    </div>
  ),
  args: {
    title: 'No Focus Trap',
    description: 'Demonstrates modal without focus trapping',
    trapFocus: false,
  },
};

/**
 * Modal that doesn't close on Escape key.
 */
export const NoEscapeClose: Story = {
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This modal cannot be closed with the Escape key (use with caution).
      </p>
      <ModalDemo {...args}>
        <div className="space-y-4">
          <p>You must use the close button to dismiss this modal.</p>
          <p>Escape key is disabled for this modal.</p>
          <Button>Close Button Required</Button>
        </div>
      </ModalDemo>
    </div>
  ),
  args: {
    title: 'No Escape Close',
    description: 'This modal requires explicit closing',
    closeOnEscape: false,
  },
};

/**
 * Large modal with scrollable content.
 */
export const LargeContent: Story = {
  render: (args) => (
    <ModalDemo {...args}>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-4 border rounded">
              <h4 className="font-medium">Section {i + 1}</h4>
              <p className="text-sm text-muted-foreground">
                This is content section {i + 1}. The modal content is scrollable
                when it exceeds the maximum height. Focus management still works
                properly even with scrollable content.
              </p>
              {i % 5 === 0 && <Button size="sm">Action {i + 1}</Button>}
            </div>
          ))}
        </div>
      </div>
    </ModalDemo>
  ),
  args: {
    title: 'Large Content Modal',
    description: 'This modal contains scrollable content',
  },
};

/**
 * Nested modals demonstration (advanced use case).
 */
function NestedModalDemo() {
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setFirstOpen(true)}>
        Open First Modal
      </Button>
      <AccessibleModal
        isOpen={firstOpen}
        onClose={() => setFirstOpen(false)}
        title="First Modal"
        description="This modal can open another modal"
      >
        <div className="space-y-4">
          <p>This is the first modal. You can open a second modal from here.</p>
          <Button onClick={() => setSecondOpen(true)}>
            Open Second Modal
          </Button>
        </div>
      </AccessibleModal>
      <AccessibleModal
        isOpen={secondOpen}
        onClose={() => setSecondOpen(false)}
        title="Second Modal"
        description="This is a nested modal"
      >
        <div className="space-y-4">
          <p>This is the second modal, opened from the first modal.</p>
          <p>Focus management still works correctly with nested modals.</p>
          <Button onClick={() => setSecondOpen(false)}>
            Close This Modal
          </Button>
        </div>
      </AccessibleModal>
    </div>
  );
}

export const NestedModals: Story = {
  render: () => <NestedModalDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates nested modals with proper focus management.',
      },
    },
  },
};