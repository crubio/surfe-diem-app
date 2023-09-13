import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getLocations } from '../locations/api/locations';
import { useEffect, useState } from 'react';
import { Search, SearchIconWrapper, StyledInputBase } from 'components/search/search';
import { SearchResultsDialog } from 'components';
import { random } from 'lodash';
import { LocationQueryParams } from '../locations/types';

export default function SearchAppBar() {

  const [searchQuery, setSearchQuery] = useState<LocationQueryParams>({search: '', limit: 10})
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false)
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  // Used to make sure the query is unique if the same params are used
  const [queryId, setQueryId] = useState<number>(random(1, 1000))

  const {data} = useQuery(['locations', queryId ,searchQuery], () => getLocations(searchQuery), {
    enabled: queryEnabled,
  })

  const locationData = data || []

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const query = e.currentTarget.value
      setSearchQuery({search: query, limit: 10})
      setQueryId(random(1, 1000))
      setQueryEnabled(true)
    }
  }

  const handleClose = () => {
    setSearchOpen(false);
    return
  };

  useEffect(() => {
    if (data?.length) {
      setSearchOpen(true)
    } else {
      setSearchOpen(false)
    }
  }, [data])

  return (
    <>
    <SearchResultsDialog open={searchOpen} onClose={handleClose} searchTerm={searchQuery.search} results={locationData} />
    <Box sx={{ flexGrow: 1 }} id={'search-bar-header'} data-testid={'search-bar-header'}>
      <AppBar position="static" sx={{backgroundColor: 'primary.dark'}}>
        <Toolbar>
          <Link href="/" underline="none" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block' }, marginRight: '40px' }}
            >
              surfe diem
            </Typography>
          </Link>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              onKeyDown={(e) => handleSubmit(e)}
              placeholder="e.g., Santa Cruz, CA"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
    </>
  );
}