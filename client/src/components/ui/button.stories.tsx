import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './button';
import { Mail, Download, Plus, Trash2, Settings, ArrowRight } from 'lucide-react';

/**
 * The Button component is the primary interactive element in our design system.
 * It supports multiple variants, sizes, and states for different use cases.
 * 
 * ## Design Guidelines
 * - Use `default` variant for primary actions
 * - Use `secondary` for secondary actions
 * - Use `outline` for less prominent actions
 * - Use `ghost` for subtle interactions
 * - Use `destructive` for dangerous actions
 * - Use `link` for text-based navigation
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component that supports multiple variants, sizes, and accessibility features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Change the default rendered element for the one passed as a child',
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default button variant is used for primary actions.
 * It has the highest visual prominence and should be used sparingly.
 */
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Primary Action',
  },
};

/**
 * Secondary buttons are used for secondary actions.
 * They have less visual prominence than primary buttons.
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  },
};

/**
 * Outline buttons provide a middle ground between primary and secondary actions.
 * Good for actions that need some prominence but aren't primary.
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

/**
 * Ghost buttons are subtle and used for less important actions.
 * They become more prominent on hover/focus.
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/**
 * Destructive buttons are used for dangerous or irreversible actions.
 * Use with caution and consider confirmation dialogs.
 */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Item',
  },
};

/**
 * Link buttons look like text links but maintain button semantics.
 * Good for navigation or secondary actions in content.
 */
export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

/**
 * Small buttons are used in compact interfaces or as secondary actions.
 */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

/**
 * Large buttons are used for prominent calls-to-action.
 */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

/**
 * Icon buttons contain only an icon and are square.
 * Always include proper aria-labels for accessibility.
 */
export const Icon: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    'aria-label': 'Settings',
    children: <Settings className="h-4 w-4" />,
  },
};

/**
 * Disabled buttons cannot be interacted with.
 * They should clearly indicate their inactive state.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

/**
 * Buttons with icons and text provide clear visual context.
 * Icons should be placed consistently (typically left side).
 */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </>
    ),
  },
};

/**
 * Loading state buttons show progress and prevent duplicate submissions.
 */
export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Processing...
      </>
    ),
  },
};

/**
 * A collection of all button variants for comparison.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      
      <div className="flex gap-2 items-center flex-wrap">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>Disabled Outline</Button>
        <Button variant="destructive" disabled>Disabled Destructive</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all button variants, sizes, and states available in the design system.',
      },
    },
  },
};

/**
 * Common button patterns used throughout the application.
 */
export const CommonPatterns: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Action Buttons</h3>
        <div className="flex gap-2 flex-wrap">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="ghost">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Navigation Buttons</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="ghost">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="link">Learn More</Button>
          <Button variant="outline">Go Back</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Dangerous Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
            Remove
          </Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common button patterns and combinations used throughout the application.',
      },
    },
  },
};

/**
 * Accessibility demonstration showing proper button implementation.
 */
export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Accessible Buttons</h3>
        <div className="flex gap-2 flex-wrap">
          <Button aria-label="Add new item to your collection">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Item
          </Button>
          <Button variant="outline" aria-label="Download the current document">
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Download Document</span>
          </Button>
          <Button size="icon" aria-label="Open settings menu">
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Focus States</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Use Tab key to navigate and see focus indicators
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button>Focusable Button 1</Button>
          <Button variant="outline">Focusable Button 2</Button>
          <Button variant="ghost">Focusable Button 3</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of properly implemented accessible buttons with ARIA labels and focus management.',
      },
    },
  },
};