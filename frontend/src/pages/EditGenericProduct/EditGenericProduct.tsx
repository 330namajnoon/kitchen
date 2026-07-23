import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import {
  useDeleteGenericProductMutation,
  useGetGenericProductsQuery,
  useUpdateGenericProductMutation,
} from '@/services/genericProductsApi'
import { paths } from '@/routes/paths'
import type { GenericProduct } from '@/types/genericProduct'
import { ButtonsRow, CenteredState, EditGenericProductWrapper, Form, SectionTitle } from './EditGenericProduct.styles'

const validationSchema = yup.object({
  name: yup.string().trim().required('El nombre es obligatorio'),
  description: yup.string(),
})

interface EditGenericProductFormValues {
  name: string
  description: string
}

export const EditGenericProduct = () => {
  const { id = '' } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const productFromState = (location.state as { genericProduct?: GenericProduct } | null)?.genericProduct

  const { data: products, isLoading, isError } = useGetGenericProductsQuery(undefined, { skip: Boolean(productFromState) })
  const [updateGenericProduct, { isLoading: isSaving, error: saveError }] = useUpdateGenericProductMutation()
  const [deleteGenericProduct, { isLoading: isDeleting }] = useDeleteGenericProductMutation()

  const product = productFromState ?? products?.find((item) => item.id === productId)

  const formik = useFormik<EditGenericProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateGenericProduct({
          id: productId,
          name: values.name,
          description: values.description || undefined,
        }).unwrap()
        navigate(paths.genericProducts)
      } catch {
        // el error se muestra debajo del formulario
      }
    },
  })

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar este producto genérico?')) return

    try {
      await deleteGenericProduct(productId).unwrap()
      navigate(paths.genericProducts)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  if (!Number.isInteger(productId)) {
    return (
      <EditGenericProductWrapper>
        <CenteredState>
          <p>Producto no válido.</p>
          <Button variant="contained" onClick={() => navigate(paths.genericProducts)}>
            Volver al listado
          </Button>
        </CenteredState>
      </EditGenericProductWrapper>
    )
  }

  if (!productFromState && isLoading) {
    return (
      <EditGenericProductWrapper>
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      </EditGenericProductWrapper>
    )
  }

  if (!product || (!productFromState && isError)) {
    return (
      <EditGenericProductWrapper>
        <CenteredState>
          <p>No se ha encontrado el producto.</p>
          <Button variant="contained" onClick={() => navigate(paths.genericProducts)}>
            Volver al listado
          </Button>
        </CenteredState>
      </EditGenericProductWrapper>
    )
  }

  return (
    <EditGenericProductWrapper>
      <SectionTitle>Editar producto genérico</SectionTitle>

      <Form onSubmit={formik.handleSubmit}>
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
          <Button type="submit" variant="contained" fullWidth disabled={isSaving || isDeleting}>
            {isSaving ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
          <Button variant="outlined" color="error" fullWidth disabled={isSaving || isDeleting} onClick={handleDelete}>
            {isDeleting ? <CircularProgress size={24} /> : 'Borrar producto'}
          </Button>
        </ButtonsRow>
      </Form>
    </EditGenericProductWrapper>
  )
}
