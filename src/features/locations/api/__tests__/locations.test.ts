import { describe, it, expect, vi } from 'vitest';
import * as api from '../locations';
import { axios } from '../../../../lib/axios';

vi.mock('../../../../lib/axios');

describe('locations API', () => {
  it('getSurfSpots returns data', async () => {
    const mockData = [{ id: 1, name: 'Test Spot' }];
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });
    const result = await api.getSurfSpots();
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalled();
  });

  it('getSurfSpot returns a single spot', async () => {
    const mockSpot = { id: 1, name: 'Test Spot', latitude: 0, longitude: 0, active: true, subregion_name: 'Region', timezone: 'PST' };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockSpot });
    const result = await api.getSurfSpot(1);
    expect(result).toEqual(mockSpot);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/1'));
  });

  it('getSurfSpotClosest returns spots', async () => {
    const mockSpots = [{ id: 1, name: 'Closest Spot', latitude: 0, longitude: 0, active: true, subregion_name: 'Region', timezone: 'PST' }];
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockSpots });
    const result = await api.getSurfSpotClosest(1, 2);
    expect(result).toEqual(mockSpots);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('find_closest'), expect.objectContaining({ params: { lat: 1, lng: 2 } }));
  });

  it('getSurfSpotsGeoJson returns geojson', async () => {
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [1, 2] },
          properties: { id: 1, name: 'Test', description: 'desc' },
        },
      ],
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockGeoJson });
    const result = await api.getSurfSpotsGeoJson();
    expect(result).toEqual(mockGeoJson);
    expect(axios.get).toHaveBeenCalled();
  });

  it('getGeoJsonLocations returns geojson', async () => {
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [1, 2] },
          properties: { id: 1, name: 'Test', description: 'desc' },
        },
      ],
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockGeoJson });
    const result = await api.getGeoJsonLocations();
    expect(result).toEqual(mockGeoJson);
    expect(axios.get).toHaveBeenCalled();
  });

  it('getLocations returns locations', async () => {
    const mockLocations = [{ name: 'Buoy', url: '', active: true, location_id: 'loc1', id: 1, date_created: '', date_updated: '' }];
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockLocations });
    const result = await api.getLocations();
    expect(result).toEqual(mockLocations);
    expect(axios.get).toHaveBeenCalled();
  });

  it('getLocation returns a single location', async () => {
    const mockLocation = {
      name: 'Buoy', url: '', active: true, location_id: 'loc1', id: 1, date_created: '', date_updated: ''
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockLocation });
    const result = await api.getLocation('loc1');
    expect(result).toEqual(mockLocation);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/loc1'));
  });

  it('getLocationBuoyNearby returns nearby buoys', async () => {
    const mockNearby = [{ name: 'Buoy', url: '', active: true, location_id: 'loc1', id: 1, date_created: '', date_updated: '', description: '', distance: '1', latitude: '0', longitude: '0', location: '', }];
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockNearby });
    const result = await api.getLocationBuoyNearby(1, 2);
    expect(result).toEqual(mockNearby);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('find_closest'), expect.objectContaining({ params: { lat: 1, lng: 2 } }));
  });

  it('getLatestObservations returns latest observations', async () => {
    const mockObs = [{ wave_height: '3.6 ft', peak_period: '18 sec', water_temp: '68.9 °F' }];
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockObs });
    const result = await api.getLatestObservations();
    expect(result).toEqual({ data: mockObs }); // This function does not .then(response => response.data)
    expect(axios.get).toHaveBeenCalled();
  });

  it('getLatestObservation returns latest observation for a location', async () => {
    const mockObs = [{ wave_height: '3.6 ft', peak_period: '18 sec', water_temp: '68.9 °F' }];
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockObs });
    const result = await api.getLatestObservation('loc1');
    expect(result).toEqual(mockObs);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/loc1/latest-observation'));
  });

  it('getSearchResults returns empty array on error', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('fail'));
    const result = await api.getSearchResults({ q: 'test' });
    expect(result).toEqual([]);
  });
}); 