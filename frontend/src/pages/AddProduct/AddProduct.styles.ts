import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const AddProductWrapper = styled.div`
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

export const ProductHeader = styled.div`
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

export const PhotoWrapper = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
`

export const ProductPhoto = styled.img`
  width: 140px;
  height: 140px;
  object-fit: contain;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  flex-shrink: 0;
`

export const ProductPhotoPlaceholder = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  flex-shrink: 0;
`

export const PhotoEditButton = styled.button`
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 2px solid ${({ theme }) => theme.colors.background.default};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrastText};
  cursor: pointer;
  appearance: none;
`

export const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  ${media.up('sm')} {
    align-items: flex-start;
  }
`

export const ProductName = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};

  ${media.up('sm')} {
    font-size: 1.5rem;
  }
`

export const ProductBrand = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  justify-content: center;

  ${media.up('sm')} {
    justify-content: flex-start;
  }
`

export const SectionTitle = styled.h2`
  margin: 24px 0 12px;
  font-size: 1rem;
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

export const QuantityRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;

  > :first-child {
    flex: 1;
  }

  > :last-child {
    width: 90px;
    flex-shrink: 0;
  }
`

export const GenericProductRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;

  > :first-child {
    flex: 1;
  }
`
