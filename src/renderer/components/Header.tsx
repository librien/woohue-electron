/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Box, IconButton, Toolbar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import * as React from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

const Header: React.FC = (): JSX.Element => {

  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar
            css={css`
              display: flex;
              justify-content: space-between;
            `}
          >
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="view home page"
              sx={{ mr: 2 }}
              onClick={() => {
                navigate('/');
              }}
            >
              <HomeIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="view settings"
              sx={{ mr: 2 }}
              onClick={() => {
                navigate('/settings');
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
};

export default Header;
