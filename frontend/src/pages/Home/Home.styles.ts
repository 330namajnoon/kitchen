import styled from 'styled-components'

export const HomeWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
`

export const Subtitle = styled.p`
  max-width: 480px;
  color: ${({ theme }) => theme.colors.text.secondary};
`
