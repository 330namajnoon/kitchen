import { Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AddGenericProduct } from '@/pages/AddGenericProduct'
import { AddProduct } from '@/pages/AddProduct'
import { EditGenericProduct } from '@/pages/EditGenericProduct'
import { EditProduct } from '@/pages/EditProduct'
import { Fridge } from '@/pages/Fridge'
import { GenericProducts } from '@/pages/GenericProducts'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { ScanBarcode } from '@/pages/ScanBarcode'
import { paths } from './paths'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.fridge} element={<Fridge />} />
        <Route path={paths.addProduct} element={<AddProduct />} />
        <Route path={paths.editProduct} element={<EditProduct />} />
        <Route path={paths.genericProducts} element={<GenericProducts />} />
        <Route path={paths.addGenericProduct} element={<AddGenericProduct />} />
        <Route path={paths.editGenericProduct} element={<EditGenericProduct />} />
      </Route>
      <Route path={paths.scanBarcode} element={<ScanBarcode />} />
    </Routes>
  )
}
