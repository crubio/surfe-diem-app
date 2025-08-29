import { Button, Stack, Typography } from "@mui/material";
import { Item } from "components/layout/item";
import { useNavigate } from "react-router-dom";
import { trackInteraction } from "utils/analytics";

interface ExploreActionsProps {
  page: string; // e.g., 'home', 'spot', 'location'
  geolocation?: boolean; // whether geolocation is available
}

type ExploreAction = 'map' | 'spots' | 'near_me';

const actionRoutes: Record<string, string> = {
  map: '/map',
  spots: '/spots',
  near_me: '/nearby-spots',
};

const buttonStyles = {
  flex: 1,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
};

const ExploreActions = (props: ExploreActionsProps) => {
  const navigate = useNavigate();

  const handleExploreAction = (variation: string, action: ExploreAction) => {
    trackInteraction(variation, 'quick_action', { action });
    const route = actionRoutes[action];
    if (route) navigate(route);
  };
    
  return (
    <Item sx={{ bgcolor: 'background.default', marginBottom: "20px", p: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        Explore
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => handleExploreAction(props.page, 'map')}
          sx={buttonStyles}
        >
          View Map
        </Button>
        <Button 
          variant="outlined" 
          size="large"
          onClick={() => handleExploreAction(props.page, 'spots')}
          sx={buttonStyles}
        >
          Browse All Spots
        </Button>
        {props.geolocation && (
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => handleExploreAction(props.page, 'near_me')}
            sx={buttonStyles}
          >
            Spots Near Me
          </Button>
        )}
      </Stack>
    </Item>
  )
}

export default ExploreActions;