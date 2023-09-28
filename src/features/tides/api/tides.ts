import { axios } from "lib/axios";
import { API_ROUTES } from "utils/routing";

// TODO: TBD params for more specific queries
interface TidesQueryParams {
  station?: string;
}

export interface TidesDataDaily {
  predictions: {
    t: string;
    v: number;
    type: string;
  }[];
}

export const getDailyTides = (params: TidesQueryParams): Promise<TidesDataDaily> => {
  return axios.get(API_ROUTES.TIDES_URL, {
    params: params
  }).then((response) => {
    return response.data;
  })
}