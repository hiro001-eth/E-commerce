import { describe, it, expect } from 'vitest'
import { 
  formatCurrency, 
  formatCurrencyCompact, 
  CURRENCY_SYMBOL, 
  CURRENCY_CODE, 
  CURRENCY_NAME 
} from '../../client/src/lib/currency'

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('formats whole numbers without decimals', () => {
      expect(formatCurrency(100)).toBe('Rs. 100')
      expect(formatCurrency(1000)).toBe('Rs. 1,000')
      expect(formatCurrency(50000)).toBe('Rs. 50,000')
    })

    it('formats decimal numbers with 2 decimal places', () => {
      expect(formatCurrency(99.99)).toBe('Rs. 99.99')
      expect(formatCurrency(1250.50)).toBe('Rs. 1,250.50')
      expect(formatCurrency(10.1)).toBe('Rs. 10.10')
    })

    it('handles string inputs', () => {
      expect(formatCurrency('100')).toBe('Rs. 100')
      expect(formatCurrency('99.99')).toBe('Rs. 99.99')
      expect(formatCurrency('1250.50')).toBe('Rs. 1,250.50')
    })

    it('handles invalid inputs gracefully', () => {
      expect(formatCurrency('invalid')).toBe('Rs. 0')
      expect(formatCurrency(NaN)).toBe('Rs. 0')
      expect(formatCurrency('')).toBe('Rs. 0')
    })

    it('handles zero and negative numbers', () => {
      expect(formatCurrency(0)).toBe('Rs. 0')
      expect(formatCurrency(-100)).toBe('Rs. -100')
      expect(formatCurrency(-99.99)).toBe('Rs. -99.99')
    })

    it('handles very large numbers', () => {
      expect(formatCurrency(1000000)).toBe('Rs. 1,000,000')
      expect(formatCurrency(99999999.99)).toBe('Rs. 99,999,999.99')
    })
  })

  describe('formatCurrencyCompact', () => {
    it('formats numbers under 1000 normally', () => {
      expect(formatCurrencyCompact(999)).toBe('Rs. 999')
      expect(formatCurrencyCompact(500.50)).toBe('Rs. 500.50')
      expect(formatCurrencyCompact(0)).toBe('Rs. 0')
    })

    it('formats thousands with K suffix', () => {
      expect(formatCurrencyCompact(1000)).toBe('Rs. 1.0K')
      expect(formatCurrencyCompact(1500)).toBe('Rs. 1.5K')
      expect(formatCurrencyCompact(50000)).toBe('Rs. 50.0K')
      expect(formatCurrencyCompact(99999)).toBe('Rs. 100.0K')
    })

    it('formats lakhs with L suffix', () => {
      expect(formatCurrencyCompact(100000)).toBe('Rs. 1.0L')
      expect(formatCurrencyCompact(250000)).toBe('Rs. 2.5L')
      expect(formatCurrencyCompact(1500000)).toBe('Rs. 15.0L')
      expect(formatCurrencyCompact(9999999)).toBe('Rs. 100.0L')
    })

    it('formats crores with Cr suffix', () => {
      expect(formatCurrencyCompact(10000000)).toBe('Rs. 1.0Cr')
      expect(formatCurrencyCompact(25000000)).toBe('Rs. 2.5Cr')
      expect(formatCurrencyCompact(150000000)).toBe('Rs. 15.0Cr')
      expect(formatCurrencyCompact(999999999)).toBe('Rs. 100.0Cr')
    })

    it('handles string inputs', () => {
      expect(formatCurrencyCompact('1000')).toBe('Rs. 1.0K')
      expect(formatCurrencyCompact('100000')).toBe('Rs. 1.0L')
      expect(formatCurrencyCompact('10000000')).toBe('Rs. 1.0Cr')
    })

    it('handles invalid inputs gracefully', () => {
      expect(formatCurrencyCompact('invalid')).toBe('Rs. 0')
      expect(formatCurrencyCompact(NaN)).toBe('Rs. 0')
      expect(formatCurrencyCompact('')).toBe('Rs. 0')
    })

    it('handles negative numbers', () => {
      expect(formatCurrencyCompact(-1000)).toBe('Rs. -1.0K')
      expect(formatCurrencyCompact(-100000)).toBe('Rs. -1.0L')
      expect(formatCurrencyCompact(-10000000)).toBe('Rs. -1.0Cr')
    })
  })

  describe('Currency Constants', () => {
    it('exports correct currency constants', () => {
      expect(CURRENCY_SYMBOL).toBe('Rs.')
      expect(CURRENCY_CODE).toBe('NPR')
      expect(CURRENCY_NAME).toBe('Nepali Rupee')
    })
  })
})