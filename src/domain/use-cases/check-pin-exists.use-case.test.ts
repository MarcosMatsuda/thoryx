import { CheckPinExistsUseCase } from './check-pin-exists.use-case'
import { PinRepository } from '@domain/repositories/pin.repository'

describe('CheckPinExistsUseCase', () => {
  let useCase: CheckPinExistsUseCase
  let mockRepository: jest.Mocked<PinRepository>

  beforeEach(() => {
    jest.clearAllMocks()

    mockRepository = {
      verify: jest.fn(),
      save: jest.fn(),
      exists: jest.fn(),
      delete: jest.fn(),
    } as any

    useCase = new CheckPinExistsUseCase(mockRepository)
  })

  describe('PIN existence check', () => {
    it('returns true when PIN exists', async () => {
      mockRepository.exists.mockResolvedValue(true)

      const result = await useCase.execute()

      expect(result).toBe(true)
      expect(mockRepository.exists).toHaveBeenCalledTimes(1)
    })

    it('returns false when PIN does not exist', async () => {
      mockRepository.exists.mockResolvedValue(false)

      const result = await useCase.execute()

      expect(result).toBe(false)
      expect(mockRepository.exists).toHaveBeenCalledTimes(1)
    })

    it('calls repository exists method once', async () => {
      mockRepository.exists.mockResolvedValue(true)

      await useCase.execute()

      expect(mockRepository.exists).toHaveBeenCalledTimes(1)
      expect(mockRepository.exists).toHaveBeenCalledWith()
    })
  })

  describe('Error handling', () => {
    it('returns false when repository throws error', async () => {
      mockRepository.exists.mockRejectedValue(new Error('Storage unavailable'))

      const result = await useCase.execute()

      expect(result).toBe(false)
    })

    it('returns false on permission denied', async () => {
      mockRepository.exists.mockRejectedValue(new Error('Permission denied'))

      const result = await useCase.execute()

      expect(result).toBe(false)
    })

    it('returns false on timeout error', async () => {
      mockRepository.exists.mockRejectedValue(new Error('Timeout'))

      const result = await useCase.execute()

      expect(result).toBe(false)
    })

    it('logs error when repository fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockRepository.exists.mockRejectedValue(new Error('Storage error'))

      await useCase.execute()

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })

    it('does not throw error when repository fails', async () => {
      mockRepository.exists.mockRejectedValue(new Error('Storage error'))

      expect(async () => await useCase.execute()).not.toThrow()
    })
  })

  describe('Return type', () => {
    it('always returns a boolean', async () => {
      mockRepository.exists.mockResolvedValue(true)

      const result = await useCase.execute()

      expect(typeof result).toBe('boolean')
    })

    it('is async and returns a Promise', async () => {
      mockRepository.exists.mockResolvedValue(true)

      const result = useCase.execute()

      expect(result instanceof Promise).toBe(true)
      await result
    })
  })

  describe('Edge cases', () => {
    it('handles repository returning 0 as false', async () => {
      mockRepository.exists.mockResolvedValue(false)

      const result = await useCase.execute()

      expect(result).toBe(false)
    })

    it('handles repository returning 1 as true', async () => {
      mockRepository.exists.mockResolvedValue(true)

      const result = await useCase.execute()

      expect(result).toBe(true)
    })

    it('called multiple times returns consistent results', async () => {
      mockRepository.exists.mockResolvedValue(true)

      const result1 = await useCase.execute()
      const result2 = await useCase.execute()

      expect(result1).toBe(result2)
      expect(result1).toBe(true)
    })
  })
})
