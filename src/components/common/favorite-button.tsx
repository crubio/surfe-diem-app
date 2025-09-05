import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useFavorites } from '../../providers/favorites-provider';
import { Favorite } from '../../types';

interface FavoriteButtonProps {
  id: string | number; // Accept both string and number, convert to string internally
  type: 'spot' | 'buoy';
  name: string;
  subregion_name?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  showTooltip?: boolean;
  onToggle?: (isFavorited: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  id,
  type,
  name,
  subregion_name,
  latitude,
  longitude,
  location,
  size = 'medium',
  color = 'primary',
  showTooltip = true,
  onToggle,
}) => {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  
  // Convert id to string for consistency
  const stringId = String(id);
  const favorited = isFavorited(stringId, type);

  const handleToggle = () => {
    if (favorited) {
      removeFavorite(stringId, type);
      onToggle?.(false);
    } else {
      const newFavorite: Omit<Favorite, 'addedAt'> = {
        id: stringId,
        type,
        name,
        subregion_name,
        latitude,
        longitude,
        location,
      };
      addFavorite(newFavorite);
      onToggle?.(true);
    }
  };

  const button = (
    <IconButton
      onClick={handleToggle}
      size={size}
      color={color}
      aria-label={favorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      sx={{
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
    >
      {favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={favorited ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
        placement="top"
      >
        {button}
      </Tooltip>
    );
  }

  return button;
}; 