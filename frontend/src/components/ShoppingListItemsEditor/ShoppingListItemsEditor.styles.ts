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

export const ItemBlock = styled.div`
  display: flex;
  flex-direction: column;
`

export const SubProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 6px 0 0 8px;
  padding-left: 8px;
  border-left: 2px solid ${({ theme }) => theme.colors.neutral[200]};
`

export const SubProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[50]};
`

export const SubProductPhotoButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  flex-shrink: 0;
  line-height: 0;
`

export const SubProductPhoto = styled.img`
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`

export const SubProductPhotoPlaceholder = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`

export const SubProductName = styled.span`
  flex: 1;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ProductModalPhoto = styled.img`
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`

export const ProductModalPhotoPlaceholder = styled.div`
  width: 100%;
  height: 160px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
`

export const ProductModalName = styled.h3`
  margin: 12px 0 4px;
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ProductModalInfoList = styled.dl`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  margin: 8px 0 0;
`

export const ProductModalInfoLabel = styled.dt`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ProductModalInfoValue = styled.dd`
  margin: 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text.primary};
`
