import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { RecipeForm } from '@/components/RecipeForm'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { useAddRecipeMutation, useUploadRecipePhotoMutation } from '@/services/recipesApi'
import { paths } from '@/routes/paths'
import type { RecipeFormValues } from '@/types/recipe'
import { AddRecipeWrapper, PageTitle } from './AddRecipe.styles'

const DRAFT_STORAGE_KEY = 'kitchen:addRecipeDraft'

const validationSchema = yup.object({
  name: yup.string().trim().required('El nombre es obligatorio'),
  description: yup.string().trim().required('La descripción es obligatoria'),
  photoUrl: yup.string(),
  ingredients: yup.array().min(1, 'Añade al menos un ingrediente'),
})

export const AddRecipe = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: genericProducts } = useGetGenericProductsQuery()
  const [addRecipe, { isLoading: isSaving }] = useAddRecipeMutation()
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadRecipePhotoMutation()

  const formik = useFormik<RecipeFormValues>({
    initialValues: {
      name: '',
      description: '',
      photoUrl: '',
      ingredients: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await addRecipe({
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
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const handleCreateGenericProduct = () => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(paths.addGenericProduct, { state: { returnTo: paths.addRecipe } })
  }

  const handlePhotoSelected = async (file: File) => {
    try {
      const { url } = await uploadPhoto(file).unwrap()
      formik.setFieldValue('photoUrl', url)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  return (
    <AddRecipeWrapper>
      <PageTitle>Nueva receta</PageTitle>

      <RecipeForm
        formik={formik}
        genericProducts={genericProducts ?? []}
        onCreateGenericProduct={handleCreateGenericProduct}
        onPhotoSelected={handlePhotoSelected}
        isUploadingPhoto={isUploadingPhoto}
        footer={
          <Button type="submit" variant="contained" fullWidth disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} /> : 'Guardar receta'}
          </Button>
        }
      />
    </AddRecipeWrapper>
  )
}
