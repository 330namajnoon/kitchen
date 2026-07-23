import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const AddRecipeWrapper = styled.div`
  flex: 1;
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
  text-align: center;

  ${media.up('sm')} {
    font-size: 1.75rem;
  }
`
