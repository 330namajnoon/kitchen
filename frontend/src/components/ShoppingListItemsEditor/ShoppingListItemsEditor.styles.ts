import styled from 'styled-components'

export const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const SelectorRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;

  > :first-child {
    flex: 1;
  }
`

export const EmptyState = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ItemRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 8px;

  > :nth-child(2) {
    width: 90px;
    flex-shrink: 0;
  }

  > :nth-child(3) {
    width: 80px;
    flex-shrink: 0;
  }
`

export const ItemName = styled.span`
  flex: 1;
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
