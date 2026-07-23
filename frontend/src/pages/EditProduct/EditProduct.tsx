import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import { useDeleteFridgeProductMutation, useGetFridgeProductsQuery, useUpdateFridgeProductMutation } from '@/services/fridgeApi'
import { paths } from '@/routes/paths'
import type { FridgeProduct, QuantityUnit } from '@/types/product'
import {
  ButtonsRow,
  CenteredState,
  EditProductWrapper,
  Form,
  ProductHeader,
  ProductInfo,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
  QuantityRow,
  SectionTitle,
  SliderLabel,
  SliderRow,
} from './EditProduct.styles'

const validationSchema = yup.object({
  description: yup.string().trim().required('La descripción es obligatoria'),
  category: yup.string().trim().required('La categoría es obligatoria'),
  expirationDate: yup.string().required('La fecha de caducidad es obligatoria'),
  quantityAmount: yup
    .number()
    .typeError('Introduce una cantidad')
    .positive('La cantidad debe ser mayor que 0')
    .required('La cantidad es obligatoria'),
  quantityUnit: yup.mixed<QuantityUnit>().oneOf(['g', 'ml']).required(),
  quantityRemaining: yup.number().min(0).max(100).required(),
  comment: yup.string(),
})

interface EditProductFormValues {
  description: string
  category: string
  expirationDate: string
  quantityAmount: number | ''
  quantityUnit: QuantityUnit
  quantityRemaining: number
  comment: string
}

const toDateInputValue = (isoDate: string) => isoDate.slice(0, 10)

export const EditProduct = () => {
  const { id = '' } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const productFromState = (location.state as { product?: FridgeProduct } | null)?.product

  const { data: products, isLoading, isError } = useGetFridgeProductsQuery(undefined, { skip: Boolean(productFromState) })
  const [updateFridgeProduct, { isLoading: isSaving }] = useUpdateFridgeProductMutation()
  const [deleteFridgeProduct, { isLoading: isDeleting }] = useDeleteFridgeProductMutation()

  const product = productFromState ?? products?.find((item) => item.id === productId)

  const formik = useFormik<EditProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      description: product?.description ?? '',
      category: product?.category ?? '',
      expirationDate: product ? toDateInputValue(product.expirationDate) : '',
      quantityAmount: product?.quantityAmount ?? '',
      quantityUnit: product?.quantityUnit ?? 'g',
      quantityRemaining: product?.quantityRemaining ?? 100,
      comment: product?.comment ?? '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateFridgeProduct({
          id: productId,
          description: values.description,
          category: values.category,
          expirationDate: values.expirationDate,
          quantityAmount: Number(values.quantityAmount),
          quantityUnit: values.quantityUnit,
          quantityRemaining: values.quantityRemaining,
          comment: values.comment,
        }).unwrap()
        navigate(paths.fridge)
      } catch {
        // el error se muestra debajo del formulario
      }
    },
  })

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar este producto de la nevera?')) return

    try {
      await deleteFridgeProduct(productId).unwrap()
      navigate(paths.fridge)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  if (!Number.isInteger(productId)) {
    return (
      <EditProductWrapper>
        <CenteredState>
          <p>Producto no válido.</p>
          <Button variant="contained" onClick={() => navigate(paths.fridge)}>
            Volver a la nevera
          </Button>
        </CenteredState>
      </EditProductWrapper>
    )
  }

  if (!productFromState && isLoading) {
    return (
      <EditProductWrapper>
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      </EditProductWrapper>
    )
  }

  if (!product || (!productFromState && isError)) {
    return (
      <EditProductWrapper>
        <CenteredState>
          <p>No se ha encontrado el producto.</p>
          <Button variant="contained" onClick={() => navigate(paths.fridge)}>
            Volver a la nevera
          </Button>
        </CenteredState>
      </EditProductWrapper>
    )
  }

  const displayName = product.name || product.description

  return (
    <EditProductWrapper>
      <ProductHeader>
        {product.photoUrl ? <ProductPhoto src={product.photoUrl} alt={displayName} /> : <ProductPhotoPlaceholder />}

        <ProductInfo>
          <ProductName>{displayName}</ProductName>
        </ProductInfo>
      </ProductHeader>

      <SectionTitle>Datos de la nevera</SectionTitle>

      <Form onSubmit={formik.handleSubmit}>
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
          name="category"
          label="Categoría"
          value={formik.values.category}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.category && Boolean(formik.errors.category)}
          helperText={formik.touched.category && formik.errors.category}
          fullWidth
        />

        <TextField
          name="expirationDate"
          label="Fecha de caducidad"
          type="date"
          value={formik.values.expirationDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.expirationDate && Boolean(formik.errors.expirationDate)}
          helperText={formik.touched.expirationDate && formik.errors.expirationDate}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <QuantityRow>
          <TextField
            name="quantityAmount"
            label="Cantidad total"
            type="number"
            value={formik.values.quantityAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.quantityAmount && Boolean(formik.errors.quantityAmount)}
            helperText={formik.touched.quantityAmount && formik.errors.quantityAmount}
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            fullWidth
          />
          <TextField
            name="quantityUnit"
            label="Unidad"
            select
            value={formik.values.quantityUnit}
            onChange={formik.handleChange}
          >
            <MenuItem value="g">g</MenuItem>
            <MenuItem value="ml">ml</MenuItem>
          </TextField>
        </QuantityRow>

        <SliderRow>
          <SliderLabel>
            <span>Cantidad restante</span>
            <span>{formik.values.quantityRemaining}%</span>
          </SliderLabel>
          <Slider
            value={formik.values.quantityRemaining}
            onChange={(_event, value) => formik.setFieldValue('quantityRemaining', value)}
            min={0}
            max={100}
            step={5}
          />
        </SliderRow>

        <TextField
          name="comment"
          label="Comentario (opcional)"
          value={formik.values.comment}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          multiline
          minRows={2}
          fullWidth
        />

        <ButtonsRow>
          <Button type="submit" variant="contained" fullWidth disabled={isSaving || isDeleting}>
            {isSaving ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
          <Button variant="outlined" color="error" fullWidth disabled={isSaving || isDeleting} onClick={handleDelete}>
            {isDeleting ? <CircularProgress size={24} /> : 'Borrar producto'}
          </Button>
        </ButtonsRow>
      </Form>
    </EditProductWrapper>
  )
}
