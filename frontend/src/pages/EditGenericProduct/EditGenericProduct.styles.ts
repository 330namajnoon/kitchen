import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const EditGenericProductWrapper = styled.div`
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

export const SectionTitle = styled.h1`
  margin: 0 0 24px;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 480px;
  margin: 0 auto;
`

export const ButtonsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;

  ${media.up('sm')} {
    flex-direction: row;
  }
`
