import React, { useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  ListSubheader,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { LocationOn, Support } from '@mui/icons-material';

interface EnhancedSelectProps {
  items: any[];
  selectValueKey: string;
  label?: string;
  doOnSelect: (value: string) => void;
  type: 'spot' | 'buoy';
  placeholder?: string;
}

interface GroupedOption {
  group: string;
  options: any[];
}

export default function EnhancedSelect({
  items,
  selectValueKey,
  label = 'Select',
  doOnSelect,
  type,
  placeholder
}: EnhancedSelectProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputValue, setInputValue] = useState('');

  // Memoize expensive grouping operations
  const { groupedOptions, flatOptions } = useMemo(() => {
    if (type === 'spot') {
      const grouped = items.reduce((acc: { [key: string]: any[] }, item) => {
        const region = item.subregion_name || 'Other';
        if (!acc[region]) {
          acc[region] = [];
        }
        acc[region].push(item);
        return acc;
      }, {});

      // Sort regions and items within regions
      const groupedOptions = Object.keys(grouped)
        .sort()
        .map(region => ({
          group: region,
          options: grouped[region].sort((a, b) => a.name.localeCompare(b.name))
        }));

      return {
        groupedOptions,
        flatOptions: groupedOptions.flatMap(group => group.options)
      };
    } else {
      // For buoys, just sort alphabetically
      const sortedItems = items.sort((a, b) => a.name.localeCompare(b.name));
      return {
        groupedOptions: [{
          group: 'Buoys',
          options: sortedItems
        }],
        flatOptions: sortedItems
      };
    }
  }, [items, type]);

  const handleChange = (event: any, newValue: any) => {
    if (newValue) {
      doOnSelect(newValue[selectValueKey]);
    }
  };

  const getOptionLabel = (option: any) => {
    if (typeof option === 'string') return option;
    return option.name || '';
  };

  const renderOption = (props: any, option: any) => {
    const region = option.subregion_name;
    const { key, ...otherProps } = props;
    
    return (
      <Box component="li" key={option[selectValueKey]} {...otherProps} sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {type === 'spot' ? (
            <LocationOn sx={{ fontSize: '1rem', color: 'primary.main' }} />
          ) : (
            <Support sx={{ fontSize: '1rem', color: 'secondary.main' }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {option.name}
            </Typography>
            {region && type === 'spot' && (
              <Typography variant="caption" color="text.secondary">
                {region}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderGroup = (params: any) => (
    <Box key={params.key}>
      <ListSubheader 
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          fontWeight: 600,
          color: theme.palette.primary.main,
          fontSize: '0.875rem',
          py: 1
        }}
      >
        {params.group}
      </ListSubheader>
      {params.children}
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        options={flatOptions}
        groupBy={(option) => {
          if (type === 'spot') {
            return option.subregion_name || 'Other';
          }
          return 'Buoys';
        }}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        renderGroup={renderGroup}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder || `Search ${type === 'spot' ? 'surf spots' : 'buoys'}...`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
        )}
        onChange={handleChange}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        inputValue={inputValue}
        loading={false}
        loadingText="Loading..."
        noOptionsText={`No ${type === 'spot' ? 'spots' : 'buoys'} found`}
        clearOnBlur={false}
        blurOnSelect={true}
        selectOnFocus={true}
        clearOnEscape={true}
        openOnFocus={true}
        sx={{
          '& .MuiAutocomplete-listbox': {
            maxHeight: isMobile ? '300px' : '400px',
          },
          '& .MuiAutocomplete-option': {
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
        ListboxProps={{
          style: {
            maxHeight: isMobile ? '300px' : '400px',
          },
        }}
      />
    </Box>
  );
} 