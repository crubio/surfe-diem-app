import { axios } from "lib/axios";


interface TidesQueryParams {
  stationId: string;
}

export interface TidesDataDaily {
  predictions: {
    t: string;
    v: number;
    type: string;
  }[];
}

export const getDailyTides = (params: TidesQueryParams): Promise<any> => {
  return axios.get(`/tides/${params.stationId}`).then((response) => {
    return response.data;
  })
}