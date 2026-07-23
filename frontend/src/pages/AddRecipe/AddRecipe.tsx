import { useEffect, useRef } from 'react'
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

  // Restaura el borrador del formulario tras volver de crear un producto genérico nuevo, y añade
  // ese producto a los ingredientes. Va en un único efecto porque ambos pasos parten del mismo
  // montaje (crear un producto genérico navega a otra ruta, así que esta página se remonta al
  // volver): repartirlo en dos efectos separados provoca que el segundo lea `formik.values`
  // antes de que el primero termine de restaurar el borrador y lo pise. El guard con `ref` evita
  // que, en StrictMode, la doble invocación del efecto vuelva a ejecutar la restauración con el
  // sessionStorage ya vaciado por la primera pasada, machacando los valores con el estado inicial.
  const hasHydratedDraft = useRef(false)
  useEffect(() => {
    if (hasHydratedDraft.current) return
    hasHydratedDraft.current = true

    let draft: Partial<RecipeFormValues> | null = null
    const draftRaw = sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (draftRaw) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      try {
        draft = JSON.parse(draftRaw)
      } catch {
        // borrador corrupto, se ignora
      }
    }

    const state = location.state as { createdGenericProductId?: number } | null
    const createdGenericProductId = state?.createdGenericProductId

    if (draft || createdGenericProductId) {
      const base = draft ? { ...formik.values, ...draft } : formik.values
      const values =
        !createdGenericProductId || base.ingredients.some((ingredient) => ingredient.genericProductId === createdGenericProductId)
          ? base
          : {
              ...base,
              ingredients: [
                ...base.ingredients,
                { genericProductId: createdGenericProductId, quantityAmount: 0, quantityUnit: 'g' as const },
              ],
            }
      formik.setValues(values)
    }

    if (createdGenericProductId) {
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
