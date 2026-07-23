import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { ButtonsRow } from '@/components/RecipeForm/RecipeForm.styles'
import { RecipeForm } from '@/components/RecipeForm'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { useDeleteRecipeMutation, useGetRecipesQuery, useUpdateRecipeMutation, useUploadRecipePhotoMutation } from '@/services/recipesApi'
import { paths } from '@/routes/paths'
import type { Recipe, RecipeFormValues } from '@/types/recipe'
import { CenteredState, EditRecipeWrapper, PageTitle } from './EditRecipe.styles'

const DRAFT_STORAGE_KEY = 'kitchen:editRecipeDraft'

const validationSchema = yup.object({
  name: yup.string().trim().required('El nombre es obligatorio'),
  description: yup.string().trim().required('La descripción es obligatoria'),
  photoUrl: yup.string(),
  ingredients: yup.array().min(1, 'Añade al menos un ingrediente'),
})

export const EditRecipe = () => {
  const { id = '' } = useParams<{ id: string }>()
  const recipeId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const recipeFromState = (location.state as { recipe?: Recipe } | null)?.recipe

  const { data: recipes, isLoading, isError } = useGetRecipesQuery(undefined, { skip: Boolean(recipeFromState) })
  const { data: genericProducts } = useGetGenericProductsQuery()
  const [updateRecipe, { isLoading: isSaving }] = useUpdateRecipeMutation()
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation()
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadRecipePhotoMutation()

  const recipe = recipeFromState ?? recipes?.find((item) => item.id === recipeId)

  const formik = useFormik<RecipeFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: recipe?.name ?? '',
      description: recipe?.description ?? '',
      photoUrl: recipe?.photoUrl ?? '',
      ingredients: recipe?.ingredients.map(({ genericProductId, quantityAmount, quantityUnit }) => ({
        genericProductId,
        quantityAmount,
        quantityUnit,
      })) ?? [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateRecipe({
          id: recipeId,
          name: values.name,
          description: values.description,
          photoUrl: values.photoUrl || undefined,
          ingredients: values.ingredients,
        }).unwrap()
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
        navigate(paths.recipes)
      } catch {
        // el error se muestra debajo del formulario
      }
    },
  })

  // Restaura el borrador del formulario tras volver de crear un producto genérico nuevo.
  useEffect(() => {
    const draft = sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (draft) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      try {
        formik.setValues((prev) => ({ ...prev, ...JSON.parse(draft) }))
      } catch {
        // borrador corrupto, se ignora
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const state = location.state as { createdGenericProductId?: number } | null
    if (state?.createdGenericProductId) {
      const alreadyAdded = formik.values.ingredients.some((ingredient) => ingredient.genericProductId === state.createdGenericProductId)
      if (!alreadyAdded) {
        formik.setFieldValue('ingredients', [
          ...formik.values.ingredients,
          { genericProductId: state.createdGenericProductId, quantityAmount: 0, quantityUnit: 'g' },
        ])
      }
      navigate(location.pathname, { replace: true, state: { recipe } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const handleCreateGenericProduct = () => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(paths.addGenericProduct, { state: { returnTo: location.pathname, returnState: { recipe } } })
  }

  const handlePhotoSelected = async (file: File) => {
    try {
      const { url } = await uploadPhoto(file).unwrap()
      formik.setFieldValue('photoUrl', url)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar esta receta?')) return

    try {
      await deleteRecipe(recipeId).unwrap()
      navigate(paths.recipes)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  if (!Number.isInteger(recipeId)) {
    return (
      <EditRecipeWrapper>
        <CenteredState>
          <p>Receta no válida.</p>
          <Button variant="contained" onClick={() => navigate(paths.recipes)}>
            Volver a recetas
          </Button>
        </CenteredState>
      </EditRecipeWrapper>
    )
  }

  if (!recipeFromState && isLoading) {
    return (
      <EditRecipeWrapper>
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      </EditRecipeWrapper>
    )
  }

  if (!recipe || (!recipeFromState && isError)) {
    return (
      <EditRecipeWrapper>
        <CenteredState>
          <p>No se ha encontrado la receta.</p>
          <Button variant="contained" onClick={() => navigate(paths.recipes)}>
            Volver a recetas
          </Button>
        </CenteredState>
      </EditRecipeWrapper>
    )
  }

  return (
    <EditRecipeWrapper>
      <PageTitle>{recipe.name}</PageTitle>

      <RecipeForm
        formik={formik}
        genericProducts={genericProducts ?? []}
        onCreateGenericProduct={handleCreateGenericProduct}
        onPhotoSelected={handlePhotoSelected}
        isUploadingPhoto={isUploadingPhoto}
        footer={
          <ButtonsRow>
            <Button type="submit" variant="contained" fullWidth disabled={isSaving || isDeleting}>
              {isSaving ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
            <Button variant="outlined" color="error" fullWidth disabled={isSaving || isDeleting} onClick={handleDelete}>
              {isDeleting ? <CircularProgress size={24} /> : 'Borrar receta'}
            </Button>
          </ButtonsRow>
        }
      />
    </EditRecipeWrapper>
  )
}
