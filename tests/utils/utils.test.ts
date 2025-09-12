import { describe, it, expect } from 'vitest'
import { cn } from '../../client/src/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
      expect(cn('text-red-500', 'font-bold')).toBe('text-red-500 font-bold')
    })

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('handles undefined and null values', () => {
      expect(cn('base-class', undefined)).toBe('base-class')
      expect(cn('base-class', null)).toBe('base-class')
      expect(cn(undefined, 'other-class')).toBe('other-class')
    })

    it('deduplicates conflicting Tailwind classes', () => {
      // twMerge should handle conflicting utility classes
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
      expect(cn({ 'class1': true, 'class2': false })).toBe('class1')
      expect(cn({ 'class1': true, 'class2': true })).toBe('class1 class2')
    })

    it('handles empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn([])).toBe('')
      expect(cn({})).toBe('')
    })

    it('handles mixed input types', () => {
      expect(cn(
        'base',
        ['array', 'classes'],
        { 'object': true, 'disabled': false },
        'string-class'
      )).toBe('base array classes object string-class')
    })
  })
})