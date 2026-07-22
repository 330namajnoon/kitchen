import styled from 'styled-components'

export const ScannerWrapper = styled.div`
  position: fixed;
  inset: 0;
  background-color: #000;
  overflow: hidden;
`

export const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

export const Viewfinder = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(70vw, 280px);
  height: min(70vw, 280px);
  transform: translate(-50%, -50%);
  border: 3px solid ${({ theme }) => theme.colors.neutral.white};
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
`

export const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: rgba(15, 23, 42, 0.55);
  color: ${({ theme }) => theme.colors.neutral.white};
  cursor: pointer;
`

export const HintText = styled.p`
  position: absolute;
  left: 50%;
  bottom: 64px;
  transform: translateX(-50%);
  margin: 0;
  padding: 0 24px;
  width: 100%;
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral.white};
  font-size: 0.9rem;
`

export const StatusOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral.white};
  background-color: rgba(15, 23, 42, 0.85);
`
