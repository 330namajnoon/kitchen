import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditNoteIcon from '@mui/icons-material/EditNote'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import CircularProgress from '@mui/material/CircularProgress'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
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
} from './Products.styles'
import { Add } from '@mui/icons-material'

export const Products = () => {
  const navigate = useNavigate()
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const { data: products, isLoading, isError } = useGetProductsQuery()

  return (
    <ProductsWrapper>
      <PageTitle>Productos</PageTitle>

      {isLoading && (
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      )}

      {isError && <CenteredState>No se han podido cargar los productos.</CenteredState>}

      {!isLoading && !isError && products?.length === 0 && (
        <CenteredState>Todavía no hay productos.</CenteredState>
      )}

      {!isLoading && !isError && (products?.length ?? 0) > 0 && (
        <ProductGrid>
          {products!.map((product) => {
            const displayName = product.name || product.description
            return (
              <ProductCard key={product.id} onClick={() => navigate(buildEditProductPath(product.id), { state: { product } })}>
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
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
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
        </SpeedDial>
      </ClickAwayListener>
    </ProductsWrapper>
  )
}
