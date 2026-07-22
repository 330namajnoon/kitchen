import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const LoginWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`

export const LoginCard = styled.div`
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 12px;

  ${media.up('sm')} {
    padding: 32px;
  }
`
