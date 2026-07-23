import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarcodeDetector as BarcodeDetectorPonyfill } from 'barcode-detector/ponyfill'
import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
import { buildAddProductPath, paths } from '@/routes/paths'
import { CloseButton, HintText, ScannerWrapper, StatusOverlay, Video, Viewfinder } from './ScanBarcode.styles'

type PermissionState = 'requesting' | 'granted' | 'denied'

const BARCODE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] as const

// Crop a bit wider than the visible box so the barcode's quiet-zone margins
// aren't cut off right at the viewfinder edge (that truncation causes partial,
// misread codes). Require the same value twice in a row before accepting it,
// which filters out one-off misreads from a blurry/partial frame.
const CROP_PADDING_RATIO = 0.25
const CONFIRMATIONS_REQUIRED = 2

export const ScanBarcode = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const viewfinderRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const streamRef = useRef<MediaStream | null>(null)
  const [permission, setPermission] = useState<PermissionState>('requesting')

  const handleClose = useCallback(() => navigate(paths.products), [navigate])

  useEffect(() => {
    let cancelled = false
    let frameId = 0
    let detecting = false
    let pendingCode: string | null = null
    let pendingCount = 0

    // Native BarcodeDetector (Android Chrome/Edge) is hardware-accelerated and
    // much faster than the WASM ponyfill, which is needed only where there's
    // no native implementation (e.g. iOS Safari, desktop Firefox).
    const NativeBarcodeDetector = (window as unknown as { BarcodeDetector?: typeof BarcodeDetectorPonyfill })
      .BarcodeDetector
    const DetectorImpl = NativeBarcodeDetector ?? BarcodeDetectorPonyfill
    const detector = new DetectorImpl({ formats: [...BARCODE_FORMATS] })

    const getCroppedFrame = (video: HTMLVideoElement) => {
      const box = viewfinderRef.current?.getBoundingClientRect()
      const videoBox = video.getBoundingClientRect()
      if (!box || !videoBox.width || !videoBox.height) return video

      // object-fit: cover scales the video uniformly to fill its box and
      // center-crops the overflow, so we need to map the on-screen viewfinder
      // rect back to the video's native pixel coordinates before drawing it.
      // Using the video element's own rect (rather than window size) keeps
      // this correct even when the viewport and video box don't match exactly
      // (mobile browser toolbars, safe areas, etc).
      const scale = Math.max(videoBox.width / video.videoWidth, videoBox.height / video.videoHeight)
      const displayedWidth = video.videoWidth * scale
      const displayedHeight = video.videoHeight * scale
      const videoOffsetX = videoBox.left + (videoBox.width - displayedWidth) / 2
      const videoOffsetY = videoBox.top + (videoBox.height - displayedHeight) / 2

      const paddedWidth = box.width * (1 + CROP_PADDING_RATIO)
      const paddedHeight = box.height * (1 + CROP_PADDING_RATIO)
      const paddedLeft = box.left - (paddedWidth - box.width) / 2
      const paddedTop = box.top - (paddedHeight - box.height) / 2

      const sx = (paddedLeft - videoOffsetX) / scale
      const sy = (paddedTop - videoOffsetY) / scale
      const sWidth = paddedWidth / scale
      const sHeight = paddedHeight / scale

      const canvas = canvasRef.current
      canvas.width = sWidth
      canvas.height = sHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return video
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight)
      return canvas
    }

    const tick = () => {
      const video = videoRef.current
      if (!cancelled && video && video.readyState >= 2 && !detecting) {
        detecting = true
        detector
          .detect(getCroppedFrame(video))
          .then((codes) => {
            if (cancelled) return
            if (codes.length > 0) {
              const value = codes[0].rawValue
              pendingCount = value === pendingCode ? pendingCount + 1 : 1
              pendingCode = value
              if (pendingCount >= CONFIRMATIONS_REQUIRED) {
                cancelled = true
                streamRef.current?.getTracks().forEach((track) => track.stop())
                navigate(buildAddProductPath(value))
              }
            } else {
              pendingCode = null
              pendingCount = 0
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

        const [track] = stream.getVideoTracks()
        const capabilities = track?.getCapabilities?.() as (MediaTrackCapabilities & { focusMode?: string[] }) | undefined
        if (capabilities?.focusMode?.includes('continuous')) {
          track
            .applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] })
            .catch(() => {})
        }
      })
      .catch(() => {
        if (!cancelled) setPermission('denied')
      })

    return () => {
      cancelled = true
      cancelAnimationFrame(frameId)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [navigate])

  return (
    <ScannerWrapper>
      <Video ref={videoRef} muted playsInline autoPlay />

      {permission === 'granted' && (
        <>
          <Viewfinder ref={viewfinderRef} />
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
