import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBatchForecast } from '../../features/locations/api/locations';
import { Favorite } from '../../types/favorites';
import { BuoyBatchData, SpotBatchData } from '../../features/locations/types';
import { Item } from '../layout/item';
import { LinkRouter } from '../common/link-router';
import { Stack, Typography, Box, Chip, Button } from '@mui/material';
import { FavoriteButton } from '../common/favorite-button';
import { goToSpotPage, goToBuoyPage } from '../../utils/routing';
import { getFavoriteDisplayLocation } from '../../utils/favorites';

interface FavoritesListProps {
  favorites: Favorite[];
  currentData?: {
    buoys?: BuoyBatchData[];
    spots?: SpotBatchData[];
  };
  isLoading?: boolean;
}

interface FavoriteItemProps {
  favorite: Favorite;
  currentData?: BuoyBatchData | SpotBatchData;
  type: 'spot' | 'buoy';
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({ favorite, currentData, type }) => {
  
  /**
   * Get current conditions based on type and data structure
   */
  const getConditions = () => {
    if (!currentData) return null;
    
    if (type === 'buoy') {
      // Type guard for buoy data
      const buoyData = currentData as BuoyBatchData;
      const observation = buoyData.observation;
      if (!observation || !Array.isArray(observation)) return null;
      
      // Get swell data (index 1)
      const swellData = observation[1]; // Swell observation
      
      return (
                  <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              {swellData && swellData.swell_height && `${swellData.swell_height}`}
              {swellData && swellData.period && ` • ${swellData.period}s`}
              {swellData && swellData.direction && ` • ${swellData.direction}`}
            </Typography>
          </Box>
      );
    } else {
      // Type guard for spot data
      const spotData = currentData as SpotBatchData;
      const weather = spotData.weather;
      if (!weather || !weather.swell) return null;
      
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              {weather.swell.height && `${weather.swell.height.toFixed(1)}ft`}
              {weather.swell.period && ` • ${weather.swell.period.toFixed(1)}s`}
              {weather.swell.direction && ` • ${weather.swell.direction}°`}
            </Typography>
          </Box>
        );
    }
  };

  const linkTo = type === 'spot' 
    ? goToSpotPage(favorite.id)
    : goToBuoyPage(favorite.id);

  return (
    <Item sx={{ 
      padding: '16px', 
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip 
            label={type === 'spot' ? 'Spot' : 'Buoy'} 
            size="small" 
            color={type === 'spot' ? 'primary' : 'secondary'}
            variant="outlined"
          />
          <Typography variant="h6" component="div">
            <LinkRouter to={linkTo} style={{ textDecoration: 'none', color: 'inherit' }}>
              {favorite.name}
            </LinkRouter>
          </Typography>
        </Box>
        
        {favorite.subregion_name && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {favorite.subregion_name}
          </Typography>
        )}
        
        {getConditions()}
      </Box>
    </Item>
  );
};

export const FavoritesList: React.FC<FavoritesListProps> = ({ 
  favorites, 
  currentData, 
  isLoading 
}) => {
  if (favorites.length === 0) {
    return null;
  }

  // Separate favorites by type
  const spotFavorites = favorites.filter(f => f.type === 'spot');
  const buoyFavorites = favorites.filter(f => f.type === 'buoy');

  return (
    <Box sx={{ mt: 3 }}>
              <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          My Lineup
        </Typography>
      
      {isLoading && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Loading current conditions...
        </Typography>
      )}
      
      <Stack spacing={2}>
        {spotFavorites.length > 0 && (
          <Box>
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Surf Spots ({spotFavorites.length})
            </Typography>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ overflowX: "auto", padding: "10px", width: "fit-content" }}>
              {spotFavorites.map((favorite) => (
                <FavoriteItem
                  key={`spot-${favorite.id}`}
                  favorite={favorite}
                  currentData={currentData?.spots?.find(s => s.id.toString() === favorite.id)}
                  type="spot"
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {buoyFavorites.length > 0 && (
          <Box>
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Buoys ({buoyFavorites.length})
            </Typography>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'column', md: 'row' }} sx={{ overflowX: "auto", padding: "10px", width: "fit-content" }}>
              {buoyFavorites.map((favorite) => (
                <FavoriteItem
                  key={`buoy-${favorite.id}`}
                  favorite={favorite}
                  currentData={currentData?.buoys?.find(b => b.id.toString() === favorite.id)}
                  type="buoy"
                />
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}; 