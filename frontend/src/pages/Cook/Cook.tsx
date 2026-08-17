import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { useGetAvailableProductsQuery } from '@/services/availableProductsApi'
import { useCookMealsMutation } from '@/services/cookedMealsApi'
import { useGetRecipesQuery } from '@/services/recipesApi'
import { ADD_SHOPPING_LIST_DRAFT_KEY } from '@/constants/storageKeys'
import { buildCookedMealDetailPath, paths } from '@/routes/paths'
import type { QuantityUnit } from '@/types/product'
import type { ShoppingListItemInput } from '@/types/shoppingList'
import {
  ButtonsRow,
  CenteredState,
  CookWrapper,
  EmptyState,
  ItemAmount,
  ItemList,
  ItemMainRow,
  ItemName,
  ItemNote,
  ItemRow,
  ItemWarning,
  PageTitle,
  RecipeSummary,
  SectionTitle,
  ServingsField,
} from './Cook.styles'

interface RequiredItem {
  genericProductId: number
  name: string
  quantityAmount: number
  quantityUnit: QuantityUnit
  /** Hay algún producto disponible de este genérico, en cualquier unidad (percentageRemaining > 0). */
  hasStock: boolean
  /** Suma disponible solo entre los productos comprados en la MISMA unidad que pide la receta —
   * es lo único que se puede comparar con `quantityAmount` sin inventar una conversión (g/ml de
   * comida no se convierte de forma fiable a "u"/tbsp/tsp/pinch/cup). */
  matchedAvailableAmount: number
  /** Tiene stock, pero comprado en una unidad distinta a la de la receta: no se puede saber si
   * alcanza o no, así que no se muestra ningún aviso de cantidad para este ingrediente. */
  unitMismatch: boolean
}

const parseRecipeIds = (raw: string | null) =>
  raw
    ? raw
        .split(',')
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value))
    : []

