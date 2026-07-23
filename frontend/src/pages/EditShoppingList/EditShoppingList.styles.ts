import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const EditShoppingListWrapper = styled.div`
  flex: 1;
  padding: 24px 16px 96px;
  width: 100%;

  ${media.up('sm')} {
    padding: 32px 32px 96px;
  }
`

export const PageTitle = styled.h1`
  margin: 0 0 24px;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;

  ${media.up('sm')} {
    font-size: 1.75rem;
  }
`

export const CenteredState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 60vh;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`
