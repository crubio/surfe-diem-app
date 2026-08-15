import React from 'react';
import { Dialog, DialogTitle, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { LocationOn, Support } from '@mui/icons-material';
import { BuoyLocation, Spot } from '../../types';

export interface SimpleDialogProps<T> {
  results?: Record<string, T>[];
  open: boolean;
  searchTerm?: string;
  onClose: () => void;
}

export function SearchResultsDialog<T>(props: SimpleDialogProps<T>) {
  const navigate = useNavigate();
  const { onClose, searchTerm, open, results } = props;

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (href: string) => {
    onClose();
    navigate(href)
  };

  const renderResultItem = (item: Spot | BuoyLocation) => {
    if ('location_id' in item) {
      return (
        <ListItem disableGutters>
          <ListItemButton onClick={() => handleListItemClick(`/location/${item.location_id}`)}>
            <Support sx={{marginRight: '10px'}} /><ListItemText primary={item.name} />
          </ListItemButton>
        </ListItem>
      )
    } else {
      return (
        <ListItem disableGutters>
          <ListItemButton onClick={() => handleListItemClick(`/spot/${item.slug || item.id}`)}>
            <LocationOn sx={{marginRight: '10px'}} /><ListItemText primary={item.name} />
          </ListItemButton>
        </ListItem>
      )
    }
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Search results for "{searchTerm}"</DialogTitle>
      {results && results.length > 0 && results.map((item) => {
        const typedItem = item as unknown as Spot | BuoyLocation;
        const key = 'location_id' in typedItem ? typedItem.location_id : typedItem.id;
        return <React.Fragment key={key}>{renderResultItem(typedItem)}</React.Fragment>;
      })}
    </Dialog>
  );
}
