import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Add from '@mui/icons-material/Add'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import { useGetRecipesQuery } from '@/services/recipesApi'
import { buildEditRecipePath, paths } from '@/routes/paths'
import {
  CenteredState,
  PageTitle,
  RecipeCard,
  RecipeGrid,
  RecipeName,
  RecipePhoto,
  RecipePhotoPlaceholder,
  RecipesWrapper,
  SearchField,
} from './Recipes.styles'

export const Recipes = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: recipes, isLoading, isError } = useGetRecipesQuery()

  const normalizedSearch = search.trim().toLowerCase()
  const filteredRecipes = recipes?.filter(
    (recipe) =>
      !normalizedSearch ||
      recipe.name.toLowerCase().includes(normalizedSearch) ||
      recipe.description.toLowerCase().includes(normalizedSearch),
  )

  return (
    <RecipesWrapper>
      <PageTitle>Recetas</PageTitle>

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
          {filteredRecipes!.map((recipe) => (
            <RecipeCard key={recipe.id} onClick={() => navigate(buildEditRecipePath(recipe.id), { state: { recipe } })}>
              {recipe.photoUrl ? <RecipePhoto src={recipe.photoUrl} alt={recipe.name} /> : <RecipePhotoPlaceholder />}
              <RecipeName>{recipe.name}</RecipeName>
            </RecipeCard>
          ))}
        </RecipeGrid>
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
