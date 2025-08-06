import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBatchForecast } from '../../features/locations/api/locations';
import { Favorite } from '../../types/favorites';
import { BuoyBatchData, SpotBatchData } from '../../features/locations/types';
import { Item } from '../layout/item';
import { LinkRouter } from '../common/link-router';
import { Stack, Typography, Box, Chip, Button, Grid, Collapse, IconButton } from '@mui/material';
import { FavoriteButton } from '../common/favorite-button';
import { goToSpotPage, goToBuoyPage } from '../../utils/routing';
import { getFavoriteDisplayLocation } from '../../utils/favorites';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

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
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
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
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
            {weather.swell.height && `${weather.swell.height.toFixed(1)}ft`}
            {weather.swell.period && ` • ${weather.swell.period.toFixed(1)}s`}
            {weather.swell.direction && ` • ${weather.swell.direction}°`}
          </Typography>
        </Box>
      );
    }
  };

  const linkTo = type === 'spot' 
    ? goToSpotPage(favorite.id, (currentData as any)?.slug)
    : goToBuoyPage(favorite.id);

  // Color coding for spots vs buoys
  const getTypeColor = () => {
    return type === 'spot' ? '#1ed6e6' : '#f06292'; // Primary blue for spots, secondary pink for buoys
  };

  return (
    <Item sx={{ 
      padding: { xs: '12px', sm: '16px' }, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderLeft: `4px solid ${getTypeColor()}`,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }
    }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.125rem' },
              fontWeight: 600
            }}
          >
            <LinkRouter to={linkTo} style={{ textDecoration: 'none', color: 'inherit' }}>
              {favorite.name}
            </LinkRouter>
          </Typography>
        </Box>
        
        {favorite.subregion_name && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' }
            }}
          >
            {favorite.subregion_name}
          </Typography>
        )}
        
        {getConditions()}
      </Box>
    </Item>
  );
};

const FavoriteSection: React.FC<{
  title: string;
  favorites: Favorite[];
  currentData?: BuoyBatchData[] | SpotBatchData[];
  type: 'spot' | 'buoy';
  itemsPerRow?: number;
}> = ({ title, favorites, currentData, type, itemsPerRow = 5 }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (favorites.length === 0) return null;
  
  const hasMoreThanFirstRow = favorites.length > itemsPerRow;
  const firstRowItems = favorites.slice(0, itemsPerRow);
  const remainingItems = favorites.slice(itemsPerRow);
  
  const renderFavoriteItems = (items: Favorite[]) => (
    <Grid container spacing={{ xs: 1, sm: 2 }}>
      {items.map((favorite) => (
        <Grid item xs={12} sm={6} md={2.4} key={`${type}-${favorite.id}`}>
          <FavoriteItem
            favorite={favorite}
            currentData={(() => {
              if (!currentData) return undefined;
              return (currentData as any[]).find((item: any) => 
                type === 'spot' 
                  ? item.id.toString() === favorite.id
                  : item.id.toString() === favorite.id
              );
            })()}
            type={type}
          />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            fontWeight: 600
          }}
        >
          {title} ({favorites.length})
        </Typography>
        {hasMoreThanFirstRow && (
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
            sx={{ 
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>
      
      {/* First row - always visible */}
      {renderFavoriteItems(firstRowItems)}
      
      {/* Remaining items - collapsible */}
      {hasMoreThanFirstRow && (
        <Collapse in={expanded} timeout="auto">
          <Box sx={{ mt: 2 }}>
            {renderFavoriteItems(remainingItems)}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export const FavoritesList: React.FC<FavoritesListProps> = ({ 
  favorites, 
  currentData, 
  isLoading 
}) => {

  // Separate favorites by type
  const spotFavorites = favorites.filter(f => f.type === 'spot');
  const buoyFavorites = favorites.filter(f => f.type === 'buoy');

  return (
    <Box sx={{ mt: 3 }}>
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
          mb: 2,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 700
        }}
      >
        My Lineup
      </Typography>
      
      {isLoading && favorites.length > 0 && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Loading current conditions...
        </Typography>
      )}

      {favorites.length === 0 && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          No favorites in your quiver yet. Add some to get quick surf conditions for your favorite spots and buoys.
        </Typography>
      )}
      
      <Stack spacing={3}>
        <FavoriteSection
          title="Surf Spots"
          favorites={spotFavorites}
          currentData={currentData?.spots}
          type="spot"
          itemsPerRow={5}
        />
        
        <FavoriteSection
          title="Buoys"
          favorites={buoyFavorites}
          currentData={currentData?.buoys}
          type="buoy"
          itemsPerRow={5}
        />
      </Stack>
    </Box>
  );
}; 