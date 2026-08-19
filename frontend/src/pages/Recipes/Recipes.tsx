import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Add from '@mui/icons-material/Add'
import Close from '@mui/icons-material/Close'
import ShoppingCart from '@mui/icons-material/ShoppingCart'
import SoupKitchen from '@mui/icons-material/SoupKitchen'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { useLongPress } from '@/hooks/useLongPress'
import { useGetRecipesQuery } from '@/services/recipesApi'
import { buildAddShoppingListPath, buildCookPath, buildEditRecipePath, paths } from '@/routes/paths'
import {
  CenteredState,
  PageTitle,
  RecipeCard,
  RecipeGrid,
  RecipeName,
  RecipePhoto,
  RecipePhotoPlaceholder,
  RecipesWrapper,
  RecipeSelectedBadge,
  SearchField,
  SelectionBar,
} from './Recipes.styles'

export const Recipes = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const { data: recipes, isLoading, isError } = useGetRecipesQuery()

  const isSelecting = selectedIds.length > 0

  const normalizedSearch = search.trim().toLowerCase()
  const filteredRecipes = recipes?.filter(
    (recipe) =>
      !normalizedSearch ||
      recipe.name.toLowerCase().includes(normalizedSearch) ||
      recipe.description.toLowerCase().includes(normalizedSearch),
  )

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]))
  }

  const { getHandlers, wasTriggered } = useLongPress<number>(toggleSelected)

  const handleCardClick = (recipe: NonNullable<typeof recipes>[number]) => {
    if (wasTriggered()) {
      return
    }

    if (isSelecting) {
      toggleSelected(recipe.id)
      return
    }

    navigate(buildEditRecipePath(recipe.id), { state: { recipe } })
  }

  const handlePrepare = () => {
    navigate(buildCookPath(selectedIds))
  }

  const handleGoToShoppingList = () => {
    navigate(buildAddShoppingListPath(selectedIds))
  }

  return (
    <RecipesWrapper>
      {isSelecting ? (
        <SelectionBar>
          <IconButton aria-label="Cancelar selección" onClick={() => setSelectedIds([])}>
            <Close />
          </IconButton>
          {selectedIds.length} seleccionada{selectedIds.length === 1 ? '' : 's'}
        </SelectionBar>
      ) : (
        <PageTitle>Recetas</PageTitle>
      )}

      {!isLoading && !isError && (recipes?.length ?? 0) > 0 && (
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

      {isError && <CenteredState>No se han podido cargar las recetas.</CenteredState>}

      {!isLoading && !isError && recipes?.length === 0 && <CenteredState>Todavía no hay recetas. Crea la primera.</CenteredState>}

      {!isLoading && !isError && (recipes?.length ?? 0) > 0 && filteredRecipes?.length === 0 && (
        <CenteredState>No se ha encontrado ninguna receta con ese término.</CenteredState>
      )}

      {!isLoading && !isError && (filteredRecipes?.length ?? 0) > 0 && (
        <RecipeGrid>
          {filteredRecipes!.map((recipe) => {
            const selected = selectedIds.includes(recipe.id)

            return (
              <RecipeCard
                key={recipe.id}
                $selected={selected}
                onClick={() => handleCardClick(recipe)}
                {...getHandlers(recipe.id)}
              >
                {recipe.photoUrl ? <RecipePhoto src={recipe.photoUrl} alt={recipe.name} /> : <RecipePhotoPlaceholder />}
                <RecipeName>{recipe.name}</RecipeName>
                {selected && <RecipeSelectedBadge>✓</RecipeSelectedBadge>}
              </RecipeCard>
            )
          })}
        </RecipeGrid>
      )}

      {isSelecting && (
        <>
          <Fab
            color="secondary"
            aria-label="Preparar recetas seleccionadas"
            onClick={handlePrepare}
            sx={{ position: 'fixed', bottom: { xs: 220, sm: 152 }, right: 24 }}
          >
            <SoupKitchen />
          </Fab>

          <Fab
            color="secondary"
            aria-label="Ir a la lista de la compra"
            onClick={handleGoToShoppingList}
            sx={{ position: 'fixed', bottom: { xs: 156, sm: 88 }, right: 24 }}
          >
            <ShoppingCart />
          </Fab>
        </>
      )}

      <Fab
        color="primary"
        aria-label="Añadir receta"
        onClick={() => navigate(paths.addRecipe)}
        sx={{ position: 'fixed', bottom: { xs: 92, sm: 24 }, right: 24 }}
      >
        <Add />
      </Fab>
    </RecipesWrapper>
  )
}
