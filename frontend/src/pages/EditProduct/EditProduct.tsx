import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Add from '@mui/icons-material/Add'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import { useDeleteProductMutation, useGetProductsQuery, useUpdateProductMutation } from '@/services/productsApi'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { paths } from '@/routes/paths'
import type { Product, QuantityUnit } from '@/types/product'
import { findMatchingGenericProduct } from '@/utils/matchGenericProduct'
import {
  ButtonsRow,
  CenteredState,
  EditProductWrapper,
  Form,
  GenericProductRow,
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

const DRAFT_STORAGE_KEY = 'kitchen:editProductDraft'

const validationSchema = yup.object({
  description: yup.string().trim().required('La descripción es obligatoria'),
  category: yup.string().trim().required('La categoría es obligatoria'),
  expirationDate: yup.string().required('La fecha de caducidad es obligatoria'),
  quantityAmount: yup
    .number()
    .typeError('Introduce una cantidad')
    .positive('La cantidad debe ser mayor que 0')
    .required('La cantidad es obligatoria'),
  quantityUnit: yup.mixed<QuantityUnit>().oneOf(['g', 'ml', 'u']).required(),
  quantityRemaining: yup.number().min(0).max(100).required(),
  price: yup.number().typeError('Introduce un precio').positive('El precio debe ser mayor que 0').nullable(),
  comment: yup.string(),
  genericProductId: yup.number().nullable().required('Selecciona un producto genérico'),
})

interface EditProductFormValues {
  description: string
  category: string
  expirationDate: string
  quantityAmount: number | ''
  quantityUnit: QuantityUnit
  quantityRemaining: number
  price: number | ''
  comment: string
  genericProductId: number | null
}

const toDateInputValue = (isoDate: string) => isoDate.slice(0, 10)

export const EditProduct = () => {
  const { id = '' } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const productFromState = (location.state as { product?: Product } | null)?.product

  const { data: products, isLoading, isError } = useGetProductsQuery(undefined, { skip: Boolean(productFromState) })
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const { data: genericProducts } = useGetGenericProductsQuery()

  const product = productFromState ?? products?.find((item) => item.id === productId)
  const suggestedGenericProduct =
    product && !product.genericProductId
      ? findMatchingGenericProduct([product.description, product.category, product.name], genericProducts)
      : null

  const formik = useFormik<EditProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      description: product?.description ?? '',
      category: product?.category ?? '',
      expirationDate: product ? toDateInputValue(product.expirationDate) : '',
      quantityAmount: product?.quantityAmount ?? '',
      quantityUnit: product?.quantityUnit ?? 'g',
      quantityRemaining: product?.quantityRemaining ?? 100,
      price: product?.price ?? '',
      comment: product?.comment ?? '',
      genericProductId: product?.genericProductId ?? suggestedGenericProduct?.id ?? null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateProduct({
          id: productId,
          description: values.description,
          category: values.category,
          expirationDate: values.expirationDate,
          quantityAmount: Number(values.quantityAmount),
          quantityUnit: values.quantityUnit,
          quantityRemaining: values.quantityRemaining,
          price: values.price === '' ? undefined : Number(values.price),
          comment: values.comment,
          genericProductId: values.genericProductId ?? undefined,
        }).unwrap()
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
        navigate(paths.products)
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
      formik.setFieldValue('genericProductId', state.createdGenericProductId)
      navigate(location.pathname, { replace: true, state: { product } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const selectedGenericProduct = genericProducts?.find((item) => item.id === formik.values.genericProductId) ?? null

  const handleCreateGenericProduct = () => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(paths.addGenericProduct, { state: { returnTo: location.pathname, returnState: { product } } })
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar este producto?')) return

    try {
      await deleteProduct(productId).unwrap()
      navigate(paths.products)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  if (!Number.isInteger(productId)) {
    return (
      <EditProductWrapper>
        <CenteredState>
          <p>Producto no válido.</p>
          <Button variant="contained" onClick={() => navigate(paths.products)}>
            Volver a productos
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
          <Button variant="contained" onClick={() => navigate(paths.products)}>
            Volver a productos
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

      <SectionTitle>Datos del producto</SectionTitle>

      <Form onSubmit={formik.handleSubmit}>
        <GenericProductRow>
          <Autocomplete
            options={genericProducts ?? []}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedGenericProduct}
            onChange={(_event, value) => formik.setFieldValue('genericProductId', value?.id ?? null)}
            renderInput={(params) => (
              <TextField
                {...params}
                name="genericProductId"
                label="Producto genérico"
                onBlur={() => formik.setFieldTouched('genericProductId', true)}
                error={formik.touched.genericProductId && Boolean(formik.errors.genericProductId)}
                helperText={formik.touched.genericProductId && formik.errors.genericProductId}
              />
            )}
          />
          <IconButton aria-label="Crear producto genérico" color="primary" onClick={handleCreateGenericProduct}>
            <Add />
          </IconButton>
        </GenericProductRow>

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
            <MenuItem value="u">u</MenuItem>
          </TextField>
        </QuantityRow>

        <TextField
          name="price"
          label="Precio (opcional)"
          type="number"
          value={formik.values.price}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.price && Boolean(formik.errors.price)}
          helperText={formik.touched.price && formik.errors.price}
          slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          fullWidth
        />

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
