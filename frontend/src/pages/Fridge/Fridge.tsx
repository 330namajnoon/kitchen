import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditNoteIcon from '@mui/icons-material/EditNote'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import CircularProgress from '@mui/material/CircularProgress'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { useGetFridgeProductsQuery } from '@/services/fridgeApi'
import { paths } from '@/routes/paths'
import {
  CenteredState,
  FridgeWrapper,
  PageTitle,
  ProductCard,
  ProductGrid,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
} from './Fridge.styles'
import { Add } from '@mui/icons-material'

export const Fridge = () => {
  const navigate = useNavigate()
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const { data: products, isLoading, isError } = useGetFridgeProductsQuery()

  return (
    <FridgeWrapper>
      <PageTitle>Nevera</PageTitle>

      {isLoading && (
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      )}

      {isError && <CenteredState>No se han podido cargar los productos de la nevera.</CenteredState>}

      {!isLoading && !isError && products?.length === 0 && (
        <CenteredState>Todavía no hay productos en la nevera.</CenteredState>
      )}

      {!isLoading && !isError && (products?.length ?? 0) > 0 && (
        <ProductGrid>
          {products!.map((product) => {
            const displayName = product.name || product.description
            return (
              <ProductCard key={product.id}>
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
    </FridgeWrapper>
  )
}
