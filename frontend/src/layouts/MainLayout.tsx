import { Link, Outlet } from 'react-router-dom'
import { paths } from '@/routes/paths'
import { Brand, Header, LayoutWrapper, Main, Nav, NavLink } from './MainLayout.styles'

export const MainLayout = () => {
  return (
    <LayoutWrapper>
      <Header>
        <Brand>Kitchen</Brand>
        <Nav>
          <NavLink as={Link} to={paths.home}>
            Home
          </NavLink>
          <NavLink as={Link} to={paths.login}>
            Login
          </NavLink>
        </Nav>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </LayoutWrapper>
  )
}
