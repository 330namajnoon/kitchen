import { useState } from 'react'
import Add from '@mui/icons-material/Add'
import AutoAwesome from '@mui/icons-material/AutoAwesome'
import Close from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import EditNote from '@mui/icons-material/EditNote'
import QrCodeScanner from '@mui/icons-material/QrCodeScanner'
import Autocomplete from '@mui/material/Autocomplete'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import type { GenericProduct } from '@/types/genericProduct'
import type { Product, QuantityUnit } from '@/types/product'
import type { ShoppingListItemInput } from '@/types/shoppingList'
import {
  EditorWrapper,
  EmptyState,
  ItemBlock,
  ItemList,
  ItemName,
  ItemRow,
  ProductModalInfoLabel,
  ProductModalInfoList,
  ProductModalInfoValue,
  ProductModalName,
  ProductModalPhoto,
  ProductModalPhotoPlaceholder,
  SelectorRow,
  SubProductList,
  SubProductName,
  SubProductPhoto,
  SubProductPhotoButton,
  SubProductPhotoPlaceholder,
  SubProductRow,
} from './ShoppingListItemsEditor.styles'

const QUANTITY_UNIT_LABELS: Record<QuantityUnit, string> = {
  g: 'g',
  ml: 'ml',
  u: 'u',
  tsp: 'cdta',
  tbsp: 'cda',
  pinch: 'pizca',
  cup: 'taza',
}

interface ProductInfoModalProps {
  product: Product | null
  onClose: () => void
}

const ProductInfoModal = ({ product, onClose }: ProductInfoModalProps) => {
  if (!product) return null

  const displayName = product.name || product.description

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ position: 'relative' }}>
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
          size="small"
        >
          <Close fontSize="small" />
        </IconButton>

        {product.photoUrl ? (
          <ProductModalPhoto src={product.photoUrl} alt={displayName} />
        ) : (
          <ProductModalPhotoPlaceholder />
        )}

        <ProductModalName>{displayName}</ProductModalName>

        <ProductModalInfoList>
          {product.name && product.description && (
            <>
              <ProductModalInfoLabel>Descripción</ProductModalInfoLabel>
              <ProductModalInfoValue>{product.description}</ProductModalInfoValue>
            </>
          )}

          <ProductModalInfoLabel>Categoría</ProductModalInfoLabel>
          <ProductModalInfoValue>{product.category}</ProductModalInfoValue>

          {product.quantityAmount && product.quantityUnit && (
            <>
              <ProductModalInfoLabel>Contenido</ProductModalInfoLabel>
              <ProductModalInfoValue>
                {product.quantityAmount} {QUANTITY_UNIT_LABELS[product.quantityUnit]}
              </ProductModalInfoValue>
            </>
          )}

          {typeof product.price === 'number' && (
            <>
              <ProductModalInfoLabel>Precio</ProductModalInfoLabel>
              <ProductModalInfoValue>{product.price.toFixed(2)} €</ProductModalInfoValue>
            </>
          )}

          {product.comment && (
            <>
              <ProductModalInfoLabel>Comentario</ProductModalInfoLabel>
              <ProductModalInfoValue>{product.comment}</ProductModalInfoValue>
            </>
          )}
        </ProductModalInfoList>
      </DialogContent>
    </Dialog>
  )
}

interface QuantityAmountInputProps {
  quantityAmount: number
  onChange: (quantityAmount: number) => void
}

const QuantityAmountInput = ({ quantityAmount, onChange }: QuantityAmountInputProps) => {
  const [text, setText] = useState(String(quantityAmount))

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
        if (text === '') {
          setText(String(quantityAmount))
          return
        }
        setText(String(Number(text)))
      }}
      onFocus={(event) => event.target.select()}
      slotProps={{ htmlInput: { min: 0, step: 'any' } }}
    />
  )
}

type AddProductMethod = 'manual' | 'scan' | 'ai'

interface AddProductMenuProps {
  onSelect: (method: AddProductMethod) => void
}

const AddProductMenu = ({ onSelect }: AddProductMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleSelect = (method: AddProductMethod) => {
    setAnchorEl(null)
    onSelect(method)
  }

  return (
    <>
      <IconButton aria-label="Añadir producto" color="primary" onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Add />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleSelect('manual')}>
          <EditNote fontSize="small" sx={{ mr: 1 }} /> Añadir a mano
        </MenuItem>
        <MenuItem onClick={() => handleSelect('scan')}>
          <QrCodeScanner fontSize="small" sx={{ mr: 1 }} /> Escanear código de barras
        </MenuItem>
        <MenuItem onClick={() => handleSelect('ai')}>
          <AutoAwesome fontSize="small" sx={{ mr: 1 }} /> Detectar con IA
        </MenuItem>
      </Menu>
    </>
  )
}

