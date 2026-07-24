import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Close from '@mui/icons-material/Close'
import EditNoteIcon from '@mui/icons-material/EditNote'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ShoppingCart from '@mui/icons-material/ShoppingCart'
import CircularProgress from '@mui/material/CircularProgress'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import TextField from '@mui/material/TextField'
import { useGetProductsQuery } from '@/services/productsApi'
import { buildEditProductPath, buildPurchasePath, paths } from '@/routes/paths'
import {
  CenteredState,
  PageTitle,
  ProductCard,
  ProductGrid,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
  ProductSelectedBadge,
  ProductsWrapper,
  SearchField,
  SelectionBar,
} from './Products.styles'
import { Add } from '@mui/icons-material'

const LONG_PRESS_MS = 500

export const Products = () => {
  const navigate = useNavigate()
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const { data: products, isLoading, isError } = useGetProductsQuery()

  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const longPressTriggered = useRef(false)

  const isSelecting = selectedIds.length > 0

  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = products?.filter((product) => {
    if (!normalizedSearch) return true
    const displayName = product.name || product.description
    return displayName?.toLowerCase().includes(normalizedSearch)
  })

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]))
  }

  const startLongPress = (id: number) => {
    longPressTriggered.current = false
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      toggleSelected(id)
    }, LONG_PRESS_MS)
  }

  const cancelLongPress = () => {
    clearTimeout(longPressTimer.current)
  }

  const handleCardClick = (product: NonNullable<typeof products>[number]) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }

    if (isSelecting) {
      toggleSelected(product.id)
      return
    }

    navigate(buildEditProductPath(product.id), { state: { product } })
  }

  return (
    <ProductsWrapper>
      {isSelecting ? (
        <SelectionBar>
          <IconButton aria-label="Cancelar selección" onClick={() => setSelectedIds([])}>
            <Close />
          </IconButton>
          {selectedIds.length} seleccionado{selectedIds.length === 1 ? '' : 's'}
        </SelectionBar>
      ) : (
        <PageTitle>Productos</PageTitle>
      )}

      {!isLoading && !isError && (products?.length ?? 0) > 0 && (
        <SearchField>
          <TextField
            label="Buscar"
            placeholder="Buscar por nombre o descripción"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />
        </SearchField>
      )}

      {isLoading && (
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      )}

      {isError && <CenteredState>No se han podido cargar los productos.</CenteredState>}

      {!isLoading && !isError && products?.length === 0 && (
        <CenteredState>Todavía no hay productos.</CenteredState>
      )}

      {!isLoading && !isError && (products?.length ?? 0) > 0 && filteredProducts?.length === 0 && (
        <CenteredState>No se ha encontrado ningún producto con ese término.</CenteredState>
      )}

      {!isLoading && !isError && (filteredProducts?.length ?? 0) > 0 && (
        <ProductGrid>
          {filteredProducts!.map((product) => {
            const displayName = product.name || product.description
            const selected = selectedIds.includes(product.id)

            return (
              <ProductCard
                key={product.id}
                $selected={selected}
                onClick={() => handleCardClick(product)}
                onMouseDown={() => startLongPress(product.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(product.id)}
                onTouchEnd={cancelLongPress}
                onContextMenu={(event) => event.preventDefault()}
              >
                {product.photoUrl ? (
                  <ProductPhoto src={product.photoUrl} alt={displayName} />
                ) : (
                  <ProductPhotoPlaceholder />
                )}
                <ProductName>{displayName}</ProductName>
                {selected && <ProductSelectedBadge>✓</ProductSelectedBadge>}
              </ProductCard>
            )
          })}
        </ProductGrid>
      )}

      {isSelecting && (
        <Fab
          color="secondary"
          aria-label="Hacer la compra"
          onClick={() => navigate(buildPurchasePath(selectedIds))}
          sx={{ position: 'fixed', bottom: { xs: 156, sm: 88 }, right: 24 }}
        >
          <ShoppingCart />
        </Fab>
      )}

      <ClickAwayListener onClickAway={() => setAddMenuOpen(false)}>
        <SpeedDial
          icon={<Add />}
          ariaLabel="Añadir producto"
          open={addMenuOpen}
          onClick={() => setAddMenuOpen((open) => !open)}
          sx={{ position: 'fixed', bottom: { xs: 92, sm: 24 }, right: 24 }}
        >
          <SpeedDialAction
            icon={<EditNoteIcon />}
            slotProps={{
              tooltip: { title: 'Añadir a mano', open: true },
              staticTooltipLabel: { sx: { whiteSpace: 'nowrap' } },
            }}
            onClick={() => setAddMenuOpen(false)}
          />
          <SpeedDialAction
            icon={<QrCodeScannerIcon />}
            slotProps={{
              tooltip: { title: 'Escanear código de barras', open: true },
              staticTooltipLabel: { sx: { whiteSpace: 'nowrap' } },
            }}
            onClick={() => {
              setAddMenuOpen(false)
              navigate(paths.scanBarcode)
            }}
          />
          <SpeedDialAction
            icon={<AutoAwesomeIcon />}
            slotProps={{
              tooltip: { title: 'Detectar con IA', open: true },
              staticTooltipLabel: { sx: { whiteSpace: 'nowrap' } },
            }}
            onClick={() => {
              setAddMenuOpen(false)
              navigate(paths.detectProduct)
            }}
          />
        </SpeedDial>
      </ClickAwayListener>
    </ProductsWrapper>
  )
}
