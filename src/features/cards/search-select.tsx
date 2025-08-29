import { Box, Typography } from "@mui/material";
import { EnhancedSelect } from "components";

// Reusable SearchCard component
type SearchCardProps = {
  label: string;
  items: any[];
  selectValueKey: string;
  doOnSelect: (value: string) => void;
  type: 'spot' | 'buoy';
  placeholder?: string;
};

const SearchCard = ({
  label,
  items,
  selectValueKey,
  doOnSelect,
  type,
  placeholder
}: SearchCardProps) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 1 }}>
      {label}
    </Typography>
    {items && items.length > 0 && (
      <EnhancedSelect
        label={label}
        items={items}
        selectValueKey={selectValueKey}
        doOnSelect={doOnSelect}
        type={type}
        placeholder={placeholder}
      />
    )}
  </Box>
);

export default SearchCard;