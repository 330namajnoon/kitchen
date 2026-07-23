import { Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AddGenericProduct } from '@/pages/AddGenericProduct'
import { AddProduct } from '@/pages/AddProduct'
import { AddRecipe } from '@/pages/AddRecipe'
import { EditGenericProduct } from '@/pages/EditGenericProduct'
import { EditProduct } from '@/pages/EditProduct'
import { EditRecipe } from '@/pages/EditRecipe'
import { GenericProducts } from '@/pages/GenericProducts'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Products } from '@/pages/Products'
import { Recipes } from '@/pages/Recipes'
import { ScanBarcode } from '@/pages/ScanBarcode'
import { paths } from './paths'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.products} element={<Products />} />
        <Route path={paths.addProduct} element={<AddProduct />} />
        <Route path={paths.editProduct} element={<EditProduct />} />
        <Route path={paths.genericProducts} element={<GenericProducts />} />
        <Route path={paths.addGenericProduct} element={<AddGenericProduct />} />
        <Route path={paths.editGenericProduct} element={<EditGenericProduct />} />
        <Route path={paths.recipes} element={<Recipes />} />
        <Route path={paths.addRecipe} element={<AddRecipe />} />
        <Route path={paths.editRecipe} element={<EditRecipe />} />
      </Route>
      <Route path={paths.scanBarcode} element={<ScanBarcode />} />
    </Routes>
  )
}
