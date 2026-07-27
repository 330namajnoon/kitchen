import type { ChangeEvent } from 'react'
import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Add from '@mui/icons-material/Add'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import {
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useUploadProductPhotoMutation,
} from '@/services/productsApi'
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
  PhotoEditButton,
  PhotoWrapper,
  ProductHeader,
  ProductInfo,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
  QuantityRow,
  SectionTitle,
} from './EditProduct.styles'

const DRAFT_STORAGE_KEY = 'kitchen:editProductDraft'

const validationSchema = yup.object({
  name: yup.string().trim().required('El nombre es obligatorio'),
  photoUrl: yup.string(),
  description: yup.string().trim().required('La descripción es obligatoria'),
  category: yup.string().trim().required('La categoría es obligatoria'),
  quantityAmount: yup
    .number()
    .typeError('Introduce una cantidad')
    .positive('La cantidad debe ser mayor que 0')
    .required('La cantidad es obligatoria'),
  quantityUnit: yup.mixed<QuantityUnit>().oneOf(['g', 'ml', 'u', 'tsp', 'tbsp', 'pinch', 'cup']).required(),
  price: yup.number().typeError('Introduce un precio').positive('El precio debe ser mayor que 0').nullable(),
  comment: yup.string(),
  genericProductId: yup.number().nullable().required('Selecciona un producto genérico'),
})

interface EditProductFormValues {
  name: string
  photoUrl: string
  description: string
  category: string
  quantityAmount: number | ''
  quantityUnit: QuantityUnit
  price: number | ''
  comment: string
  genericProductId: number | null
}

export const EditProduct = () => {
  const { id = '' } = useParams<{ id: string }>()
  const productId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const productFromState = (location.state as { product?: Product } | null)?.product

  const { data: products, isLoading, isError } = useGetProductsQuery(undefined, { skip: Boolean(productFromState) })
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const [uploadProductPhoto, { isLoading: isUploadingPhoto }] = useUploadProductPhotoMutation()
  const { data: genericProducts } = useGetGenericProductsQuery()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const product = productFromState ?? products?.find((item) => item.id === productId)
  const suggestedGenericProduct =
    product && !product.genericProductId
      ? findMatchingGenericProduct([product.description, product.category, product.name], genericProducts)
      : null

  const formik = useFormik<EditProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: product?.name ?? '',
      photoUrl: product?.photoUrl ?? '',
      description: product?.description ?? '',
      category: product?.category ?? '',
      quantityAmount: product?.quantityAmount ?? '',
      quantityUnit: product?.quantityUnit ?? 'g',
      price: product?.price ?? '',
      comment: product?.comment ?? '',
      genericProductId: product?.genericProductId ?? suggestedGenericProduct?.id ?? null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateProduct({
          id: productId,
          name: values.name,
          photoUrl: values.photoUrl || undefined,
          description: values.description,
          category: values.category,
          quantityAmount: Number(values.quantityAmount),
          quantityUnit: values.quantityUnit,
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

  const handlePhotoInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const { url } = await uploadProductPhoto(file).unwrap()
      formik.setFieldValue('photoUrl', url)
    } catch {
      // el error se muestra debajo del formulario
    }
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

  const displayName = formik.values.name || product.description
  const displayPhotoUrl = formik.values.photoUrl

  return (
    <EditProductWrapper>
      <ProductHeader>
        <PhotoWrapper>
          {displayPhotoUrl ? <ProductPhoto src={displayPhotoUrl} alt={displayName} /> : <ProductPhotoPlaceholder />}
          <PhotoEditButton
            type="button"
            aria-label="Cambiar foto del producto"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
          >
            {isUploadingPhoto ? <CircularProgress size={18} color="inherit" /> : <PhotoCamera fontSize="small" />}
          </PhotoEditButton>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoInputChange} />
        </PhotoWrapper>

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
          name="category"
          label="Categoría"
          value={formik.values.category}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.category && Boolean(formik.errors.category)}
          helperText={formik.touched.category && formik.errors.category}
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
            <MenuItem value="tsp">tsp</MenuItem>
            <MenuItem value="tbsp">tbsp</MenuItem>
            <MenuItem value="pinch">pinch</MenuItem>
            <MenuItem value="cup">cup</MenuItem>
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
