import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import KitchenIcon from '@mui/icons-material/Kitchen'
import LogoutIcon from '@mui/icons-material/Logout'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { paths } from '@/routes/paths'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout, selectAuthUser } from '@/store/slices/authSlice'
import {
  BottomNav,
  BottomNavLink,
  Brand,
  Header,
  LayoutWrapper,
  Main,
  MenuButton,
  Nav,
  NavLink,
} from './MainLayout.styles'

export const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)

  return (
    <LayoutWrapper>
      <Header>
        <Brand>Kitchen</Brand>
        <Nav>
          <NavLink as={Link} to={paths.home}>
            Home
          </NavLink>
          <NavLink
            as="button"
            type="button"
            onClick={() => dispatch(logout())}
            title={user?.email}
            style={{
              border: 'none',
              background: 'none',
              padding: 0,
              cursor: 'pointer',
              font: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <LogoutIcon fontSize="small" /> Cerrar sesión
          </NavLink>
          <NavLink as={Link} to={paths.products}>
            Productos
          </NavLink>
          <NavLink as={Link} to={paths.genericProducts}>
            Productos genéricos
          </NavLink>
          <NavLink as={Link} to={paths.recipes}>
            Recetas
          </NavLink>
          <NavLink as={Link} to={paths.cookedMeals}>
            Cocinadas
          </NavLink>
          <NavLink as={Link} to={paths.shoppingLists}>
            Listas de la compra
          </NavLink>
          <NavLink as={Link} to={paths.availableProducts}>
            Disponibles
          </NavLink>
        </Nav>
        <MenuButton type="button" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}>
          <MenuIcon />
        </MenuButton>
      </Header>

      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <List sx={{ width: 240 }}>
          <ListItemButton
            onClick={() => {
              setMenuOpen(false)
              dispatch(logout())
            }}
          >
            <ListItemText primary="Cerrar sesión" secondary={user?.email} />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={paths.genericProducts}
            onClick={() => setMenuOpen(false)}
          >
            <ListItemText primary="Productos genéricos" />
          </ListItemButton>
          <ListItemButton
            component={Link}
            to={paths.cookedMeals}
            onClick={() => setMenuOpen(false)}
          >
            <ListItemText primary="Cocinadas" />
          </ListItemButton>
        </List>
      </Drawer>

      <Main>
        <Outlet />
      </Main>

      <BottomNav>
        <BottomNavLink as={Link} to={paths.home} $active={pathname === paths.home}>
          <HomeIcon fontSize="small" />
          Home
        </BottomNavLink>
        <BottomNavLink
          as={Link}
          to={paths.products}
          $active={pathname === paths.products || pathname.startsWith(`${paths.products}/`)}
        >
          <KitchenIcon fontSize="small" />
          Productos
        </BottomNavLink>
        <BottomNavLink
          as={Link}
          to={paths.recipes}
          $active={pathname.startsWith(paths.recipes)}
        >
          <RestaurantMenuIcon fontSize="small" />
          Recetas
        </BottomNavLink>
        <BottomNavLink
          as={Link}
          to={paths.shoppingLists}
          $active={pathname.startsWith(paths.shoppingLists)}
        >
          <ShoppingCartIcon fontSize="small" />
          Compra
        </BottomNavLink>
        <BottomNavLink
          as={Link}
          to={paths.availableProducts}
          $active={pathname.startsWith(paths.availableProducts) || pathname.startsWith(paths.purchase)}
        >
          <Inventory2Icon fontSize="small" />
          Disponibles
        </BottomNavLink>
      </BottomNav>
    </LayoutWrapper>
  )
}
