import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Add from '@mui/icons-material/Add'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useGetProductByCodeQuery } from '@/services/productLookupApi'
import { useAddProductMutation, useUploadProductPhotoMutation } from '@/services/productsApi'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { paths } from '@/routes/paths'
import type { ProductLookupResponse, QuantityUnit } from '@/types/product'
import { findMatchingGenericProduct } from '@/utils/matchGenericProduct'
import { getUploadErrorMessage } from '@/utils/getUploadErrorMessage'
import {
  AddProductWrapper,
  CenteredState,
  ChipsRow,
  Form,
  GenericProductRow,
  PhotoEditButton,
  PhotoWrapper,
  ProductBrand,
  ProductHeader,
  ProductInfo,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
  QuantityRow,
  SectionTitle,
} from './AddProduct.styles'

const DRAFT_STORAGE_KEY = 'kitchen:addProductDraft'
const DETECTED_PRODUCT_STORAGE_KEY = 'kitchen:addProductDetected'
const RETURN_CONTEXT_STORAGE_KEY = 'kitchen:addProductReturnContext'

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

interface AddProductFormValues {
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

export const AddProduct = () => {
  const { code = '' } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  // Los datos detectados por IA llegan una vez por location.state (al navegar desde
  // DetectProduct). Se guardan en sessionStorage bajo el código sintético para no perderlos si
  // el usuario navega a "crear producto genérico" y vuelve, lo que reemplaza location.state.
  const stateDetectedProduct = (location.state as { detectedProduct?: ProductLookupResponse } | null)?.detectedProduct
  useEffect(() => {
    if (stateDetectedProduct && code) {
      sessionStorage.setItem(`${DETECTED_PRODUCT_STORAGE_KEY}:${code}`, JSON.stringify(stateDetectedProduct))
    }
  }, [code, stateDetectedProduct])
  const storedDetectedProduct = code ? sessionStorage.getItem(`${DETECTED_PRODUCT_STORAGE_KEY}:${code}`) : null
  const detectedProduct: ProductLookupResponse | undefined =
    stateDetectedProduct ?? (storedDetectedProduct ? JSON.parse(storedDetectedProduct) : undefined)

  // Igual que con detectedProduct: se persiste en sessionStorage bajo el código sintético para
  // sobrevivir al ir y volver de "crear producto genérico" (que reemplaza location.state).
  const stateReturnContext = (location.state as { returnTo?: string; presetGenericProductId?: number } | null) ?? {}
  useEffect(() => {
    if (code && (stateReturnContext.returnTo || stateReturnContext.presetGenericProductId)) {
      sessionStorage.setItem(`${RETURN_CONTEXT_STORAGE_KEY}:${code}`, JSON.stringify(stateReturnContext))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, stateReturnContext.returnTo, stateReturnContext.presetGenericProductId])
  const storedReturnContext = code ? sessionStorage.getItem(`${RETURN_CONTEXT_STORAGE_KEY}:${code}`) : null
  const returnContext: { returnTo?: string; presetGenericProductId?: number } = storedReturnContext
    ? JSON.parse(storedReturnContext)
    : stateReturnContext
  const {
    data: lookupData,
    isLoading,
    isError,
    error,
  } = useGetProductByCodeQuery(code, { skip: !code || Boolean(detectedProduct) })
  const data = detectedProduct ?? lookupData
  const [addProduct, { isLoading: isSaving }] = useAddProductMutation()
  const [uploadProductPhoto, { isLoading: isUploadingPhoto }] = useUploadProductPhotoMutation()
  const [photoError, setPhotoError] = useState<string | null>(null)
  const { data: genericProducts } = useGetGenericProductsQuery()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      name: data?.productName ?? data?.productGenericNameEs ?? data?.productGenericName ?? '',
      photoUrl: data?.productImageFrontUrl ?? data?.productImage ?? '',
      description: suggestedDescription,
      category: suggestedCategory,
      quantityAmount: suggestedQuantity?.amount ?? '',
      quantityUnit: suggestedQuantity?.unit ?? 'g',
      price: '',
      comment: '',
      genericProductId: returnContext.presetGenericProductId ?? suggestedGenericProduct?.id ?? null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await addProduct({
          barcode: code,
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
        if (code) {
          sessionStorage.removeItem(`${DETECTED_PRODUCT_STORAGE_KEY}:${code}`)
          sessionStorage.removeItem(`${RETURN_CONTEXT_STORAGE_KEY}:${code}`)
        }
        navigate(returnContext.returnTo ?? paths.products)
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

  const handlePhotoInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setPhotoError(null)
      const { url } = await uploadProductPhoto(file).unwrap()
      formik.setFieldValue('photoUrl', url)
    } catch (err) {
      setPhotoError(getUploadErrorMessage(err as Parameters<typeof getUploadErrorMessage>[0]))
    }
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

  const displayName = formik.values.name || 'Producto sin nombre'
  const displayPhotoUrl = formik.values.photoUrl

  return (
    <AddProductWrapper>
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

      {photoError && <Alert severity="error">{photoError}</Alert>}

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

        <Button type="submit" variant="contained" fullWidth disabled={isSaving || isUploadingPhoto}>
          {isSaving ? <CircularProgress size={24} /> : 'Guardar producto'}
        </Button>
      </Form>
    </AddProductWrapper>
  )
}
