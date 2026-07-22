import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarcodeDetector } from 'barcode-detector/ponyfill'
import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
import { paths } from '@/routes/paths'
import { CloseButton, HintText, ScannerWrapper, StatusOverlay, Video, Viewfinder } from './ScanBarcode.styles'

type PermissionState = 'requesting' | 'granted' | 'denied'

const BARCODE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] as const

export const ScanBarcode = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [permission, setPermission] = useState<PermissionState>('requesting')

  const handleClose = useCallback(() => navigate(paths.fridge), [navigate])

  useEffect(() => {
    let cancelled = false
    let frameId = 0
    let detecting = false
    const detector = new BarcodeDetector({ formats: [...BARCODE_FORMATS] })

    const tick = () => {
      const video = videoRef.current
      if (!cancelled && video && video.readyState >= 2 && !detecting) {
        detecting = true
        detector
          .detect(video)
          .then((codes) => {
            if (cancelled) return
            if (codes.length > 0) {
              cancelled = true
              streamRef.current?.getTracks().forEach((track) => track.stop())
              window.alert(`Código detectado: ${codes[0].rawValue}`)
              return
            }
          })
          .catch(() => {})
          .finally(() => {
            detecting = false
          })
      }
      if (!cancelled) frameId = requestAnimationFrame(tick)
    }

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
        frameId = requestAnimationFrame(tick)
      })
      .catch(() => {
        if (!cancelled) setPermission('denied')
      })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <ScannerWrapper>
      <Video ref={videoRef} muted playsInline autoPlay />

      {permission === 'granted' && (
        <>
          <Viewfinder />
          <HintText>Encuadra el código de barras dentro del recuadro</HintText>
        </>
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

      <CloseButton onClick={handleClose} aria-label="Cerrar escáner">
        <CloseIcon fontSize="small" />
      </CloseButton>
    </ScannerWrapper>
  )
}
