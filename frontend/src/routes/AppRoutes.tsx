import { Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AddGenericProduct } from '@/pages/AddGenericProduct'
import { AddProduct } from '@/pages/AddProduct'
import { AddRecipe } from '@/pages/AddRecipe'
import { AddShoppingList } from '@/pages/AddShoppingList'
import { AvailableProductDetail } from '@/pages/AvailableProductDetail'
import { AvailableProducts } from '@/pages/AvailableProducts'
import { Callback } from '@/pages/Callback'
import { Cook } from '@/pages/Cook'
import { CookedMealDetail } from '@/pages/CookedMealDetail'
import { CookedMeals } from '@/pages/CookedMeals'
import { DetectProduct } from '@/pages/DetectProduct'
import { EditGenericProduct } from '@/pages/EditGenericProduct'
import { EditProduct } from '@/pages/EditProduct'
import { EditRecipe } from '@/pages/EditRecipe'
import { EditShoppingList } from '@/pages/EditShoppingList'
import { GenericProducts } from '@/pages/GenericProducts'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Products } from '@/pages/Products'
import { Purchase } from '@/pages/Purchase'
import { Recipes } from '@/pages/Recipes'
import { ScanBarcode } from '@/pages/ScanBarcode'
import { ShoppingLists } from '@/pages/ShoppingLists'
import { paths } from './paths'
import { RequireAuth } from './RequireAuth'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={paths.login} element={<Login />} />
      <Route path={paths.callback} element={<Callback />} />
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path={paths.home} element={<Home />} />
          <Route path={paths.products} element={<Products />} />
          <Route path={paths.addProduct} element={<AddProduct />} />
          <Route path={paths.editProduct} element={<EditProduct />} />
          <Route path={paths.genericProducts} element={<GenericProducts />} />
          <Route path={paths.addGenericProduct} element={<AddGenericProduct />} />
          <Route path={paths.editGenericProduct} element={<EditGenericProduct />} />
          <Route path={paths.recipes} element={<Recipes />} />
          <Route path={paths.addRecipe} element={<AddRecipe />} />
          <Route path={paths.editRecipe} element={<EditRecipe />} />
          <Route path={paths.cook} element={<Cook />} />
          <Route path={paths.cookedMeals} element={<CookedMeals />} />
          <Route path={paths.cookedMealDetail} element={<CookedMealDetail />} />
          <Route path={paths.shoppingLists} element={<ShoppingLists />} />
          <Route path={paths.addShoppingList} element={<AddShoppingList />} />
          <Route path={paths.editShoppingList} element={<EditShoppingList />} />
          <Route path={paths.purchase} element={<Purchase />} />
          <Route path={paths.availableProducts} element={<AvailableProducts />} />
          <Route path={paths.editAvailableProduct} element={<AvailableProductDetail />} />
        </Route>
        <Route path={paths.scanBarcode} element={<ScanBarcode />} />
        <Route path={paths.detectProduct} element={<DetectProduct />} />
      </Route>
    </Routes>
  )
}
