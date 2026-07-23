import styled from 'styled-components'
import { media } from '@/styles/breakpoints'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 480px;
  margin: 0 auto;
`

export const PhotoRow = styled.div`
  display: flex;
  justify-content: center;
`

export const PhotoButton = styled.button`
  position: relative;
  width: 140px;
  height: 140px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.neutral[100]};
  cursor: pointer;
  overflow: hidden;
  appearance: none;
`

export const PhotoPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

export const PhotoOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  background-color: rgba(0, 0, 0, 0.02);
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
