import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
import { useDetectProductMutation } from '@/services/productDetectApi'
import { buildAddProductPath, paths } from '@/routes/paths'
import {
  CaptureButton,
  CloseButton,
  HintText,
  ScannerWrapper,
  StatusOverlay,
  Video,
} from './DetectProduct.styles'

type PermissionState = 'requesting' | 'granted' | 'denied'

export const DetectProduct = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { returnTo, presetGenericProductId } =
    (location.state as { returnTo?: string; presetGenericProductId?: number } | null) ?? {}
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [permission, setPermission] = useState<PermissionState>('requesting')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [detectProduct, { isLoading }] = useDetectProductMutation()

  const handleClose = useCallback(() => navigate(returnTo ?? paths.products), [navigate, returnTo])

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setPermission('granted')
      })
      .catch(() => {
        if (!cancelled) setPermission('denied')
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleCapture = async () => {
    const video = videoRef.current
    if (!video || isLoading) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const photo = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!photo) return

    setErrorMessage(null)
    try {
      const detected = await detectProduct(photo).unwrap()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      const syntheticCode = `ia-${crypto.randomUUID()}`
      navigate(buildAddProductPath(syntheticCode), { state: { detectedProduct: detected, returnTo, presetGenericProductId } })
    } catch {
      setErrorMessage('No se ha podido analizar la foto. Inténtalo de nuevo.')
    }
  }

  return (
    <ScannerWrapper>
      <Video ref={videoRef} muted playsInline autoPlay />

      {permission === 'granted' && !isLoading && (
        <>
          <HintText>{errorMessage ?? 'Encuadra el producto y haz una foto para detectarlo con IA'}</HintText>
          <CaptureButton onClick={handleCapture} aria-label="Capturar foto" />
        </>
      )}

      {permission === 'granted' && isLoading && (
        <StatusOverlay>
          <CircularProgress color="inherit" />
          <p>Analizando producto con IA…</p>
        </StatusOverlay>
      )}

      {permission === 'requesting' && (
        <StatusOverlay>
          <CircularProgress color="inherit" />
          <p>Solicitando acceso a la cámara…</p>
        </StatusOverlay>
      )}

      {permission === 'denied' && (
        <StatusOverlay>
          <p>No se ha podido acceder a la cámara. Revisa los permisos del navegador e inténtalo de nuevo.</p>
        </StatusOverlay>
      )}

      <CloseButton onClick={handleClose} aria-label="Cerrar">
        <CloseIcon fontSize="small" />
      </CloseButton>
    </ScannerWrapper>
  )
}
