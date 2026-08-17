import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const CookWrapper = styled.div`
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

export const RecipeSummary = styled.p`
  margin: -12px 0 20px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ServingsField = styled.div`
  margin-bottom: 28px;
  max-width: 200px;
`

export const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`

export const ItemRow = styled.div<{ $missing?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid ${({ theme, $missing }) => ($missing ? theme.colors.warning.main : theme.colors.neutral[200])};
  border-radius: 8px;
`

export const ItemMainRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`

export const ItemName = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ItemAmount = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`

export const ItemWarning = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.warning.main};
`

export const ItemNote = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const EmptyState = styled.p`
  margin: 0 0 20px;
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

export const ButtonsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`
