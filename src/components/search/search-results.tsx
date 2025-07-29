import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { useNavigate } from "react-router-dom";
import { LocationOn, Support } from '@mui/icons-material';
import { BuoyLocation, Spot } from '@features/locations/types';

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
        <ListItem disableGutters key={item.location_id}>
          <ListItemButton onClick={() => handleListItemClick(`/location/${item.location_id}`)}>
            <Support sx={{marginRight: '10px'}} /><ListItemText primary={item.name} />
          </ListItemButton>
        </ListItem>
      )
    } else {
      return (
        <ListItem disableGutters key={item.id}>
          <ListItemButton onClick={() => handleListItemClick(`/spot/${item.id}`)}>
            <LocationOn sx={{marginRight: '10px'}} /><ListItemText primary={item.name} />
          </ListItemButton>
        </ListItem>
      )
    }
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Search results for "{searchTerm}"</DialogTitle>
      {results && results.length && results.map((item) => (
        renderResultItem(item as unknown as Spot | BuoyLocation)
      ))}
    </Dialog>
  );
}