interface ShoppingListItemsEditorProps {
  items: ShoppingListItemInput[]
  genericProducts: GenericProduct[]
  products: Product[]
  onChange: (items: ShoppingListItemInput[]) => void
  onCreateGenericProduct: () => void
  onAddProduct: (genericProductId: number, method: AddProductMethod) => void
}

export const ShoppingListItemsEditor = ({
  items,
  genericProducts,
  products,
  onChange,
  onCreateGenericProduct,
  onAddProduct,
}: ShoppingListItemsEditorProps) => {
  const [inputValue, setInputValue] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)

  const availableProducts = genericProducts.filter(
    (product) => !items.some((item) => item.genericProductId === product.id),
  )

  const updateItem = (genericProductId: number, changes: Partial<ShoppingListItemInput>) => {
    onChange(items.map((item) => (item.genericProductId === genericProductId ? { ...item, ...changes } : item)))
  }

  const handleAdd = (product: GenericProduct | null) => {
    if (!product) return
    onChange([...items, { genericProductId: product.id, quantityAmount: 1, quantityUnit: 'g' }])
    setInputValue('')
  }

  const handleRemove = (genericProductId: number) => {
    onChange(items.filter((item) => item.genericProductId !== genericProductId))
  }

  const toggleSelectedProduct = (productId: number) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    )
  }

  return (
    <EditorWrapper>
      <SelectorRow>
        <Autocomplete
          options={availableProducts}
          getOptionLabel={(option) => option.name}
          value={null}
          inputValue={inputValue}
          onInputChange={(_event, value, reason) => {
            if (reason !== 'reset') setInputValue(value)
          }}
          onChange={(_event, value) => handleAdd(value)}
          renderInput={(params) => <TextField {...params} label="Añadir producto" placeholder="Buscar producto genérico" />}
        />
        <IconButton aria-label="Crear producto genérico" color="primary" onClick={onCreateGenericProduct}>
          <Add />
        </IconButton>
      </SelectorRow>

      {items.length === 0 && <EmptyState>Todavía no has añadido productos.</EmptyState>}

      {items.length > 0 && (
        <ItemList>
          {items.map((item) => {
            const product = genericProducts.find((generic) => generic.id === item.genericProductId)
            const associatedProducts = products.filter((candidate) => candidate.genericProductId === item.genericProductId)

            return (
              <ItemBlock key={item.genericProductId}>
                <ItemRow>
                  <ItemName>{product?.name ?? 'Producto desconocido'}</ItemName>
                  <QuantityAmountInput
                    quantityAmount={item.quantityAmount}
                    onChange={(quantityAmount) => updateItem(item.genericProductId, { quantityAmount })}
                  />
                  <TextField
                    select
                    size="small"
                    label="Unidad"
                    value={item.quantityUnit}
                    onChange={(event) => updateItem(item.genericProductId, { quantityUnit: event.target.value as QuantityUnit })}
                  >
                    <MenuItem value="g">g</MenuItem>
                    <MenuItem value="ml">ml</MenuItem>
                    <MenuItem value="u">u</MenuItem>
                    <MenuItem value="tsp">tsp</MenuItem>
                    <MenuItem value="tbsp">tbsp</MenuItem>
                    <MenuItem value="pinch">pinch</MenuItem>
                    <MenuItem value="cup">cup</MenuItem>
                  </TextField>
                  <AddProductMenu onSelect={(method) => onAddProduct(item.genericProductId, method)} />
                  <IconButton aria-label="Quitar producto" onClick={() => handleRemove(item.genericProductId)}>
                    <Delete />
                  </IconButton>
                </ItemRow>

                {associatedProducts.length > 0 && (
                  <SubProductList>
                    {associatedProducts.map((associatedProduct) => {
                      const displayName = associatedProduct.name || associatedProduct.description
                      return (
                        <SubProductRow key={associatedProduct.id}>
                          <Checkbox
                            size="small"
                            checked={selectedProductIds.includes(associatedProduct.id)}
                            onChange={() => toggleSelectedProduct(associatedProduct.id)}
                            slotProps={{ input: { 'aria-label': `Seleccionar ${displayName}` } }}
                          />
                          <SubProductPhotoButton
                            type="button"
                            aria-label={`Ver información de ${displayName}`}
                            onClick={() => setPreviewProduct(associatedProduct)}
                          >
                            {associatedProduct.photoUrl ? (
                              <SubProductPhoto src={associatedProduct.photoUrl} alt={displayName} />
                            ) : (
                              <SubProductPhotoPlaceholder />
                            )}
                          </SubProductPhotoButton>
                          <SubProductName>{displayName}</SubProductName>
                        </SubProductRow>
                      )
                    })}
                  </SubProductList>
                )}
              </ItemBlock>
            )
          })}
        </ItemList>
      )}

      <ProductInfoModal product={previewProduct} onClose={() => setPreviewProduct(null)} />
    </EditorWrapper>
  )
}
