import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Link, Menu, MenuItem } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getSearchResults } from '../locations/api/locations';
import { useEffect, useState } from 'react';
import { Search, SearchIconWrapper, StyledInputBase } from 'components/search/search';
import { LinkRouter, SearchResultsDialog } from 'components';
import { random } from 'lodash';
import { SearchQueryParams } from '../locations/types';
import { toast } from 'react-toastify';

export default function SearchAppBar() {
  const notify = () => toast("No results found");
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState<SearchQueryParams>({q: '', limit: 10})
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false)
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  // Used to make sure the query is unique if the same params are used
  const [queryId, setQueryId] = useState<number>(random(1, 1000))
  const pages = ['Home', 'Map', 'Surf Spots'];
  const pageMap = {
    Home: '/',
    Map: '/map',
    'Surf Spots': '/spots'
  }
  
  const {data: searchResultData} = useQuery(['search', queryId ,searchQuery], () => getSearchResults(searchQuery), {
    enabled: queryEnabled,
    onError: (error) => {
      console.warn(error)
    },
    onSuccess: (data) => {
      if (data.length === 0) {
        notify()
      }
    }
  })

  const renderNavLinks = (pageMap: {[key: string]: string}) => {
    const pageLinks = []
    for (const key in pageMap) {
      pageLinks.push(
        <LinkRouter key={key} to={pageMap[key]} underline="none" color="inherit" sx={{ my: 2, color: 'white', display: 'block' }}>
          <Typography variant="h6" noWrap component="div" sx={{marginRight: "16px"}}>
            {key}
          </Typography>
        </LinkRouter>
      );
    }
    return pageLinks;
  }

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const query = e.currentTarget.value
      setSearchQuery({q: query, limit: 10})
      setQueryId(random(1, 1000))
      setQueryEnabled(true)
    }
  }

  const handleClose = () => {
    setSearchOpen(false);
    return
  };

  useEffect(() => {
    if (searchResultData?.length) {
      setSearchOpen(true)
    } else {
      setSearchOpen(false)
    }
  }, [searchResultData])

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
    <SearchResultsDialog open={searchOpen} onClose={handleClose} searchTerm={searchQuery.q} results={searchResultData} />
    <Box sx={{ flexGrow: 1 }} id={'search-bar-header'} data-testid={'search-bar-header'}>
      <AppBar position="static" sx={{backgroundColor: 'primary.dark'}}>
        <Toolbar disableGutters>
          <Link href="/" underline="none" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block' }, marginRight: '40px', marginLeft: '20px' }}
            >
              surfe diem
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page, idx) => (
                <MenuItem key={idx} onClick={handleCloseNavMenu}>
                  <LinkRouter to={`/${page.toLocaleLowerCase()}`} >
                    <Typography textAlign="center">{page}</Typography>  
                  </LinkRouter>
                </MenuItem>
              ))}
            </Menu>
          </Box>
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
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {renderNavLinks(pageMap).map((page) => (
              <>{page}</>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
    </>
  );
}