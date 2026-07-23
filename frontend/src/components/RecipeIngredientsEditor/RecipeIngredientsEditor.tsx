import { useState } from 'react'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import Autocomplete from '@mui/material/Autocomplete'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import type { GenericProduct } from '@/types/genericProduct'
import type { QuantityUnit } from '@/types/product'
import type { RecipeIngredientInput } from '@/types/recipe'
import { EditorWrapper, EmptyState, IngredientList, IngredientName, IngredientRow, SelectorRow } from './RecipeIngredientsEditor.styles'

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

interface RecipeIngredientsEditorProps {
  ingredients: RecipeIngredientInput[]
  genericProducts: GenericProduct[]
  onChange: (ingredients: RecipeIngredientInput[]) => void
  onCreateGenericProduct: () => void
}

export const RecipeIngredientsEditor = ({
  ingredients,
  genericProducts,
  onChange,
  onCreateGenericProduct,
}: RecipeIngredientsEditorProps) => {
  const [inputValue, setInputValue] = useState('')

  const availableProducts = genericProducts.filter(
    (product) => !ingredients.some((ingredient) => ingredient.genericProductId === product.id),
  )

  const updateIngredient = (genericProductId: number, changes: Partial<RecipeIngredientInput>) => {
    onChange(
      ingredients.map((ingredient) =>
        ingredient.genericProductId === genericProductId ? { ...ingredient, ...changes } : ingredient,
      ),
    )
  }

  const handleAdd = (product: GenericProduct | null) => {
    if (!product) return
    onChange([...ingredients, { genericProductId: product.id, quantityAmount: 1, quantityUnit: 'g' }])
    setInputValue('')
  }

  const handleRemove = (genericProductId: number) => {
    onChange(ingredients.filter((ingredient) => ingredient.genericProductId !== genericProductId))
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
          renderInput={(params) => <TextField {...params} label="Añadir ingrediente" placeholder="Buscar producto genérico" />}
        />
        <IconButton aria-label="Crear producto genérico" color="primary" onClick={onCreateGenericProduct}>
          <Add />
        </IconButton>
      </SelectorRow>

      {ingredients.length === 0 && <EmptyState>Todavía no has añadido ingredientes.</EmptyState>}

      {ingredients.length > 0 && (
        <IngredientList>
          {ingredients.map((ingredient) => {
            const product = genericProducts.find((item) => item.id === ingredient.genericProductId)
            return (
              <IngredientRow key={ingredient.genericProductId}>
                <IngredientName>{product?.name ?? 'Producto desconocido'}</IngredientName>
                <QuantityAmountInput
                  quantityAmount={ingredient.quantityAmount}
                  onChange={(quantityAmount) => updateIngredient(ingredient.genericProductId, { quantityAmount })}
                />
                <TextField
                  select
                  size="small"
                  label="Unidad"
                  value={ingredient.quantityUnit}
                  onChange={(event) =>
                    updateIngredient(ingredient.genericProductId, { quantityUnit: event.target.value as QuantityUnit })
                  }
                >
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="u">u</MenuItem>
                </TextField>
                <IconButton aria-label="Quitar ingrediente" onClick={() => handleRemove(ingredient.genericProductId)}>
                  <Delete />
                </IconButton>
              </IngredientRow>
            )
          })}
        </IngredientList>
      )}
    </EditorWrapper>
  )
}
