import { useState } from 'react'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Autocomplete from '@mui/material/Autocomplete'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import type { GenericProduct } from '@/types/genericProduct'
import type { QuantityUnit } from '@/types/product'
import type { ShoppingListItemInput } from '@/types/shoppingList'
import { EditorWrapper, EmptyState, ItemList, ItemName, ItemRow, SelectorRow } from './ShoppingListItemsEditor.styles'

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

interface ShoppingListItemsEditorProps {
  items: ShoppingListItemInput[]
  genericProducts: GenericProduct[]
  onChange: (items: ShoppingListItemInput[]) => void
  onCreateGenericProduct: () => void
}

export const ShoppingListItemsEditor = ({
  items,
  genericProducts,
  onChange,
  onCreateGenericProduct,
}: ShoppingListItemsEditorProps) => {
  const [inputValue, setInputValue] = useState('')

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
            return (
              <ItemRow key={item.genericProductId}>
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
                <IconButton aria-label="Quitar producto" onClick={() => handleRemove(item.genericProductId)}>
                  <Delete />
                </IconButton>
              </ItemRow>
            )
          })}
        </ItemList>
      )}
    </EditorWrapper>
  )
}
