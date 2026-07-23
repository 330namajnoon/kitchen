import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const ShoppingListsWrapper = styled.div`
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

export const ShoppingListStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
`

export const ShoppingListCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

export const ShoppingListInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const ShoppingListDate = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ShoppingListItemCount = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const StatusBadge = styled.span<{ $status: 'pending' | 'completed' }>`
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme, $status }) => ($status === 'completed' ? theme.colors.primary.contrastText : theme.colors.text.primary)};
  background-color: ${({ theme, $status }) => ($status === 'completed' ? theme.colors.primary.main : theme.colors.neutral[200])};
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
