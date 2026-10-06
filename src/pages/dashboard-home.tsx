import sharks from "assets/sharks1.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLocations, getSurfSpots, getBatchForecast, getSurfSpotClosest } from "@features/locations/api/locations";
import { SEO, LocationPrompt, PageContainer, ContentWrapper } from "components";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "types/api";
import { Spot, Buoy } from "types/core";
import { useFavorites } from "../providers/favorites-provider";
import { FavoritesList } from "../components/favorites/favorites-list";
import { orderBy } from "lodash";
import { useEffect, useState } from "react";
import { trackPageView, trackInteraction } from "utils/analytics";
import { getHomePageVariation } from "utils/ab-testing";
import { getBatchRecommendationsFromAPI } from "utils/conditions";
import { getLatestTideReading } from "utils/tides";
import { formatNoaaTime12h } from "@features/tides/utils";
import { getZoneAbbreviation } from "utils/timezone";
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


const DashboardHome = () => {
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const variation = getHomePageVariation();
  // Track page view on mount
  useEffect(() => {
    trackPageView(variation, 'dashboard-home');
  }, [variation]);

  const {location, source, isLoading, error, hasPermission} = useUserLocation();

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
  const highestWaves = batchRecommendations?.highestWaves || null;
  const locationSpotsError = isClosestSpotsError || isBatchError;

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
  const currentSwellData = closestSpotRawConditions ? {
    primarySwellHeight: metersToFeet(closestSpotRawConditions.primary_swell_height ?? 0),
    primarySwellDirection: closestSpotRawConditions.primary_swell_direction ?? 0,
    primarySwellPeriod: closestSpotRawConditions.primary_swell_period ?? 0,
    secondarySwellHeight: metersToFeet(closestSpotRawConditions.secondary_swell_height ?? 0),
  } : null;
  
  // Fetch current data for favorites - Updated to React Query v5 object syntax
  const {data: favoritesData, isPending: favoritesLoading} = useQuery({
    queryKey: ['favorites-batch-data', favorites.length > 0 ? favorites.map(f => `${f.type}-${f.id}`).join(',') : 'empty'],
    queryFn: () => {
      if (favorites.length === 0) return { buoys: [], spots: [] };
      
      const buoyIds = favorites.filter(f => f.type === 'buoy').map(f => String (f.id));
      const spotIds = favorites.filter(f => f.type === 'spot').map(f => Number(f.id));
      
      return getBatchForecast({
        buoy_ids: buoyIds.length > 0 ? buoyIds : undefined,
        spot_ids: spotIds.length > 0 ? spotIds : undefined,
      });
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
    } else {
      <LocationPrompt />
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
            isLoading={favoritesLoading}
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
                heightValue={data?.waveHeightValue}
                speedValue={data?.windSpeedValue}
                waveDirection={data?.waveDirectionFormatted || undefined}
                wavePeriod={data?.wavePeriodFormatted || undefined}
                description={data?.score?.description}
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
            columns={GRID_CONFIGS.CURRENT_CONDITIONS_NEARBY}
          >
            {/* TODO: Refactor this card or make a new one */}
            <DashboardCard
              isLoading={isBatchLoading || isClosestSpotsLoading}
              isError={isBatchError || isClosestSpotsError || (!isBatchLoading && !isClosestSpotsLoading && !currentSwellData)}
              title="Primary swell"
              name={''}
              score={currentSwellData ? {
                label: getSwellQualityDescription(currentSwellData.primarySwellHeight),
                color: getSwellHeightColor(currentSwellData.primarySwellHeight),
                description: `${formatSwellPeriod(currentSwellData.primarySwellPeriod)} period from ${getSwellDirectionText(currentSwellData.primarySwellDirection)}`
              } : undefined}
              subtitle={currentSwellData ? formatSwellHeight(currentSwellData.primarySwellHeight)  : undefined}
              heightValue={currentSwellData?.primarySwellHeight}
              waveDirection={currentSwellData ? getSwellDirectionText(currentSwellData.primarySwellDirection) : undefined}
              wavePeriod={currentSwellData ? formatSwellPeriod(currentSwellData.primarySwellPeriod) : undefined}
            />
            
            <DashboardCard
              isLoading={tidesLoading}
              isError={tidesError || isClosestSpotsError}
              title="Current tide"
              name={currentTideValue != null ? `${currentTideValue.toFixed(1)}ft` : ''}
              score={{ label: currentTideTime || 'Loading...', color: 'info', description: currentTideTime ? `${tideIsPredicted ? 'predicted' : 'as of'} ${currentTideTime}` : 'recent reading' }}
              description={closestTideStation ? `${tideIsPredicted ? 'Predicted for' : 'Reported from'} ${closestTideStation.name} (${closestTideStation.station_id})` : undefined}
              heightValue={currentTideValue !== null ? currentTideValue : undefined}
            />
            
            {/* Water Temperature card - TODO: Add water temp extraction to NWS parser
            <DashboardCard
              isLoading={isForecastLoading}
              isError={isForecastError || isClosestSpotsError}
              title="Water temperature"
              name={waterTemp ? `${waterTemp}°F` : 'N/A'}
              score={waterTemp ? {
                label: waterTemp >= 70 ? 'Warm' : waterTemp >= 60 ? 'Moderate' : 'Cold',
                color: waterTemp >= 70 ? 'error' : waterTemp >= 60 ? 'warning' : 'info',
                description: `Water temperature`
              } : undefined}
              description={waterTemp ? `Current water temp: ${waterTemp}°F` : 'Temperature data pending'}
            />
            */}
            
            <DashboardCard
              isLoading={isBatchLoading}
              isError={isBatchError || isClosestSpotsError || (!isBatchLoading && !isClosestSpotsLoading && !highestWaves)}
              title="Highest waves"
              name={highestWaves && typeof highestWaves.waveHeight === 'string' ? highestWaves.waveHeight : ''}
              subtitle={highestWaves ? `${highestWaves.spot} • ${highestWaves.conditions}` : ''}
              heightValue={highestWaves?.waveHeightValue}
              onClick={() => {
                if (highestWaves?.slug) {
                  navigate(`/spot/${highestWaves.slug}`);
                }
              }}
              score={highestWaves?.score
                ? {...highestWaves.score, description: highestWaves.score.description || (highestWaves.waveHeightValue && highestWaves.waveHeightValue >= 6 ? 'Experienced surfers only' : 'Good waves available')}
                : undefined
              }
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