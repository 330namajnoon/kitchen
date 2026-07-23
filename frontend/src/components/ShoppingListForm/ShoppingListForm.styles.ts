import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 480px;
  margin: 0 auto;
`

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ButtonsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  ${media.up('sm')} {
    flex-direction: row;
  }
`
