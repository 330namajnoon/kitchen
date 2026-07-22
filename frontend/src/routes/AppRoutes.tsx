import { Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { Fridge } from '@/pages/Fridge'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { paths } from './paths'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.fridge} element={<Fridge />} />
      </Route>
    </Routes>
  )
}
