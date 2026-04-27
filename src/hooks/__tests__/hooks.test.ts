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

  })
}) 