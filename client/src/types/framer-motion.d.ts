// Type declarations to fix framer-motion TypeScript issues
import { ReactNode } from 'react';

declare module 'framer-motion' {
  interface MotionValue<T> {
    toString(): string;
  }
}

export {};