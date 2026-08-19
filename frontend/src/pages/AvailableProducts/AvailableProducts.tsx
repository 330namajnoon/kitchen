import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Close from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import ShoppingCart from '@mui/icons-material/ShoppingCart'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { useLongPress } from '@/hooks/useLongPress'
import { useDeleteAvailableProductMutation, useGetAvailableProductsQuery } from '@/services/availableProductsApi'
import { buildEditAvailableProductPath, buildPurchasePath } from '@/routes/paths'
import {
  AvailableProductsWrapper,
  CenteredState,
  PageTitle,
  ProductCard,
  ProductGrid,
  ProductName,
  ProductPercentage,
  ProductPhoto,
  ProductPhotoPlaceholder,
  ProductSelectedBadge,
  SearchField,
  SelectionBar,
} from './AvailableProducts.styles'

export const AvailableProducts = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const { data: availableProducts, isLoading, isError } = useGetAvailableProductsQuery()
  const [deleteAvailableProduct, { isLoading: isDeleting }] = useDeleteAvailableProductMutation()

  const isSelecting = selectedIds.length > 0

  const normalizedSearch = search.trim().toLowerCase()
  const filteredAvailableProducts = availableProducts?.filter((availableProduct) => {
    if (!normalizedSearch) return true
    const displayName = availableProduct.product.name || availableProduct.product.description
    return displayName?.toLowerCase().includes(normalizedSearch)
  })

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]))
  }

  const { getHandlers, wasTriggered } = useLongPress<number>(toggleSelected)

  const handleCardClick = (availableProduct: NonNullable<typeof availableProducts>[number]) => {
    if (wasTriggered()) {
      return
    }

    if (isSelecting) {
      toggleSelected(availableProduct.id)
      return
    }

    navigate(buildEditAvailableProductPath(availableProduct.id), { state: { availableProduct } })
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm(`¿Seguro que quieres borrar ${selectedIds.length} producto${selectedIds.length === 1 ? '' : 's'}?`)) return

    try {
      await Promise.all(selectedIds.map((id) => deleteAvailableProduct(id).unwrap()))
      setSelectedIds([])
    } catch {
      // el error se ignora, los que hayan fallado siguen en el listado
    }
  }

  return (
    <AvailableProductsWrapper>
      {isSelecting ? (
        <SelectionBar>
          <IconButton aria-label="Cancelar selección" onClick={() => setSelectedIds([])}>
            <Close />
          </IconButton>
          {selectedIds.length} seleccionado{selectedIds.length === 1 ? '' : 's'}
        </SelectionBar>
      ) : (
        <PageTitle>Disponibles</PageTitle>
      )}

      {!isLoading && !isError && (availableProducts?.length ?? 0) > 0 && (
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

      {isError && <CenteredState>No se han podido cargar los productos disponibles.</CenteredState>}

      {!isLoading && !isError && availableProducts?.length === 0 && (
        <CenteredState>Todavía no hay productos disponibles. Haz una compra para añadir alguno.</CenteredState>
      )}

      {!isLoading && !isError && (availableProducts?.length ?? 0) > 0 && filteredAvailableProducts?.length === 0 && (
        <CenteredState>No se ha encontrado ningún producto con ese término.</CenteredState>
      )}

      {!isLoading && !isError && (filteredAvailableProducts?.length ?? 0) > 0 && (
        <ProductGrid>
          {filteredAvailableProducts!.map((availableProduct) => {
            const displayName = availableProduct.product.name || availableProduct.product.description
            const depleted = availableProduct.percentageRemaining === 0
            const selected = selectedIds.includes(availableProduct.id)

            return (
              <ProductCard
                key={availableProduct.id}
                $depleted={depleted}
                $selected={selected}
                onClick={() => handleCardClick(availableProduct)}
                {...getHandlers(availableProduct.id)}
              >
                {availableProduct.product.photoUrl ? (
                  <ProductPhoto src={availableProduct.product.photoUrl} alt={displayName} />
                ) : (
                  <ProductPhotoPlaceholder />
                )}
                <ProductName>{displayName}</ProductName>
                <ProductPercentage $depleted={depleted}>{availableProduct.percentageRemaining}%</ProductPercentage>
                {selected && <ProductSelectedBadge>✓</ProductSelectedBadge>}
              </ProductCard>
            )
          })}
        </ProductGrid>
      )}

      {isSelecting ? (
        <Fab
          color="error"
          aria-label="Borrar seleccionados"
          onClick={handleDeleteSelected}
          disabled={isDeleting}
          sx={{ position: 'fixed', bottom: { xs: 92, sm: 24 }, right: 24 }}
        >
          {isDeleting ? <CircularProgress size={24} color="inherit" /> : <Delete />}
        </Fab>
      ) : (
        <Fab
          color="primary"
          aria-label="Hacer la compra"
          onClick={() => navigate(buildPurchasePath())}
          sx={{ position: 'fixed', bottom: { xs: 92, sm: 24 }, right: 24 }}
        >
          <ShoppingCart />
        </Fab>
      )}
    </AvailableProductsWrapper>
  )
}
