import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './app/providers/AppProviders';
import { appRouter } from './app/router';
import './shared/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <CssBaseline />
      <RouterProvider router={appRouter} />
    </AppProviders>
  </React.StrictMode>,
);
