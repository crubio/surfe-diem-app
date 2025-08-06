import { vi } from 'vitest'

// Mock the API functions
vi.mock('@features/locations/api/locations', () => ({
  getSurfSpot: vi.fn(),
  getSurfSpotBySlug: vi.fn(),
  getSurfSpots: vi.fn(),
  getSurfSpotClosest: vi.fn(),
  getLocationBuoyNearby: vi.fn()
}))

describe('Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook Imports', () => {
    it('should be able to import useSpotData', async () => {
      const { useSpotData } = await import('../useSpotData')
      expect(useSpotData).toBeDefined()
      expect(typeof useSpotData).toBe('function')
    })

    it('should be able to import useTideData', async () => {
      const { useTideData } = await import('../useTideData')
      expect(useTideData).toBeDefined()
      expect(typeof useTideData).toBe('function')
    })

    it('should be able to import useForecastData', async () => {
      const { useForecastData } = await import('../useForecastData')
      expect(useForecastData).toBeDefined()
      expect(typeof useForecastData).toBe('function')
    })

    it('should be able to import useLocationData', async () => {
      const { useLocationData } = await import('../useLocationData')
      expect(useLocationData).toBeDefined()
      expect(typeof useLocationData).toBe('function')
    })

    it('should be able to import useGeolocation', async () => {
      const { useGeolocation } = await import('../useGeolocation')
      expect(useGeolocation).toBeDefined()
      expect(typeof useGeolocation).toBe('function')
    })
  })
}) 