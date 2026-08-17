import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Rating from '@mui/material/Rating'
import TextField from '@mui/material/TextField'
import { useGetCookedMealsQuery } from '@/services/cookedMealsApi'
import { buildCookedMealDetailPath } from '@/routes/paths'
import {
  CenteredState,
  CookedMealsWrapper,
  DateRangeRow,
  MealCard,
  MealDate,
  MealGrid,
  MealName,
  MealPhoto,
  MealPhotoPlaceholder,
  PageTitle,
  SearchField,
} from './CookedMeals.styles'

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString('es-ES')

export const CookedMeals = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { data: cookedMeals, isLoading, isError } = useGetCookedMealsQuery()

  const normalizedSearch = search.trim().toLowerCase()
  const filteredMeals = cookedMeals?.filter((meal) => {
    if (normalizedSearch && !meal.recipe.name.toLowerCase().includes(normalizedSearch)) return false
    const cookedDate = meal.cookedAt.slice(0, 10)
    if (startDate && cookedDate < startDate) return false
    if (endDate && cookedDate > endDate) return false
    return true
  })

  return (
    <CookedMealsWrapper>
      <PageTitle>Cocinadas</PageTitle>

      {!isLoading && !isError && (cookedMeals?.length ?? 0) > 0 && (
        <>
          <SearchField>
            <TextField
              label="Buscar por nombre"
              placeholder="Buscar por nombre de receta"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
          </SearchField>

          <DateRangeRow>
            <TextField
              type="date"
              label="Desde"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              type="date"
              label="Hasta"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </DateRangeRow>
        </>
      )}

      {isLoading && (
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      )}

      {isError && <CenteredState>No se han podido cargar las comidas cocinadas.</CenteredState>}

      {!isLoading && !isError && cookedMeals?.length === 0 && (
        <CenteredState>Todavía no has cocinado ninguna receta.</CenteredState>
      )}

      {!isLoading && !isError && (cookedMeals?.length ?? 0) > 0 && filteredMeals?.length === 0 && (
        <CenteredState>No se ha encontrado ninguna comida con esos filtros.</CenteredState>
      )}

      {!isLoading && !isError && (filteredMeals?.length ?? 0) > 0 && (
        <MealGrid>
          {filteredMeals!.map((meal) => (
            <MealCard key={meal.id} type="button" onClick={() => navigate(buildCookedMealDetailPath(meal.id), { state: { cookedMeal: meal } })}>
              {meal.recipe.photoUrl ? (
                <MealPhoto src={meal.recipe.photoUrl} alt={meal.recipe.name} />
              ) : (
                <MealPhotoPlaceholder />
              )}
              <MealName>{meal.recipe.name}</MealName>
              <MealDate>{formatDate(meal.cookedAt)}</MealDate>
              {meal.rating !== null && <Rating value={meal.rating} max={5} size="small" readOnly />}
            </MealCard>
          ))}
        </MealGrid>
      )}
    </CookedMealsWrapper>
  )
}
