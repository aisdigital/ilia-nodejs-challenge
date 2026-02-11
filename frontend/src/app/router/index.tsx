import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { LoginPage } from '@/pages/login/LoginPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);
