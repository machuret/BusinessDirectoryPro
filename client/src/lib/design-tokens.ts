// Design System - Standardized Props and Patterns

export interface StandardButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
}

export interface StandardInputProps {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  required?: boolean
  type?: string
}

export interface StandardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export interface StandardFormProps {
  onSubmit: (event: React.FormEvent) => void
  loading?: boolean
  error?: string
  children: React.ReactNode
}

// Design Tokens
export const designTokens = {
  colors: {
    rating: "fill-yellow-500 text-yellow-500",
    featured: {
      background: "bg-gradient-to-br from-yellow-50 to-white",
      border: "ring-2 ring-yellow-400 border-yellow-200",
      badge: "bg-yellow-500 text-yellow-900",
      button: "bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
    },
    success: "text-green-600",
    error: "text-red-600",
    muted: "text-gray-500"
  },
  spacing: {
    card: "p-6",
    section: "space-y-4",
    button: "px-4 py-2",
    form: "space-y-6"
  },
  animations: {
    hover: "transition-all duration-200",
    scale: "transform hover:scale-105",
    fade: "transition-opacity duration-300"
  }
} as const;

// Component Size Standards
export const componentSizes = {
  image: {
    card: "h-48",
    thumbnail: "h-24 w-24",
    hero: "h-64 md:h-96"
  },
  container: {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-7xl"
  }
} as const;