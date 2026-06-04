import NorthIcon from '@mui/icons-material/North';

interface DirectionArrowProps {
  deg: number;
  lowConfidence: boolean;
}

export const DirectionArrow = ({ deg, lowConfidence }: DirectionArrowProps) => (
  <NorthIcon
    sx={{
      fontSize: '0.85rem',
      transform: `rotate(${deg}deg)`,
      opacity: lowConfidence ? 0.4 : 0.85,
      verticalAlign: 'middle',
      mr: 0.25,
    }}
  />
);
