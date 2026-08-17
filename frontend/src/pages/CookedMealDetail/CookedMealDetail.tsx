import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Rating from '@mui/material/Rating'
import { useGetCookedMealQuery, useUpdateCookedMealRatingMutation } from '@/services/cookedMealsApi'
import { paths } from '@/routes/paths'
import type { CookedMeal } from '@/types/cookedMeal'
import {
  CenteredState,
  CookedMealDetailWrapper,
  DetailLabel,
  DetailRow,
  DetailsList,
  DetailValue,
  IngredientAmount,
  IngredientList,
  IngredientName,
  IngredientRow,
  MealHeader,
  MealInfo,
  MealName,
  MealPhoto,
  MealPhotoPlaceholder,
  RatingRow,
  SectionTitle,
} from './CookedMealDetail.styles'

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString('es-ES')

/** "400" para enteros, "133.33" para decimales, sin ceros de relleno. */
const formatAmount = (value: number) => {
  const rounded = Math.round(value * 100) / 100
  if (Number.isInteger(rounded)) return String(rounded)
  return rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

interface MealRatingProps {
  cookedMealId: number
  initialRating: number | null
}

/** Estado local inicializado desde la prop, sin efecto — solo se monta una vez `cookedMeal` es
 * definitivo (ver guardas de carga/error en el componente padre), así que `initialRating` nunca
 * está desactualizado. Es el único campo editable de una comida cocinada: guarda al vuelo, sin
 * botón de guardar, igual que el slider de "Cantidad restante" en AvailableProductDetail. */
const MealRating = ({ cookedMealId, initialRating }: MealRatingProps) => {
  const [rating, setRating] = useState(initialRating)
  const [updateRating, { isLoading: isSaving }] = useUpdateCookedMealRatingMutation()

  const handleChange = async (value: number | null) => {
    const previous = rating
    setRating(value)
    try {
      await updateRating({ id: cookedMealId, rating: value }).unwrap()
    } catch {
      setRating(previous)
    }
  }

  return (
    <RatingRow>
      <Rating value={rating} onChange={(_event, value) => handleChange(value)} size="large" />
      {isSaving && <CircularProgress size={16} />}
    </RatingRow>
  )
}

export const CookedMealDetail = () => {
  const { id = '' } = useParams<{ id: string }>()
  const cookedMealId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const cookedMealFromState = (location.state as { cookedMeal?: CookedMeal } | null)?.cookedMeal

  const { data: fetchedCookedMeal, isLoading, isError } = useGetCookedMealQuery(cookedMealId, {
    skip: Boolean(cookedMealFromState),
  })

  const cookedMeal = cookedMealFromState ?? fetchedCookedMeal

  if (!Number.isInteger(cookedMealId)) {
    return (
      <CookedMealDetailWrapper>
        <CenteredState>
          <p>Comida cocinada no válida.</p>
          <Button variant="contained" onClick={() => navigate(paths.cookedMeals)}>
            Volver a cocinadas
          </Button>
        </CenteredState>
      </CookedMealDetailWrapper>
    )
  }

  if (!cookedMealFromState && isLoading) {
    return (
      <CookedMealDetailWrapper>
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      </CookedMealDetailWrapper>
    )
  }

  if (!cookedMeal || (!cookedMealFromState && isError)) {
    return (
      <CookedMealDetailWrapper>
        <CenteredState>
          <p>No se ha encontrado la comida cocinada.</p>
          <Button variant="contained" onClick={() => navigate(paths.cookedMeals)}>
            Volver a cocinadas
          </Button>
        </CenteredState>
      </CookedMealDetailWrapper>
    )
  }

  const { recipe } = cookedMeal

  return (
    <CookedMealDetailWrapper>
      <MealHeader>
        {recipe.photoUrl ? <MealPhoto src={recipe.photoUrl} alt={recipe.name} /> : <MealPhotoPlaceholder />}
        <MealInfo>
          <MealName>{recipe.name}</MealName>
        </MealInfo>
      </MealHeader>

      <DetailsList>
        {recipe.description && (
          <DetailRow>
            <DetailLabel>Descripción</DetailLabel>
            <DetailValue>{recipe.description}</DetailValue>
          </DetailRow>
        )}

        <DetailRow>
          <DetailLabel>Fecha</DetailLabel>
          <DetailValue>{formatDate(cookedMeal.cookedAt)}</DetailValue>
        </DetailRow>

        <DetailRow>
          <DetailLabel>Cantidad de platos</DetailLabel>
          <DetailValue>{cookedMeal.servings}</DetailValue>
        </DetailRow>
      </DetailsList>

      <SectionTitle>Ingredientes usados</SectionTitle>
      <IngredientList>
        {cookedMeal.ingredients.map((ingredient) => (
          <IngredientRow key={ingredient.id}>
            <IngredientName>{ingredient.genericProduct.name}</IngredientName>
            <IngredientAmount>
              {formatAmount(ingredient.quantityAmount)} {ingredient.quantityUnit}
            </IngredientAmount>
          </IngredientRow>
        ))}
      </IngredientList>

      <SectionTitle>Tu valoración</SectionTitle>
      <MealRating cookedMealId={cookedMeal.id} initialRating={cookedMeal.rating} />
    </CookedMealDetailWrapper>
  )
}
