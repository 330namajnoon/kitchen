import { useState } from 'react'
import EditNoteIcon from '@mui/icons-material/EditNote'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { mockProducts } from '@/constants/mockProducts'
import { FridgeWrapper, PageTitle, ProductCard, ProductGrid, ProductName, ProductPhoto } from './Fridge.styles'
import { Add } from '@mui/icons-material'

export const Fridge = () => {
  const [addMenuOpen, setAddMenuOpen] = useState(false)

  return (
    <FridgeWrapper>
      <PageTitle>Nevera</PageTitle>

      <ProductGrid>
        {mockProducts.map((product) => (
          <ProductCard key={product.id}>
            <ProductPhoto src={product.photoUrl} alt={product.name} />
            <ProductName>{product.name}</ProductName>
          </ProductCard>
        ))}
      </ProductGrid>

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
            onClick={() => setAddMenuOpen(false)}
          />
        </SpeedDial>
      </ClickAwayListener>
    </FridgeWrapper>
  )
}
