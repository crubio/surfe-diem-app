export const LOCATION_1 = {
  "name": "Station 46269  - Point Santa Cruz, CA (254) ",
  "url": "https://www.ndbc.noaa.gov/station_page.php?station=46269",
  "active": true,
  "description": "Waverider Buoy",
  "depth": "Water depth: 20 m",
  "elevation": "Site elevation: sea level",
  "location": "36.934 N 122.034 W (36°56'4\" N 122°2'2\" W)",
  "location_id": "46269",
  "id": 1,
  "date_created": "2023-06-20T17:19:41.086254",
  "date_updated": "2023-06-20T17:19:41.086254"
}

export const LOCATION_2 = {
  "name": "Station 46276  - Pajaro Beach, CA ",
  "url": "https://www.ndbc.noaa.gov/station_page.php?station=46276",
  "active": true,
  "description": "Waverider Buoy",
  "depth": "Air temp height: 2 m above site elevation",
  "elevation": "Site elevation: sea level",
  "location": "36.845 N 121.825 W (36°50'42\" N 121°49'29\" W)",
  "location_id": "46276",
  "id": 2,
  "date_created": "2023-06-20T17:19:41.086254",
  "date_updated": "2023-06-20T17:19:41.086254"
}

export const LOCATIONS = [LOCATION_1, LOCATION_2];

export const LATEST_OBSERVATION_1 = {
  "id": 19,
  "location_id": "46026",
  "date_created": "2023-07-31T10:36:07.059343",
  "timestamp": "2023-07-31T10:10:00",
  "title": "Station 46026 - SAN FRANCISCO - 18NM West of San Francisco, CA",
  "href": "https://www.ndbc.noaa.gov/station_page.php?station=46026",
  "published": "2023-07-31T17:31:17",
  "wind_speed": "11.7 knots",
  "dominant_wave_period": null,
  "dew_point": null,
  "water_temp": "52.7°F (11.5°C)",
  "mean_wave_direction": null,
  "wind_gust": "15.6 knots",
  "average_period": null,
  "location": "37.754N 122.839W",
  "wind_direction": "NW (320°)",
  "air_temp": null,
  "atmospheric_pressure": "30.04 in (1017.3 mb)",
  "significant_wave_height": null
}

export const LATEST_OBSERVATIONS = [LATEST_OBSERVATION_1];

export const LATEST_SUMMARY_1 = {
  "id": 211,
  "location_id": "46269",
  "timestamp": "2023-07-29T23:00:00",
  "date_created": "2023-07-29T17:08:06.187178",
  "wvht": " 3.0 ft",
  "precipitation": null,
  "wind": null,
  "gust": null,
  "peak_period": " 14 sec",
  "water_temp": " 59.4 °F",
  "swell": " 1.6 ft",
  "period": " 14.3 sec",
  "direction": " SSW",
  "wind_wave": " 2.6 ft",
  "ww_period": " 4.7 sec",
  "ww_direction": " W"
}

export const LATEST_SUMMARIES = [LATEST_SUMMARY_1];