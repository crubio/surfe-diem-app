import { describe, it, expect, vi } from 'vitest';
import * as api from '../forecast';
import { axios } from '../../../../lib/axios';

vi.mock('../../../../lib/axios');

describe('forecast API', () => {
  it('getForecastHourly returns data', async () => {
    const mockData = {
      hourly: {
        time: ['2023-01-01T00:00:00Z'],
        swell_wave_height: [2.1],
        swell_wave_period: [10],
        swell_wave_direction: [270],
      },
      hourly_units: { swell_wave_height: 'ft', swell_wave_period: 's', swell_wave_direction: 'deg' },
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });
    const result = await api.getForecastHourly({ latitude: 0, longitude: 0 });
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalled();
  });

  it('getForecastDaily returns data', async () => {
    const mockData = {
      daily: {
        time: ['2023-01-01'],
        wave_height_max: [5.0],
        swell_wave_height_max: [4.2],
        swell_wave_direction_dominant: [270],
        swell_wave_period_max: [12],
      },
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });
    const result = await api.getForecastDaily({ latitude: 0, longitude: 0 });
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalled();
  });

  it('getForecastCurrent returns data', async () => {
    const mockData = {
      current: {
        time: '2023-01-01T00:00:00Z',
        interval: 1,
        swell_wave_height: 4.2,
        swell_wave_direction: 270,
        swell_wave_period: 12,
      },
      current_units: { swell_wave_height: 'ft', swell_wave_direction: 'deg', swell_wave_period: 's' },
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });
    const result = await api.getForecastCurrent({ latitude: 0, longitude: 0 });
    expect(result).toEqual(mockData);
    expect(axios.get).toHaveBeenCalled();
  });
}); 