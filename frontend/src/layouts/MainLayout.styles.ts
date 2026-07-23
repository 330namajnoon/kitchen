import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const LayoutWrapper = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
`

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};

  ${media.up('sm')} {
    padding: 16px 32px;
  }
`

export const Brand = styled.span`
  font-weight: 700;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.primary.main};
`

export const Nav = styled.nav`
  display: none;
  gap: 16px;

  ${media.up('sm')} {
    display: flex;
    gap: 24px;
  }
`

export const NavLink = styled.a`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
  }
`

export const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 4px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;

  ${media.up('sm')} {
    display: none;
  }
`

export const Main = styled.main`
  flex: 1;
  display: flex;
  padding-bottom: 0;

  ${media.down('sm')} {
    padding-bottom: 72px;
  }
`

export const BottomNav = styled.nav`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 10;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

  ${media.up('sm')} {
    display: none;
  }
`

export const BottomNavLink = styled.a<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  font-size: 0.6875rem;
  font-weight: 500;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary.main : theme.colors.text.secondary};
`
