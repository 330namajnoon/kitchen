import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const CookedMealDetailWrapper = styled.div`
  flex: 1;
  padding: 24px 16px 96px;

  ${media.up('sm')} {
    padding: 32px 32px 96px;
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

export const MealHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  ${media.up('sm')} {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
  }
`

export const MealPhoto = styled.img`
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  flex-shrink: 0;
`

export const MealPhotoPlaceholder = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  flex-shrink: 0;
`

export const MealInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  ${media.up('sm')} {
    align-items: flex-start;
  }
`

export const MealName = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};

  ${media.up('sm')} {
    font-size: 1.5rem;
  }
`

export const SectionTitle = styled.h2`
  margin: 24px 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  margin: 0 auto;
`

export const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const DetailLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const DetailValue = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: pre-wrap;
`

export const IngredientList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 480px;
  margin: 0 auto;
`

export const IngredientRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 8px;
`

export const IngredientName = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const IngredientAmount = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`

export const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
`
