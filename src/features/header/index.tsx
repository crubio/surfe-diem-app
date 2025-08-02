import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Link, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getSearchResults } from '../locations/api/locations';
import { useEffect, useState } from 'react';
import { Search, SearchIconWrapper, StyledInputBase } from 'components/search/search';
import { LinkRouter, SearchResultsDialog } from 'components';
import { random } from 'lodash';
import { SearchQueryParams } from '../locations/types';
import { toast } from 'react-toastify';

export default function SearchAppBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const notify = () => toast("No results found", {});
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState<SearchQueryParams>({q: '', limit: 10})
  const [queryEnabled, setQueryEnabled] = useState<boolean>(false)
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  // Used to make sure the query is unique if the same params are used
  const [queryId, setQueryId] = useState<number>(random(1, 1000))
  const pages: (keyof typeof pageMap)[] = ['Map', 'Surf Spots', 'About'];
  const pageMap = {
    Map: '/map',
    'Surf Spots': '/spots',
    'About': '/about'
  }
  
  const {data: searchResultData, isSuccess} = useQuery({
    queryKey: ['search', queryId ,searchQuery],
    queryFn: () => getSearchResults(searchQuery),
    enabled: !!searchQuery && searchQuery.q.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const renderNavLinks = (pageMap: {[key: string]: string}) => {
    const pageLinks = []
    for (const key in pageMap) {
      pageLinks.push(
        <LinkRouter 
          key={key} 
          to={pageMap[key]} 
          underline="none" 
          color="inherit" 
          sx={{ 
            color: 'white', 
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 1,
            textDecoration: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              textDecoration: 'none'
            }
          }}
        >
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{
              fontSize: { md: '1rem', lg: '1.125rem' },
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {key}
          </Typography>
        </LinkRouter>
      );
    }
    return pageLinks;
  }

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== '') {
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
    } else if (isSuccess && searchResultData?.length === 0) {
      notify();
    } else {
      setSearchOpen(false);
    }
  }, [searchResultData, isSuccess])

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
        <Toolbar 
          disableGutters 
          sx={{ 
            minHeight: { xs: '64px', sm: '70px' },
            px: { xs: 1, sm: 2 },
            py: { xs: 0.5, sm: 1 }
          }}
        >
          {/* Logo - Responsive sizing */}
          <Link href="/" underline="none" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant={isSmallMobile ? "h6" : "h5"}
              noWrap
              component="div"
              sx={{ 
                display: { xs: 'block', sm: 'block' }, 
                marginRight: { xs: '16px', sm: '24px', md: '40px' }, 
                marginLeft: { xs: '8px', sm: '16px', md: '20px' },
                fontWeight: 'bold'
              }}
            >
              surfe diem
            </Typography>
          </Link>

          {/* Mobile Menu Button - Improved touch target */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ 
                padding: { xs: '12px', sm: '16px' },
                minWidth: '48px',
                minHeight: '48px'
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: '24px', sm: '28px' } }} />
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
                '& .MuiPaper-root': {
                  minWidth: '200px',
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: 3
                }
              }}
            >
              {pages.map((page, idx) => (
                <LinkRouter 
                  key={idx}
                  to={pageMap[page]} 
                  sx={{ 
                    width: '100%', 
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  <MenuItem 
                    onClick={handleCloseNavMenu}
                    sx={{ 
                      py: 1.5,
                      px: 2,
                      minHeight: '48px',
                      width: '100%'
                    }}
                  >
                    <Typography 
                      textAlign="center" 
                      sx={{ 
                        fontSize: '16px',
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      {page}
                    </Typography>  
                  </MenuItem>
                </LinkRouter>
              ))}
            </Menu>
          </Box>

          {/* Search Bar - Responsive sizing and positioning */}
          <Box sx={{ 
            flexGrow: { xs: 1, md: 0 },
            maxWidth: { xs: '100%', sm: '300px', md: '250px' },
            mx: { xs: 1, sm: 2 },
            order: { xs: 1, md: 2 }
          }}>
            <Search sx={{ 
              width: '100%',
              '& .MuiInputBase-root': {
                height: { xs: '40px', sm: '44px' },
                fontSize: { xs: '14px', sm: '16px' }
              }
            }}>
              <SearchIconWrapper>
                <SearchIcon sx={{ fontSize: { xs: '20px', sm: '24px' } }} />
              </SearchIconWrapper>
              <StyledInputBase
                onKeyDown={(e) => handleSubmit(e)}
                placeholder={isSmallMobile ? "Search..." : "e.g., Santa Cruz, CA"}
                inputProps={{ 'aria-label': 'search' }}
                sx={{
                  '& input': {
                    paddingLeft: { xs: '40px', sm: '48px' },
                    fontSize: { xs: '14px', sm: '16px' }
                  }
                }}
              />
            </Search>
          </Box>

          {/* Desktop Navigation - Hidden on mobile */}
          <Box sx={{ 
            flexGrow: 0, 
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            order: { xs: 2, md: 1 },
            ml: { md: 2 }
          }}>
            {renderNavLinks(pageMap).map((page, index) => (
              <div key={index}>
                {page}
              </div>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
    </>
  );
}