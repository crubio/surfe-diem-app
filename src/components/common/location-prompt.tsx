import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

interface LocationPromptProps {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const LocationPrompt = ({ onMouseEnter, onMouseLeave }: LocationPromptProps) => {
  return (
    <Card 
      sx={{ 
        height: "100%", 
        bgcolor: 'background.default',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          bgcolor: 'rgba(30, 214, 230, 0.05)',
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Personalized Recommendations
          </Typography>
          <Chip 
            label="Location"
            color="info"
            size="small"
            icon={<LocationOn />}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Enable location services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            for personalized recommendations
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LocationPrompt; 