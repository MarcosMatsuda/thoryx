import { InputMasks } from './input-masks'

describe('InputMasks', () => {
  describe('creditCardNumber', () => {
    it('should format a complete card number with spaces', () => {
      const input = '4532123456789010'
      const result = InputMasks.creditCardNumber(input)
      expect(result).toBe('4532 1234 5678 9010')
    })

    it('should handle partial card numbers', () => {
      const input = '4532'
      const result = InputMasks.creditCardNumber(input)
      expect(result).toBe('4532')
    })

    it('should limit to 16 digits maximum', () => {
      const input = '45321234567890101234'
      const result = InputMasks.creditCardNumber(input)
      expect(result).toBe('4532 1234 5678 9010')
    })

    it('should remove non-numeric characters', () => {
      const input = '4532-1234-5678-9010'
      const result = InputMasks.creditCardNumber(input)
      expect(result).toBe('4532 1234 5678 9010')
    })

    it('should handle empty input', () => {
      const input = ''
      const result = InputMasks.creditCardNumber(input)
      expect(result).toBe('')
    })

    it('should handle only letters', () => {
      const input = 'abcd'
      const result = InputMasks.creditCardNumber(input)
      expect(result).toBe('')
    })
  })

  describe('expiryDate', () => {
    it('should format MM/YY when all 4 digits provided', () => {
      const input = '1225'
      const result = InputMasks.expiryDate(input)
      expect(result).toBe('12/25')
    })

    it('should handle partial input', () => {
      const input = '1'
      const result = InputMasks.expiryDate(input)
      expect(result).toBe('1')
    })

    it('should add slash after first two digits', () => {
      const input = '122'
      const result = InputMasks.expiryDate(input)
      expect(result).toBe('12/2')
    })

    it('should limit to 4 digits maximum', () => {
      const input = '122530'
      const result = InputMasks.expiryDate(input)
      expect(result).toBe('12/25')
    })

    it('should remove non-numeric characters', () => {
      const input = '12/25'
      const result = InputMasks.expiryDate(input)
      expect(result).toBe('12/25')
    })

    it('should handle empty input', () => {
      const input = ''
      const result = InputMasks.expiryDate(input)
      expect(result).toBe('')
    })
  })

  describe('cvv', () => {
    it('should accept a 3-digit CVV', () => {
      const input = '123'
      const result = InputMasks.cvv(input)
      expect(result).toBe('123')
    })

    it('should accept a 4-digit CVV', () => {
      const input = '1234'
      const result = InputMasks.cvv(input)
      expect(result).toBe('1234')
    })

    it('should limit to 4 digits maximum', () => {
      const input = '12345'
      const result = InputMasks.cvv(input)
      expect(result).toBe('1234')
    })

    it('should remove non-numeric characters', () => {
      const input = '1-2-3-4'
      const result = InputMasks.cvv(input)
      expect(result).toBe('1234')
    })

    it('should handle empty input', () => {
      const input = ''
      const result = InputMasks.cvv(input)
      expect(result).toBe('')
    })
  })

  describe('cardholderName', () => {
    it('should convert to uppercase', () => {
      const input = 'john doe'
      const result = InputMasks.cardholderName(input)
      expect(result).toBe('JOHN DOE')
    })

    it('should keep spaces', () => {
      const input = 'john   doe'
      const result = InputMasks.cardholderName(input)
      expect(result).toBe('JOHN   DOE')
    })

    it('should remove non-alphabetic and non-space characters', () => {
      const input = 'john@doe123'
      const result = InputMasks.cardholderName(input)
      expect(result).toBe('JOHNDOE')
    })

    it('should handle empty input', () => {
      const input = ''
      const result = InputMasks.cardholderName(input)
      expect(result).toBe('')
    })

    it('should handle only numbers and special characters', () => {
      const input = '123!@#'
      const result = InputMasks.cardholderName(input)
      expect(result).toBe('')
    })
  })

  describe('removeCardNumberMask', () => {
    it('should remove spaces from formatted card number', () => {
      const input = '4532 1234 5678 9010'
      const result = InputMasks.removeCardNumberMask(input)
      expect(result).toBe('4532123456789010')
    })

    it('should handle unformatted input', () => {
      const input = '4532123456789010'
      const result = InputMasks.removeCardNumberMask(input)
      expect(result).toBe('4532123456789010')
    })

    it('should handle empty input', () => {
      const input = ''
      const result = InputMasks.removeCardNumberMask(input)
      expect(result).toBe('')
    })
  })

  describe('removeExpiryDateMask', () => {
    it('should remove slash from formatted expiry date', () => {
      const input = '12/25'
      const result = InputMasks.removeExpiryDateMask(input)
      expect(result).toBe('1225')
    })

    it('should handle unformatted input', () => {
      const input = '1225'
      const result = InputMasks.removeExpiryDateMask(input)
      expect(result).toBe('1225')
    })

    it('should handle empty input', () => {
      const input = ''
      const result = InputMasks.removeExpiryDateMask(input)
      expect(result).toBe('')
    })

    it('should remove multiple slashes if present', () => {
      const input = '12/2/5'
      const result = InputMasks.removeExpiryDateMask(input)
      expect(result).toBe('1225')
    })
  })
})
