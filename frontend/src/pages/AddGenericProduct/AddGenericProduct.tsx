import { useLocation, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { useAddGenericProductMutation } from '@/services/genericProductsApi'
import { paths } from '@/routes/paths'
import { AddGenericProductWrapper, ButtonsRow, Form, SectionTitle } from './AddGenericProduct.styles'

const validationSchema = yup.object({
  name: yup.string().trim().required('El nombre es obligatorio'),
  description: yup.string(),
})

interface AddGenericProductFormValues {
  name: string
  description: string
}

export const AddGenericProduct = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { returnTo?: string; returnState?: Record<string, unknown> } | null
  const returnTo = locationState?.returnTo
  const returnState = locationState?.returnState
  const [addGenericProduct, { isLoading: isSaving, error: saveError }] = useAddGenericProductMutation()

  const formik = useFormik<AddGenericProductFormValues>({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const product = await addGenericProduct({
          name: values.name,
          description: values.description || undefined,
        }).unwrap()

        if (returnTo) {
          navigate(returnTo, { state: { ...returnState, createdGenericProductId: product.id } })
        } else {
          navigate(paths.genericProducts)
        }
      } catch {
        // el error se muestra debajo del formulario
      }
    },
  })

  const handleCancel = () => {
    if (returnTo) {
      navigate(returnTo, { state: returnState })
    } else {
      navigate(paths.genericProducts)
    }
  }

  return (
    <AddGenericProductWrapper>
      <SectionTitle>Nuevo producto genérico</SectionTitle>

      <Form onSubmit={formik.handleSubmit}>
        <TextField
          name="name"
          label="Nombre"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          autoFocus
          fullWidth
        />

        <TextField
          name="description"
          label="Descripción (opcional)"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          multiline
          minRows={2}
          fullWidth
        />

        {saveError && <p>No se ha podido guardar el producto genérico. Puede que ya exista uno con ese nombre.</p>}

        <ButtonsRow>
          <Button type="submit" variant="contained" fullWidth disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
          <Button variant="outlined" fullWidth disabled={isSaving} onClick={handleCancel}>
            Cancelar
          </Button>
        </ButtonsRow>
      </Form>
    </AddGenericProductWrapper>
  )
}
