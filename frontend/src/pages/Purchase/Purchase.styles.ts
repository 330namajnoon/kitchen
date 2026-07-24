import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const PurchaseWrapper = styled.div`
  flex: 1;
  padding: 24px 16px 96px;
  max-width: 640px;
  margin: 0 auto;
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

  ${media.up('sm')} {
    font-size: 1.75rem;
  }
`

export const SearchField = styled.div`
  margin-bottom: 12px;
`

export const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 8px;
  overflow: hidden;
`

export const SearchResultButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  cursor: pointer;
  font: inherit;
  text-align: left;
  appearance: none;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[50]};
  }
`

export const EmptyState = styled.p`
  margin: 0 0 20px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`

export const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 8px;
`

export const ItemPhoto = styled.img`
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  flex-shrink: 0;
`

export const ItemPhotoPlaceholder = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  flex-shrink: 0;
`

export const ItemName = styled.span`
  flex: 1;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ItemQuantityField = styled.div`
  width: 90px;
  flex-shrink: 0;
`
