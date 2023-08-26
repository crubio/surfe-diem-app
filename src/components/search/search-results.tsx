import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Location } from '@features/ui/locations/types';
import { useNavigate } from "react-router-dom";
import { Support } from '@mui/icons-material';

export interface SimpleDialogProps {
  results?: Location[];
  open: boolean;
  searchTerm?: string;
  onClose: () => void;
}

export function SearchResultsDialog(props: SimpleDialogProps) {
  const navigate = useNavigate();
  const { onClose, searchTerm, open, results } = props;

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value: string) => {
    onClose();
    navigate(`/location/${value}`)
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Search results for "{searchTerm}"</DialogTitle>
      {results && results.length && results.map((location) => (
        <ListItem disableGutters key={location.id}>
          <ListItemButton onClick={() => handleListItemClick(location.location_id)}>
            <Support sx={{marginRight: '10px'}} /><ListItemText primary={location.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </Dialog>
  );
}
