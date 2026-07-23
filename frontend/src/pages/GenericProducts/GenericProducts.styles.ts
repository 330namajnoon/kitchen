import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const GenericProductsWrapper = styled.div`
  flex: 1;
  position: relative;
  padding: 24px 16px 96px;

  ${media.up('sm')} {
    padding: 32px 32px 96px;
  }
`

export const PageTitle = styled.h1`
  margin: 0 0 24px;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};

  ${media.up('sm')} {
    font-size: 1.75rem;
  }
`

export const SearchField = styled.div`
  margin-bottom: 20px;
  max-width: 480px;
`

export const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const ProductCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  text-align: left;
  appearance: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.light};
  }
`

export const ProductName = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ProductDescription = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const CenteredState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
`
