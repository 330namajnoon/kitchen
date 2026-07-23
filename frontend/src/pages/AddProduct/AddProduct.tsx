import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Add from '@mui/icons-material/Add'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import { useGetProductByCodeQuery } from '@/services/productLookupApi'
import { useAddProductMutation } from '@/services/productsApi'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { paths } from '@/routes/paths'
import type { QuantityUnit } from '@/types/product'
import { findMatchingGenericProduct } from '@/utils/matchGenericProduct'
import {
  AddProductWrapper,
  CenteredState,
  ChipsRow,
  Form,
  GenericProductRow,
  ProductBrand,
  ProductHeader,
  ProductInfo,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
  QuantityRow,
  SectionTitle,
  SliderLabel,
  SliderRow,
} from './AddProduct.styles'

const DRAFT_STORAGE_KEY = 'kitchen:addProductDraft'

/** Convierte un tag de Open Food Facts (ej. "en:whole-milk") en texto legible. */
const formatTag = (tag: string) => {
  const withoutPrefix = tag.includes(':') ? tag.split(':')[1] : tag
  return withoutPrefix.replace(/-/g, ' ')
}

/** Parsea el "quantity" de Open Food Facts (ej. "500 g", "1 l", "750ml") a cantidad + unidad g/ml. */
const parseOffQuantity = (quantity: string): { amount: number; unit: QuantityUnit } | null => {
  const match = quantity.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|l|cl|ml)\b/i)
  if (!match) return null

  const value = Number(match[1].replace(',', '.'))
  if (!Number.isFinite(value) || value <= 0) return null

  const rawUnit = match[2].toLowerCase()
  if (rawUnit === 'kg') return { amount: value * 1000, unit: 'g' }
  if (rawUnit === 'l') return { amount: value * 1000, unit: 'ml' }
  if (rawUnit === 'cl') return { amount: value * 10, unit: 'ml' }
  return { amount: value, unit: rawUnit as QuantityUnit }
}

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

interface AddProductFormValues {
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

export const AddProduct = () => {
  const { code = '' } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, isLoading, isError, error } = useGetProductByCodeQuery(code, { skip: !code })
  const [addProduct, { isLoading: isSaving }] = useAddProductMutation()
  const { data: genericProducts } = useGetGenericProductsQuery()

  const suggestedDescription = data?.productGenericNameEs ?? data?.productGenericName ?? ''
  const suggestedCategory = data?.productCategories?.[0] ? formatTag(data.productCategories[0]) : ''
  const suggestedQuantity = data?.productQuantity ? parseOffQuantity(data.productQuantity) : null
  const suggestedGenericProduct = findMatchingGenericProduct(
    [suggestedDescription, suggestedCategory, data?.productName, data?.productGenericName, data?.productGenericNameEs],
    genericProducts,
  )

  const formik = useFormik<AddProductFormValues>({
    enableReinitialize: true,
    initialValues: {
      description: suggestedDescription,
      category: suggestedCategory,
      expirationDate: '',
      quantityAmount: suggestedQuantity?.amount ?? '',
      quantityUnit: suggestedQuantity?.unit ?? 'g',
      quantityRemaining: 100,
      price: '',
      comment: '',
      genericProductId: suggestedGenericProduct?.id ?? null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await addProduct({
          barcode: code,
          name: data?.productName,
          photoUrl: data?.productImageFrontUrl ?? data?.productImage,
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
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  const selectedGenericProduct = genericProducts?.find((item) => item.id === formik.values.genericProductId) ?? null

  const handleCreateGenericProduct = () => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(paths.addGenericProduct, { state: { returnTo: location.pathname } })
  }

  if (!code) {
    return (
      <AddProductWrapper>
        <CenteredState>
          <p>No se ha detectado ningún código de barras.</p>
          <Button variant="contained" onClick={() => navigate(paths.scanBarcode)}>
            Escanear código
          </Button>
        </CenteredState>
      </AddProductWrapper>
    )
  }

  if (isLoading) {
    return (
      <AddProductWrapper>
        <CenteredState>
          <CircularProgress />
          <p>Buscando producto con código {code}…</p>
        </CenteredState>
      </AddProductWrapper>
    )
  }

  if (isError || !data) {
    const message =
      error && 'status' in error && error.status === 404
        ? 'No se ha encontrado ningún producto con ese código.'
        : 'No se ha podido consultar el producto. Inténtalo de nuevo.'

    return (
      <AddProductWrapper>
        <CenteredState>
          <p>{message}</p>
          <Button variant="contained" onClick={() => navigate(paths.scanBarcode)}>
            Volver a escanear
          </Button>
        </CenteredState>
      </AddProductWrapper>
    )
  }

  const photoUrl = data.productImageFrontUrl ?? data.productImage
  const displayName = data.productName || data.productGenericNameEs || data.productGenericName || 'Producto sin nombre'

  return (
    <AddProductWrapper>
      <ProductHeader>
        {photoUrl ? <ProductPhoto src={photoUrl} alt={displayName} /> : <ProductPhotoPlaceholder />}

        <ProductInfo>
          <ProductName>{displayName}</ProductName>
          {data.productBrands && <ProductBrand>{data.productBrands}</ProductBrand>}
          {data.productQuantity && <ProductBrand>Contenido del envase: {data.productQuantity}</ProductBrand>}

          <ChipsRow>
            {data.productNutriscore && <Chip size="small" label={`Nutri-Score ${data.productNutriscore.toUpperCase()}`} />}
            {data.productEcoscore && <Chip size="small" label={`Eco-Score ${data.productEcoscore.toUpperCase()}`} />}
            {data.productNovaGroup && <Chip size="small" label={`Nova ${data.productNovaGroup}`} />}
          </ChipsRow>

          {(data.productAllergens?.length ?? 0) > 0 && (
            <ChipsRow>
              {data.productAllergens!.map((allergen) => (
                <Chip key={allergen} size="small" color="warning" variant="outlined" label={formatTag(allergen)} />
              ))}
            </ChipsRow>
          )}
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

        <Button type="submit" variant="contained" fullWidth disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : 'Guardar producto'}
        </Button>
      </Form>
    </AddProductWrapper>
  )
}
