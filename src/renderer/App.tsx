import { useContext, useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Home from './views/Home';
import Layout from './views/Layout';
import Settings from './views/Settings';
import { darkTheme } from './theme';
import { AlertContextProvider, AlertContext } from './contexts/AlertContext';
import Alert from './components/Alert';

const App: React.FC = () => {
  return (
    <>
      <Router>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <AlertContextProvider>
            <>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
              <Alert />
            </>
          </AlertContextProvider>
        </ThemeProvider>
      </Router>
    </>
  );
};

export default App;
