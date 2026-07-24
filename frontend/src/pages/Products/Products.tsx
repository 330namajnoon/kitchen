import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import EditNoteIcon from '@mui/icons-material/EditNote'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import CircularProgress from '@mui/material/CircularProgress'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import TextField from '@mui/material/TextField'
import { useGetProductsQuery } from '@/services/productsApi'
import { buildEditProductPath, paths } from '@/routes/paths'
import {
  CenteredState,
  PageTitle,
  ProductCard,
  ProductGrid,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
  ProductsWrapper,
  SearchField,
} from './Products.styles'
import { Add } from '@mui/icons-material'

export const Products = () => {
  const navigate = useNavigate()
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: products, isLoading, isError } = useGetProductsQuery()

  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = products?.filter((product) => {
    if (!normalizedSearch) return true
    const displayName = product.name || product.description
    return displayName?.toLowerCase().includes(normalizedSearch)
  })

  return (
    <ProductsWrapper>
      <PageTitle>Productos</PageTitle>

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
            return (
              <ProductCard
                key={product.id}
                onClick={() => navigate(buildEditProductPath(product.id), { state: { product } })}
              >
                {product.photoUrl ? (
                  <ProductPhoto src={product.photoUrl} alt={displayName} />
                ) : (
                  <ProductPhotoPlaceholder />
                )}
                <ProductName>{displayName}</ProductName>
              </ProductCard>
            )
          })}
        </ProductGrid>
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
