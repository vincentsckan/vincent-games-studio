import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminShell } from './components/admin/AdminShell'
import { RequireAuth } from './components/admin/RequireAuth'
import { HomePage } from './pages/HomePage'
import { GamesPage } from './pages/GamesPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminGamesPage } from './pages/admin/AdminGamesPage'
import { AdminGameFormPage } from './pages/admin/AdminGameFormPage'

/** Must match `base` in vite.config.ts (GitHub Pages repo path). */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

const router = createBrowserRouter(
  [
    {
      path: 'admin/login',
      element: <AdminLoginPage />,
    },
    {
      path: 'admin',
      element: (
        <RequireAuth>
          <AdminShell />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <AdminGamesPage /> },
        { path: 'games/new', element: <AdminGameFormPage /> },
        { path: 'games/:id', element: <AdminGameFormPage /> },
      ],
    },
    {
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'games', element: <GamesPage /> },
        { path: 'games/:slug', element: <GameDetailPage /> },
        { path: 'about', element: <AboutPage /> },
        { path: 'contact', element: <ContactPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename },
)

export default function App() {
  return <RouterProvider router={router} />
}
