import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Delete from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { useAddAvailableProductsMutation } from '@/services/availableProductsApi'
import { useGetProductsQuery } from '@/services/productsApi'
import { paths } from '@/routes/paths'
import {
  EmptyState,
  ItemFieldsColumn,
  ItemList,
  ItemName,
  ItemPhoto,
  ItemPhotoPlaceholder,
  ItemRow,
  PageTitle,
  PurchaseWrapper,
  SearchField,
  SearchResultButton,
  SearchResults,
} from './Purchase.styles'

interface PurchaseItem {
  productId: number
  quantity: number
  expirationDate: string
}

interface ExpirationDateInputProps {
  expirationDate: string
  onChange: (expirationDate: string) => void
}

const ExpirationDateInput = ({ expirationDate, onChange }: ExpirationDateInputProps) => (
  <TextField
    type="date"
    size="small"
    label="Caducidad (opcional)"
    value={expirationDate}
    onChange={(event) => onChange(event.target.value)}
    slotProps={{ inputLabel: { shrink: true } }}
    fullWidth
  />
)

interface QuantityInputProps {
  quantity: number
  onChange: (quantity: number) => void
}

const QuantityInput = ({ quantity, onChange }: QuantityInputProps) => {
  const [text, setText] = useState(String(quantity))

  return (
    <TextField
      type="number"
      size="small"
      label="Cantidad"
      value={text}
      onChange={(event) => {
        const value = event.target.value
        setText(value)
        if (value !== '') onChange(Number(value))
      }}
      onBlur={() => {
        if (text === '' || Number(text) <= 0) {
          setText(String(quantity))
          return
        }
        setText(String(Number(text)))
      }}
      onFocus={(event) => event.target.select()}
      slotProps={{ htmlInput: { min: 1, step: 1 } }}
      fullWidth
    />
  )
}

const parseProductIds = (raw: string | null) =>
  raw
    ? raw
        .split(',')
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value))
    : []

export const Purchase = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>(() =>
    parseProductIds(searchParams.get('productIds')).map((productId) => ({ productId, quantity: 1, expirationDate: '' })),
  )
  const { data: products } = useGetProductsQuery()
  const [addAvailableProducts, { isLoading: isSaving }] = useAddAvailableProductsMutation()

  const normalizedSearch = search.trim().toLowerCase()
  const searchResults =
    normalizedSearch && products
      ? products
          .filter((product) => !items.some((item) => item.productId === product.id))
          .filter((product) => (product.name || product.description).toLowerCase().includes(normalizedSearch))
      : []

  const handleAddProduct = (productId: number) => {
    setItems((current) => [...current, { productId, quantity: 1, expirationDate: '' }])
    setSearch('')
  }

  const handleRemoveItem = (productId: number) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }

  const handleQuantityChange = (productId: number, quantity: number) => {
    setItems((current) => current.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const handleExpirationDateChange = (productId: number, expirationDate: string) => {
    setItems((current) => current.map((item) => (item.productId === productId ? { ...item, expirationDate } : item)))
  }

  const handlePurchase = async () => {
    try {
      await addAvailableProducts({
        items: items.map(({ productId, quantity, expirationDate }) => ({
          productId,
          quantity,
          expirationDate: expirationDate || undefined,
        })),
      }).unwrap()
      navigate(paths.availableProducts)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  return (
    <PurchaseWrapper>
      <PageTitle>Comprar</PageTitle>

      <SearchField>
        <TextField
          label="Buscar producto"
          placeholder="Buscar por nombre o descripción"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />
      </SearchField>

      {searchResults.length > 0 && (
        <SearchResults>
          {searchResults.map((product) => {
            const displayName = product.name || product.description
            return (
              <SearchResultButton key={product.id} type="button" onClick={() => handleAddProduct(product.id)}>
                {product.photoUrl ? <ItemPhoto src={product.photoUrl} alt={displayName} /> : <ItemPhotoPlaceholder />}
                <ItemName>{displayName}</ItemName>
              </SearchResultButton>
            )
          })}
        </SearchResults>
      )}

      {items.length === 0 && <EmptyState>Todavía no has añadido productos a la compra.</EmptyState>}

      {items.length > 0 && (
        <ItemList>
          {items.map((item) => {
            const product = products?.find((candidate) => candidate.id === item.productId)
            const displayName = product ? product.name || product.description : 'Producto desconocido'

            return (
              <ItemRow key={item.productId}>
                {product?.photoUrl ? <ItemPhoto src={product.photoUrl} alt={displayName} /> : <ItemPhotoPlaceholder />}
                <ItemName>{displayName}</ItemName>
                <ItemFieldsColumn>
                  <QuantityInput
                    quantity={item.quantity}
                    onChange={(quantity) => handleQuantityChange(item.productId, quantity)}
                  />
                  <ExpirationDateInput
                    expirationDate={item.expirationDate}
                    onChange={(expirationDate) => handleExpirationDateChange(item.productId, expirationDate)}
                  />
                </ItemFieldsColumn>
                <IconButton aria-label="Quitar producto" onClick={() => handleRemoveItem(item.productId)}>
                  <Delete />
                </IconButton>
              </ItemRow>
            )
          })}
        </ItemList>
      )}

      <Button type="button" variant="contained" fullWidth disabled={items.length === 0 || isSaving} onClick={handlePurchase}>
        {isSaving ? <CircularProgress size={24} /> : 'Comprar'}
      </Button>
    </PurchaseWrapper>
  )
}
