import sharks from "assets/sharks1.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast, getSurfSpotClosest } from "@features/locations/api/locations";
import { SEO, LocationPrompt, PageContainer, ContentWrapper } from "components";
import { Helmet } from "react-helmet-async";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "types/api";
import { Spot, Buoy } from "types/core";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useEffect } from "react";
import { trackPageView, trackInteraction } from "utils/analytics";
import { getHomePageVariation } from "utils/ab-testing";
import { getBatchRecommendationsFromAPI } from "utils/conditions";
import { getLatestTideReading } from "utils/tides";
import { formatNoaaTime12h } from "@features/tides/utils";
import { getZoneAbbreviation, formatLocationTime } from "utils/timezone";
import { getDisplaySwell, formatSwellPower, getSwellPowerBand } from "utils/swell-power";
import { SwellPowerInfo, getBatchConditions } from "@features/conditions";
import { useNearbyTideStation, useTideRecent } from "hooks";
import { TIDE_STATION_MAX_MILES } from "utils/constants";
import { getSwellQualityDescription, getSwellDirectionText, getSwellHeightColor, formatSwellHeight, formatSwellPeriod } from "utils/swell";
import HeroSection from "components/common/hero";
import HeroWidget from "components/common/hero-widget";
import DashboardCard from "@features/cards/dashboard-card";
import SearchCard from "@features/cards/search-select";
import { DashboardGrid, GRID_CONFIGS } from "@features/dashboard";
import { useGeolocationStore, useUserLocation } from "../stores/geolocation-store";
import { metersToFeet } from "utils/nws-parser";
import { formatTemperature } from "utils/formatting";
import { getWaterTempQualityDescription, getWaterTempColor, getWaterTempComfortLevel } from "utils/water-temp";


/** "8 mph wind", or undefined when there's no reading so the card omits the line. */
const formatWind = (mph: number | undefined) => (mph != null ? `${mph} mph wind` : undefined);

const DashboardHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  // Track page view on mount
  useEffect(() => {
    trackPageView(variation, 'dashboard-home');
  }, [variation]);

  const {location} = useUserLocation();

  useEffect(() => {
    useGeolocationStore.getState();
    if (useGeolocationStore.getState().location === undefined && !useGeolocationStore.getState().isLoading) {
      useGeolocationStore.getState().requestGeolocation();
    }
  }, []);

  // List of all location metadata
  const {data: buoysResponse} = useQuery<ApiResponse<Buoy[]>>({
    queryKey: ['locations'],
    queryFn: async () => getLocations()
  });
  
  const buoys = buoysResponse?.status === 'success' ? buoysResponse.data : [];
  
  // List of all surf spots metadata
  const {data: spotsResponse} = useQuery<ApiResponse<Spot[]>>({
    queryKey: ['spots'],
    queryFn: async () => getSurfSpots()
  });
  
  const spots = spotsResponse?.status === 'success' ? spotsResponse.data : [];
  
  // Users geolocation from Zustand store
  const coordinates = location?.coordinates;

  // List of closest spots to user's geolocation if available
  const {data: closestSpots, isLoading: isClosestSpotsLoading, isError: isClosestSpotsError} = useQuery({
    queryKey: ['closest_spots', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => getSurfSpotClosest(coordinates!.latitude, coordinates!.longitude),
    enabled: !!coordinates?.latitude && !!coordinates?.longitude,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Get batch conditions from nearby spots — one call backs the recommendation
  // cards AND the "closest to you" / "primary swell" cards below (bySpotId).
  const {data: batchRecommendations, isLoading: isBatchLoading, isError: isBatchError} = useQuery({
    queryKey: ['batch_recommendations', closestSpots?.map(s => s.id).join(',')],
    queryFn: () => getBatchRecommendationsFromAPI(closestSpots!.map(spot => ({
      ...spot,
      distance: spot.distance ? `${spot.distance} miles` : undefined
    }))),
    enabled: !!closestSpots && closestSpots.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Extract individual results from batch
  const bestConditions = batchRecommendations?.bestConditions || null;
  const cleanestConditions = batchRecommendations?.cleanestConditions || null;
  const mostPowerful = batchRecommendations?.mostPowerful || null;

  // Closest Tide Explorer station to the user, same distance guard as the spot page
  const {data: closestTideStation, isLoading: isTideStationLoading, isError: isTideStationError} =
    useNearbyTideStation(coordinates?.latitude, coordinates?.longitude);
  const tideStationInRange = !!closestTideStation && closestTideStation.distance <= TIDE_STATION_MAX_MILES;

  // Recent tide series: observed water level, or interpolated predictions for
  // stations without a sensor (meta.product says which)
  const {data: recentTides, isLoading: isRecentTidesLoading, isError: isRecentTidesError} =
    useTideRecent(tideStationInRange ? closestTideStation.station_id : undefined);
  const tidesLoading = isTideStationLoading || isRecentTidesLoading;
  const tidesError = isTideStationError || isRecentTidesError || (!!closestTideStation && !tideStationInRange);
  const tideIsPredicted = recentTides?.meta.product === 'predictions';

  // Series times are station-local; read them in the closest spot's zone, else the viewer's
  const tideTimezone = closestSpots?.[0]?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const latestTide = getLatestTideReading(recentTides?.data, new Date(), tideTimezone);
  const currentTideValue = latestTide?.height ?? null;
  const currentTideTime = latestTide ? `${formatNoaaTime12h(latestTide.t)} ${getZoneAbbreviation(tideTimezone)}` : null;

  // Closest spot's raw conditions, from the same batch call
  const closestSpotRawConditions = closestSpots?.[0]
    ? batchRecommendations?.bySpotId[closestSpots[0].id]?.conditions
    : undefined;
  // Buoy-only (°C); null when the closest spot's nearest buoy doesn't report it
  const waterTempC = closestSpotRawConditions?.water_temperature ?? null;

  // NWS primary swell, else the buoy's (same order the API used for swell power)
  const displaySwell = closestSpotRawConditions ? getDisplaySwell(closestSpotRawConditions) : null;
  const currentSwellData = displaySwell ? {
    primarySwellHeight: metersToFeet(displaySwell.heightM),
    primarySwellDirection: displaySwell.direction ?? 0,
    primarySwellPeriod: displaySwell.periodS ?? 0,
  } : null;
  const closestSwellPower = closestSpotRawConditions?.swell_power ?? null;
  const closestSwellPowerLabel = formatSwellPower(closestSwellPower);
  // "Measured at buoy 46211 · 2:56 PM PDT" when the swell shown is a buoy reading
  const closestSwellAttribution = displaySwell?.station
    ? `Measured at buoy ${displaySwell.station}${
        displaySwell.observedAt && closestSpots?.[0]
          ? ` · ${formatLocationTime(displaySwell.observedAt, closestSpots[0].timezone)}`
          : ''
      }`
    : null;
  
  // Fetch current data for favorites - Updated to React Query v5 object syntax
  const {data: favoritesData} = useQuery({
    queryKey: ['favorites-batch-data', favorites.length > 0 ? favorites.map(f => `${f.type}-${f.id}`).join(',') : 'empty'],
    queryFn: async () => {
      if (favorites.length === 0) return { buoys: [], spots: [] };
      
      const buoyIds = favorites.filter(f => f.type === 'buoy').map(f => String (f.id));
      const spotIds = favorites.filter(f => f.type === 'spot').map(f => Number(f.id));
      
      // Spots: /batch-conditions (NWS + buoy, same as the cards above; capped
      // at 25 ids per call). Buoys: their NDBC observations from /batch-forecast.
      const spotChunks = Array.from({ length: Math.ceil(spotIds.length / 25) }, (_, i) => spotIds.slice(i * 25, i * 25 + 25));
      const [buoyData, ...spotBatches] = await Promise.all([
        buoyIds.length > 0 ? getBatchForecast({ buoy_ids: buoyIds }) : Promise.resolve({ buoys: [], spots: [] }),
        ...spotChunks.map((chunk) => getBatchConditions(chunk)),
      ]);
      return { buoys: buoyData.buoys, spots: spotBatches.flatMap((batch) => batch.results) };
    },
    enabled: favorites.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
  });

  // Navigation functions with tracking
  const goToBuoyPage = (location_id: string) => {
    trackInteraction(variation, 'buoy_click', { location_id });
    navigate(`/location/${location_id}`);
  };

  const goToSpotPage = (spot_id: string) => {
    const spot = spots?.find((s: Spot) => s.id.toString() === spot_id);
    trackInteraction(variation, 'spot_click', { spot_id, spot_name: spot?.name });
    if (spot?.slug) {
      navigate(`/spot/${spot.slug}`);
    } else {
      navigate(`/spot/${spot_id}`);
    }
  };

  // Helper function to get closest spot
  const getClosestSpot = () => {
    // If we have geolocation, show closest spot
    if (coordinates?.latitude && coordinates?.longitude && closestSpots && closestSpots.length > 0) {
      // Use actual closest spot data
      const closestSpot = closestSpots[0]; // API returns sorted by distance, first is the closest

      const closestResult = batchRecommendations?.bySpotId[closestSpot.id]?.conditionResult;
      if (closestResult) {
        return { ...closestResult, isLocationBased: true };
      }
    }
  };

  // Move getClosestSpot call out of JSX
  const closestSpotData = getClosestSpot();

  // Map loading/error states to recommendation keys for granular control
  const recommendationStates = {
    best: { isLoading: isBatchLoading || isClosestSpotsLoading, isError: isBatchError },
    closest: { isLoading: isBatchLoading || isClosestSpotsLoading, isError: isBatchError || isClosestSpotsError },
    cleanest: { isLoading: isBatchLoading || isClosestSpotsLoading, isError: isBatchError }
  };

  const recommendations = [
    { key: 'best', title: 'Best right now', data: bestConditions },
    { key: 'closest', title: 'Closest to you', data: closestSpotData },
    { key: 'cleanest', title: 'Cleanest conditions', data: cleanestConditions }
  ];

  return (
    <>
      <SEO title="Surfe Diem - What's the surf like now?" />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Surfe Diem",
            "description": "Real-time surf conditions and current forecasts",
            "url": "https://surfe-diem.com"
          })}
        </script>
      </Helmet>
      
      {/* Hero Section */}
      <HeroSection
        image={sharks}
        widget={
          bestConditions && cleanestConditions && closestSpotData && currentTideValue != null ? (
          <HeroWidget
            rows={[
              {
                label: 'Best right now',
                spot: bestConditions?.spot,
                value: bestConditions?.waveHeight ?? '—',
                score: bestConditions?.score,
              },
              {
                label: 'Cleanest',
                spot: cleanestConditions?.spot,
                value: cleanestConditions?.waveHeight ?? '—',
                score: cleanestConditions?.score,
              },
              {
                label: 'Closest to you',
                spot: closestSpotData?.spot,
                value: closestSpotData?.waveHeight ?? '—',
                score: closestSpotData?.score,
              },
              {
                label: 'Current tide',
                value: currentTideValue != null ? `${currentTideValue.toFixed(1)}ft` : '—',
              },
            ]}
          />
          ) : null
        }
      />

      <PageContainer
        maxWidth="XL"
        padding="MEDIUM"
        marginTop={{ xs: 1, sm: 0 }}
      >
        {/* My Lineup (Favorites) - First row of content */}
        <ContentWrapper>
          <FavoritesList 
            favorites={favorites}
            currentData={favoritesData}
          />
        </ContentWrapper>
        {/* Current Conditions Dashboard */}
        <DashboardGrid 
          title="Today's picks"
          subtitle="Recommendations"
          showSubtitle={true}
          columns={GRID_CONFIGS.RECOMMENDATIONS}
          showDivider={true}
        >
          {recommendations.map(({ key, title, data }) => (
            !coordinates ? (
              <LocationPrompt key={key} />
            ) : (
              <DashboardCard
                key={key}
                isLoading={recommendationStates[key as keyof typeof recommendationStates].isLoading}
                isError={recommendationStates[key as keyof typeof recommendationStates].isError || !data}
                title={title}
                name={data?.spot || ''}
                subtitle={data?.waveHeight || ''}
                score={data?.score}
                waveDirection={data?.waveDirectionFormatted || undefined}
                wavePeriod={data?.wavePeriodFormatted || undefined}
                wind={formatWind(data?.windSpeedValue)}
                inverted={key === 'best'}
                onClick={() => data?.slug && navigate(`/spot/${data.slug}`)}
              />
            )
          ))}
        </DashboardGrid>

        {/* Current Conditions Section */}
        {coordinates && (
          <DashboardGrid 
            title="Near your location"
            showSubtitle={true}
            columns={GRID_CONFIGS.CURRENT_CONDITIONS}
          >
            {/* TODO: Refactor this card or make a new one */}
            <DashboardCard
              isLoading={isBatchLoading || isClosestSpotsLoading}
              isError={isBatchError || isClosestSpotsError || (!isBatchLoading && !isClosestSpotsLoading && !currentSwellData)}
              title="Primary swell"
              name={''}
              score={currentSwellData ? {
                label: getSwellQualityDescription(currentSwellData.primarySwellPeriod),
                color: getSwellHeightColor(currentSwellData.primarySwellHeight),
                description: `${formatSwellPeriod(currentSwellData.primarySwellPeriod)} period from ${getSwellDirectionText(currentSwellData.primarySwellDirection)}`
              } : undefined}
              subtitle={currentSwellData ? formatSwellHeight(currentSwellData.primarySwellHeight)  : undefined}
              waveDirection={currentSwellData ? getSwellDirectionText(currentSwellData.primarySwellDirection) : undefined}
              wavePeriod={currentSwellData ? formatSwellPeriod(currentSwellData.primarySwellPeriod) : undefined}
            >
              {closestSwellPowerLabel && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                  <Typography variant="body1">
                    <Box component="span" sx={{ fontWeight: 700 }}>{getSwellPowerBand(closestSwellPower)?.label}</Box>
                    {' '}swell power · {Math.round(closestSwellPower ?? 0).toLocaleString('en-US')}
                  </Typography>
                  <SwellPowerInfo
                    power={closestSwellPower}
                    heightM={displaySwell?.heightM}
                    periodS={displaySwell?.periodS}
                    totalPower={closestSpotRawConditions?.total_power}
                  />
                </Box>
              )}
              {closestSwellAttribution && (
                <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                  {closestSwellAttribution}
                </Typography>
              )}
            </DashboardCard>
            
            <DashboardCard
              isLoading={tidesLoading}
              isError={tidesError || isClosestSpotsError}
              title="Current tide"
              name={currentTideValue != null ? `${currentTideValue.toFixed(1)}ft` : ''}
              score={{ label: currentTideTime || 'Loading...', color: 'info', description: currentTideTime ? `${tideIsPredicted ? 'predicted' : 'as of'} ${currentTideTime}` : 'recent reading' }}
              description={closestTideStation ? `${tideIsPredicted ? 'Predicted for' : 'Reported from'} ${closestTideStation.name} (${closestTideStation.station_id})` : undefined}
            />
            
            <DashboardCard
              isLoading={isBatchLoading || isClosestSpotsLoading}
              isError={isBatchError || isClosestSpotsError || (!isBatchLoading && !isClosestSpotsLoading && waterTempC == null)}
              title="Water temperature"
              name={waterTempC != null ? formatTemperature(waterTempC) : ''}
              score={waterTempC != null ? {
                label: getWaterTempQualityDescription(waterTempC),
                color: getWaterTempColor(waterTempC),
              } : undefined}
              description={waterTempC != null && closestSpots?.[0]
                ? `${getWaterTempComfortLevel(waterTempC)} · nearest buoy to ${closestSpots[0].name}`
                : undefined}
            />
            
            <DashboardCard
              isLoading={isBatchLoading}
              isError={isBatchError || isClosestSpotsError || (!isBatchLoading && !isClosestSpotsLoading && !mostPowerful)}
              title="Most powerful swell"
              name={mostPowerful?.waveHeight ?? ''}
              subtitle={mostPowerful
                ? `${mostPowerful.spot} • ${getSwellPowerBand(mostPowerful.swellPower)?.label ?? ''} swell power`
                : ''}
              wind={formatWind(mostPowerful?.windSpeedValue)}
              onClick={() => {
                if (mostPowerful?.slug) {
                  navigate(`/spot/${mostPowerful.slug}`);
                }
              }}
              score={mostPowerful?.score}
            />
          </DashboardGrid>
        )}

        {/* Search Sections */}
        <DashboardGrid 
          title="Search"
          columns={GRID_CONFIGS.SEARCH}
          marginTop={0}
        >
          <SearchCard
            label="Find a buoy"
            items={buoys && buoys.length > 0 ? orderBy(buoys, ["name"], ["asc"]) : []}
            selectValueKey="location_id"
            doOnSelect={goToBuoyPage}
            type="buoy"
            placeholder="Search buoys..."
          />
          <SearchCard
            label="Find a spot"
            items={spots ? orderBy(spots, ["subregion_name", "name"], ["asc"]) : []}
            selectValueKey="id"
            doOnSelect={goToSpotPage}
            type="spot"
            placeholder="Search surf spots..."
          />
        </DashboardGrid>

      </PageContainer>
    </>
  );
};

export default DashboardHome; 