/** "400" para enteros, "133.33" para decimales, sin ceros de relleno. */
const formatAmount = (value: number) => {
  const rounded = Math.round(value * 100) / 100
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

interface ServingsInputProps {
  defaultServings: number
  onChange: (servings: number) => void
}

/** Mismo patrón que QuantityInput (Purchase) / QuantityAmountInput (RecipeIngredientsEditor):
 * estado de texto local inicializado directamente desde la prop, sin efecto — el componente solo
 * se monta cuando `defaultServings` ya es un valor definitivo (recetas cargadas). */
const ServingsInput = ({ defaultServings, onChange }: ServingsInputProps) => {
  const [text, setText] = useState(String(defaultServings))

  return (
    <TextField
      type="number"
      label="Cantidad de platos"
      value={text}
      onChange={(event) => {
        const value = event.target.value
        setText(value)
        if (value !== '' && Number(value) > 0) onChange(Number(value))
      }}
      onBlur={() => {
        if (text === '' || Number(text) <= 0) {
          setText(String(defaultServings))
          onChange(defaultServings)
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

export const Cook = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const recipeIds = useMemo(() => parseRecipeIds(searchParams.get('recipeIds')), [searchParams])

  const { data: recipes, isLoading: isLoadingRecipes, isError: isRecipesError } = useGetRecipesQuery()
  const { data: availableProducts, isLoading: isLoadingAvailable } = useGetAvailableProductsQuery()
  const [cookMeals, { isLoading: isCooking }] = useCookMealsMutation()

  const selectedRecipes = useMemo(() => recipes?.filter((recipe) => recipeIds.includes(recipe.id)) ?? [], [recipes, recipeIds])

  // Base de la escala: la suma de las raciones por defecto de cada receta seleccionada (1 si una
  // receta no tiene raciones definidas). Un único campo de "cantidad de platos" reescala todos los
  // ingredientes de todas las recetas por igual, en proporción a esa suma.
  const defaultServings = useMemo(
    () => Math.max(1, selectedRecipes.reduce((sum, recipe) => sum + (recipe.servings ?? 1), 0)),
    [selectedRecipes],
  )

  const [servings, setServings] = useState<number | null>(null)
  const factor = servings === null ? 1 : servings / defaultServings

  const requiredItems = useMemo<RequiredItem[]>(() => {
    const byKey = new Map<string, RequiredItem>()

    selectedRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const key = `${ingredient.genericProductId}-${ingredient.quantityUnit}`
        const scaledAmount = ingredient.quantityAmount * factor
        const existing = byKey.get(key)
        if (existing) {
          existing.quantityAmount += scaledAmount
          return
        }

        const matchingAvailableProducts = (availableProducts ?? []).filter(
          (availableProduct) =>
            availableProduct.product.genericProductId === ingredient.genericProductId && availableProduct.percentageRemaining > 0,
        )
        const hasStock = matchingAvailableProducts.length > 0
        const sameUnitProducts = matchingAvailableProducts.filter(
          (availableProduct) => availableProduct.product.quantityUnit === ingredient.quantityUnit && availableProduct.product.quantityAmount != null,
        )
        const matchedAvailableAmount = sameUnitProducts.reduce(
          (sum, availableProduct) =>
            sum + (availableProduct.product.quantityAmount! * availableProduct.quantity * availableProduct.percentageRemaining) / 100,
          0,
        )

        byKey.set(key, {
          genericProductId: ingredient.genericProductId,
          name: ingredient.genericProduct.name,
          quantityAmount: scaledAmount,
          quantityUnit: ingredient.quantityUnit,
          hasStock,
          matchedAvailableAmount,
          unitMismatch: hasStock && sameUnitProducts.length === 0,
        })
      })
    })

    return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [selectedRecipes, factor, availableProducts])

  const availableItems = requiredItems.filter((item) => item.hasStock)
  const missingItems = requiredItems.filter((item) => !item.hasStock)
  const missingAmountOf = (item: RequiredItem) => (item.unitMismatch ? 0 : Math.max(0, item.quantityAmount - item.matchedAvailableAmount))
  const hasMissingAmount = requiredItems.some((item) => !item.hasStock || missingAmountOf(item) > 0)

  // Snapshot por receta (no fusionado como `requiredItems`) para el histórico de "cocinadas": cada
  // receta seleccionada se registra como una comida cocinada independiente, con sus propios
  // platos e ingredientes ya escalados por el mismo factor.
  const mealsToCook = useMemo(
    () =>
      selectedRecipes.map((recipe) => ({
        recipeId: recipe.id,
        servings: Math.max(1, Math.round((recipe.servings ?? 1) * factor)),
        ingredients: recipe.ingredients.map((ingredient) => ({
          genericProductId: ingredient.genericProductId,
          quantityAmount: ingredient.quantityAmount * factor,
          quantityUnit: ingredient.quantityUnit,
        })),
      })),
    [selectedRecipes, factor],
  )

  const handleCook = async () => {
    try {
      const createdMeals = await cookMeals({ meals: mealsToCook }).unwrap()
      if (createdMeals.length === 1) {
        navigate(buildCookedMealDetailPath(createdMeals[0].id), { state: { cookedMeal: createdMeals[0] } })
      } else {
        navigate(paths.cookedMeals)
      }
    } catch {
      // el error se ignora, el usuario puede reintentar desde esta misma pantalla
    }
  }

  const handleBuyMissing = () => {
    const items: ShoppingListItemInput[] = requiredItems
      .map((item) => ({
        genericProductId: item.genericProductId,
        quantityAmount: Math.round(missingAmountOf(item) * 100) / 100,
        quantityUnit: item.quantityUnit,
      }))
      .filter((item) => item.quantityAmount > 0)

    sessionStorage.setItem(ADD_SHOPPING_LIST_DRAFT_KEY, JSON.stringify({ items }))
    navigate(paths.addShoppingList)
  }

  const isLoading = isLoadingRecipes || isLoadingAvailable

  if (recipeIds.length === 0) {
    return (
      <CookWrapper>
        <PageTitle>Cocinar</PageTitle>
        <CenteredState>No se ha seleccionado ninguna receta.</CenteredState>
      </CookWrapper>
    )
  }

  return (
    <CookWrapper>
      <PageTitle>Cocinar</PageTitle>

      {isLoading && (
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      )}

      {!isLoading && isRecipesError && <CenteredState>No se han podido cargar las recetas.</CenteredState>}

      {!isLoading && !isRecipesError && (
        <>
          {selectedRecipes.length > 0 && <RecipeSummary>{selectedRecipes.map((recipe) => recipe.name).join(', ')}</RecipeSummary>}

          <ServingsField>
            <ServingsInput defaultServings={defaultServings} onChange={setServings} />
          </ServingsField>

          <SectionTitle>Disponibles</SectionTitle>
          {availableItems.length === 0 && <EmptyState>Ninguno de los ingredientes necesarios está disponible.</EmptyState>}
          {availableItems.length > 0 && (
            <ItemList>
              {availableItems.map((item) => {
                const missingAmount = missingAmountOf(item)
                return (
                  <ItemRow key={`${item.genericProductId}-${item.quantityUnit}`} $missing={missingAmount > 0}>
                    <ItemMainRow>
                      <ItemName>{item.name}</ItemName>
                      <ItemAmount>
                        {formatAmount(item.quantityAmount)} {item.quantityUnit}
                      </ItemAmount>
                    </ItemMainRow>
                    {missingAmount > 0 && (
                      <ItemWarning>
                        Te faltan {formatAmount(missingAmount)} {item.quantityUnit}
                      </ItemWarning>
                    )}
                    {item.unitMismatch && (
                      <ItemNote>Lo tienes comprado en otra unidad, no se puede comparar la cantidad exacta</ItemNote>
                    )}
                  </ItemRow>
                )
              })}
            </ItemList>
          )}

          <SectionTitle>No disponibles</SectionTitle>
          {missingItems.length === 0 && <EmptyState>No falta ningún ingrediente por completo.</EmptyState>}
          {missingItems.length > 0 && (
            <ItemList>
              {missingItems.map((item) => (
                <ItemRow key={`${item.genericProductId}-${item.quantityUnit}`} $missing>
                  <ItemMainRow>
                    <ItemName>{item.name}</ItemName>
                    <ItemAmount>
                      {formatAmount(item.quantityAmount)} {item.quantityUnit}
                    </ItemAmount>
                  </ItemMainRow>
                </ItemRow>
              ))}
            </ItemList>
          )}

          <ButtonsRow>
            <Button type="button" variant="contained" fullWidth disabled={isCooking} onClick={handleCook}>
              {isCooking ? <CircularProgress size={24} /> : 'A cocinar'}
            </Button>
            <Button type="button" variant="outlined" fullWidth disabled={!hasMissingAmount} onClick={handleBuyMissing}>
              A comprar
            </Button>
          </ButtonsRow>
        </>
      )}
    </CookWrapper>
  )
}
