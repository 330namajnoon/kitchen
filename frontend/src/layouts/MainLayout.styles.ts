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
  display: flex;
  gap: 16px;

  ${media.up('sm')} {
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

export const Main = styled.main`
  flex: 1;
  display: flex;
`
