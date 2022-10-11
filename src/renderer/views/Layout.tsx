/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Box } from '@mui/material';
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const Layout: React.FC = (): JSX.Element => {
  return (
    <>
      <Box>
        <Header />
      </Box>
      <Box>
        <Outlet />
      </Box>
    </>
  );
};

export default Layout;
