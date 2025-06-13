import { describe, it, expect } from 'vitest'
import { cn, formatDate, formatPhoneNumber, validateEmail, generateSlug } from './utils'

describe('Utility Functions', () => {
  describe('cn (classnames)', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('bg-blue-500', 'text-white')).toBe('bg-blue-500 text-white')
    })

    it('handles conflicting classes', () => {
      expect(cn('bg-blue-500', 'bg-red-500')).toBe('bg-red-500')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('handles undefined and null values', () => {
      expect(cn('base-class', undefined, null)).toBe('base-class')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toMatch(/Jan 15, 2024/)
    })

    it('handles string dates', () => {
      expect(formatDate('2024-01-15')).toMatch(/Jan 15, 2024/)
    })

    it('handles invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('formatPhoneNumber', () => {
    it('formats US phone numbers', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567')
    })

    it('handles phone numbers with existing formatting', () => {
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567')
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567')
    })

    it('handles international numbers', () => {
      expect(formatPhoneNumber('+44 20 1234 5678')).toBe('+44 20 1234 5678')
    })

    it('handles invalid numbers', () => {
      expect(formatPhoneNumber('123')).toBe('123')
      expect(formatPhoneNumber('')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('test.email@subdomain.example.com')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test..email@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('generateSlug', () => {
    it('generates valid slugs from text', () => {
      expect(generateSlug('Test Business Name')).toBe('test-business-name')
      expect(generateSlug('Business & Company')).toBe('business-company')
      expect(generateSlug('Business   with   spaces')).toBe('business-with-spaces')
    })

    it('handles special characters', () => {
      expect(generateSlug('Café & Restaurant')).toBe('cafe-restaurant')
      expect(generateSlug('Joe\'s Pizza Place')).toBe('joes-pizza-place')
      expect(generateSlug('24/7 Store')).toBe('24-7-store')
    })

    it('handles empty and invalid inputs', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('   ')).toBe('')
      expect(generateSlug('!!!')).toBe('')
    })

    it('limits slug length', () => {
      const longTitle = 'This is a very long business name that should be truncated to a reasonable length'
      const slug = generateSlug(longTitle)
      expect(slug.length).toBeLessThanOrEqual(50)
      expect(slug).not.toEndWith('-')
    })
  })
})