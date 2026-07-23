import type { ChangeEvent, ReactNode } from 'react'
import { useRef } from 'react'
import type { FormikProps } from 'formik'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { RecipeIngredientsEditor } from '@/components/RecipeIngredientsEditor'
import type { GenericProduct } from '@/types/genericProduct'
import type { RecipeFormValues } from '@/types/recipe'
import { Form, PhotoButton, PhotoOverlay, PhotoPreview, PhotoRow, SectionTitle } from './RecipeForm.styles'

interface RecipeFormProps {
  formik: FormikProps<RecipeFormValues>
  genericProducts: GenericProduct[]
  onCreateGenericProduct: () => void
  onPhotoSelected: (file: File) => void
  isUploadingPhoto: boolean
  footer: ReactNode
}

export const RecipeForm = ({
  formik,
  genericProducts,
  onCreateGenericProduct,
  onPhotoSelected,
  isUploadingPhoto,
  footer,
}: RecipeFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onPhotoSelected(file)
    event.target.value = ''
  }

  return (
    <Form onSubmit={formik.handleSubmit}>
      <PhotoRow>
        <PhotoButton type="button" onClick={() => fileInputRef.current?.click()} aria-label="Añadir foto de la receta">
          {formik.values.photoUrl && <PhotoPreview src={formik.values.photoUrl} alt="Foto de la receta" />}
          <PhotoOverlay>{isUploadingPhoto ? <CircularProgress size={24} /> : <PhotoCamera />}</PhotoOverlay>
        </PhotoButton>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoInputChange} />
      </PhotoRow>

      <TextField
        name="name"
        label="Nombre"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        fullWidth
      />

      <TextField
        name="description"
        label="Descripción"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
        multiline
        minRows={2}
        fullWidth
      />

      <TextField
        name="servings"
        label="Raciones (opcional)"
        type="number"
        value={formik.values.servings}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.servings && Boolean(formik.errors.servings)}
        helperText={formik.touched.servings && formik.errors.servings}
        slotProps={{ htmlInput: { min: 1, step: 1 } }}
        fullWidth
      />

      <SectionTitle>Ingredientes</SectionTitle>

      <RecipeIngredientsEditor
        ingredients={formik.values.ingredients}
        genericProducts={genericProducts}
        onChange={(ingredients) => formik.setFieldValue('ingredients', ingredients)}
        onCreateGenericProduct={onCreateGenericProduct}
      />
      {typeof formik.errors.ingredients === 'string' && formik.touched.ingredients && (
        <p>{formik.errors.ingredients}</p>
      )}

      {footer}
    </Form>
  )
}
