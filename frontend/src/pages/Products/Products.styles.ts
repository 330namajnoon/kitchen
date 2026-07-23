import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const ProductsWrapper = styled.div`
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

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  ${media.up('sm')} {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  ${media.up('md')} {
    grid-template-columns: repeat(4, 1fr);
  }

  ${media.up('lg')} {
    grid-template-columns: repeat(5, 1fr);
  }
`

export const ProductCard = styled.button<{ $depleted?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  text-align: center;
  appearance: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.light};
  }

  ${({ $depleted, theme }) =>
    $depleted &&
    `
    opacity: 0.6;
    border-color: ${theme.colors.error.main};
  `}
`

export const ProductPhoto = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`

export const ProductPhotoPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
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

export const ProductName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`

export const ProductQuantityRemaining = styled.span<{ $depleted?: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme, $depleted }) => ($depleted ? theme.colors.error.main : theme.colors.text.secondary)};
`
