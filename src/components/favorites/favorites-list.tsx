import React, { useState } from 'react';
import { Favorite, BuoyBatchData, BatchConditionsResult } from '../../types';
import { Item } from '../layout/item';
import { LinkRouter } from '../common/link-router';
import { Typography, Box, Collapse, IconButton, useTheme } from '@mui/material';
import { goToSpotPage, goToBuoyPage } from '../../utils/routing';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { getSwellDirectionText } from 'utils/swell';
import { getDisplaySwell } from 'utils/swell-power';
import { metersToFeet } from 'utils/nws-parser';

interface FavoritesListProps {
  favorites: Favorite[];
  currentData?: {
    buoys?: BuoyBatchData[];
    /** /batch-conditions results, same data as the dashboard's spot cards */
    spots?: BatchConditionsResult[];
  };
}

interface FavoriteItemProps {
  favorite: Favorite;
  currentData?: BuoyBatchData | BatchConditionsResult;
  type: 'spot' | 'buoy';
}

const FavoriteItem: React.FC<FavoriteItemProps> = ({ favorite, currentData, type }) => {
  const theme = useTheme();

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
          <Typography variant="body1" color="text.primary" sx={{ fontSize: { xs: '0.8rem', sm: '1.2rem', fontWeight: "bold" } }}>
            {swellData && swellData.swell_height && `${swellData.swell_height}`}
            {swellData && swellData.period && ` • ${swellData.period}s`}
            {swellData && swellData.direction && ` • ${swellData.direction}`}
          </Typography>
        </Box>
      );
    } else {
      // NWS primary swell, else the buoy's, same as the dashboard cards
      const conditions = (currentData as BatchConditionsResult).conditions;
      const swell = conditions ? getDisplaySwell(conditions) : null;
      if (!swell) return null;

      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body1" color="text.primary" sx={{ fontSize: { xs: '0.8rem', sm: '1.2rem', fontWeight: "bold" } }}>
            {`${metersToFeet(swell.heightM).toFixed(1)}ft`}
            {swell.periodS != null && ` • ${Math.round(swell.periodS)}s`}
            {swell.direction != null && ` • ${getSwellDirectionText(swell.direction)}`}
          </Typography>
        </Box>
      );
    }
  };

  const linkTo = type === 'spot' 
    ? goToSpotPage(favorite.id as number)
    : goToBuoyPage(favorite.id as string);

  const getTypeColor = () => {
    return type === 'spot' ? theme.palette.primary.main : theme.palette.secondary.main;
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

const ITEMS_PER_ROW = 5;

export const FavoritesList: React.FC<FavoritesListProps> = ({
  favorites,
  currentData,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showMore, setShowMore] = useState(false);

  const firstRowItems = favorites.slice(0, ITEMS_PER_ROW);
  const remainingItems = favorites.slice(ITEMS_PER_ROW);
  const hasMore = favorites.length > ITEMS_PER_ROW;

  const resolveData = (favorite: Favorite) => {
    if (favorite.type === 'spot') {
      return currentData?.spots?.find((s) => String(s.spot_id) === String(favorite.id));
    }
    return currentData?.buoys?.find((b) => String(b.id) === String(favorite.id));
  };

  const renderItems = (items: Favorite[]) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: { xs: 1, sm: 2 } }}>
      {items.map((favorite) => (
        <Box key={`${favorite.type}-${favorite.id}`}>
          <FavoriteItem
            favorite={favorite}
            currentData={resolveData(favorite)}
            type={favorite.type as 'spot' | 'buoy'}
          />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ mt: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          My lineup
        </Typography>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          size="small"
          aria-label={expanded ? 'Collapse my lineup' : 'Expand my lineup'}
          sx={{ color: 'primary.main', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {favorites.length === 0
          ? 'No favorites yet — add spots and buoys from their detail pages.'
          : `${favorites.length} spot${favorites.length !== 1 ? 's' : ''} and buoy${favorites.length !== 1 ? 's' : ''} saved`}
      </Typography>

      <Collapse in={expanded} timeout="auto">
        {renderItems(firstRowItems)}
        {hasMore && (
          <>
            <Collapse in={showMore} timeout="auto">
              <Box sx={{ mt: 2 }}>
                {renderItems(remainingItems)}
              </Box>
            </Collapse>
            <Box sx={{ mt: 1, textAlign: 'right' }}>
              <IconButton
                onClick={() => setShowMore(!showMore)}
                size="small"
                aria-label={showMore ? 'Show fewer favorites' : 'Show more favorites'}
                sx={{
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                }}
              >
                {showMore ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </>
        )}
      </Collapse>
    </Box>
  );
}; 