import { ApiResponse, BatchConditionsResponse, CurrentConditions } from '@/types';
import { axios } from '../../../lib/axios';
import { API_ROUTES } from '../../../utils/routing';

export const getConditions = (params: { spot_id?: number; spot_slug?: string }): Promise<ApiResponse<CurrentConditions>> => {
  return axios.get(API_ROUTES.CONDITIONS, { params });
};

export const getBatchConditions = async (spotIds: number[]): Promise<BatchConditionsResponse> => {
  return axios.post(API_ROUTES.BATCH_CONDITIONS, { spot_ids: spotIds })
    .then((response) => response.data)
    .catch((error) => {
      console.error('Failed to fetch batch conditions:', error);
      return { results: [], errors: [] };
    });
};
