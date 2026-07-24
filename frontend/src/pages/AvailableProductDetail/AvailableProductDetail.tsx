import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Slider from '@mui/material/Slider'
import {
  useDeleteAvailableProductMutation,
  useGetAvailableProductQuery,
  useUpdateAvailableProductPercentageMutation,
} from '@/services/availableProductsApi'
import { paths } from '@/routes/paths'
import type { AvailableProduct } from '@/types/availableProduct'
import {
  AvailableProductDetailWrapper,
  ButtonsRow,
  CenteredState,
  DetailLabel,
  DetailRow,
  DetailsList,
  DetailValue,
  ProductHeader,
  ProductInfo,
  ProductName,
  ProductPhoto,
  ProductPhotoPlaceholder,
  SectionTitle,
  SliderLabel,
  SliderRow,
} from './AvailableProductDetail.styles'

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const AvailableProductDetail = () => {
  const { id = '' } = useParams<{ id: string }>()
  const availableProductId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const availableProductFromState = (location.state as { availableProduct?: AvailableProduct } | null)?.availableProduct

  const { data: fetchedAvailableProduct, isLoading, isError } = useGetAvailableProductQuery(availableProductId, {
    skip: Boolean(availableProductFromState),
  })
  const [updatePercentage, { isLoading: isSaving }] = useUpdateAvailableProductPercentageMutation()
  const [deleteAvailableProduct, { isLoading: isDeleting }] = useDeleteAvailableProductMutation()

  const availableProduct = availableProductFromState ?? fetchedAvailableProduct
  const [percentageRemaining, setPercentageRemaining] = useState(availableProduct?.percentageRemaining ?? 100)

  if (!Number.isInteger(availableProductId)) {
    return (
      <AvailableProductDetailWrapper>
        <CenteredState>
          <p>Producto disponible no válido.</p>
          <Button variant="contained" onClick={() => navigate(paths.availableProducts)}>
            Volver a disponibles
          </Button>
        </CenteredState>
      </AvailableProductDetailWrapper>
    )
  }

  if (!availableProductFromState && isLoading) {
    return (
      <AvailableProductDetailWrapper>
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      </AvailableProductDetailWrapper>
    )
  }

  if (!availableProduct || (!availableProductFromState && isError)) {
    return (
      <AvailableProductDetailWrapper>
        <CenteredState>
          <p>No se ha encontrado el producto disponible.</p>
          <Button variant="contained" onClick={() => navigate(paths.availableProducts)}>
            Volver a disponibles
          </Button>
        </CenteredState>
      </AvailableProductDetailWrapper>
    )
  }

  const { product } = availableProduct
  const displayName = product.name || product.description
  const depleted = percentageRemaining === 0

  const handleSliderCommit = async (value: number) => {
    setPercentageRemaining(value)
    try {
      await updatePercentage({ id: availableProduct.id, percentageRemaining: value }).unwrap()
    } catch {
      setPercentageRemaining(availableProduct.percentageRemaining)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar este producto disponible?')) return

    try {
      await deleteAvailableProduct(availableProduct.id).unwrap()
      navigate(paths.availableProducts)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  return (
    <AvailableProductDetailWrapper>
      <ProductHeader>
        {product.photoUrl ? <ProductPhoto src={product.photoUrl} alt={displayName} /> : <ProductPhotoPlaceholder />}
        <ProductInfo>
          <ProductName>{displayName}</ProductName>
        </ProductInfo>
      </ProductHeader>

      <SectionTitle>Datos del producto</SectionTitle>

      <DetailsList>
        <DetailRow>
          <DetailLabel>Descripción</DetailLabel>
          <DetailValue>{product.description}</DetailValue>
        </DetailRow>

        <DetailRow>
          <DetailLabel>Categoría</DetailLabel>
          <DetailValue>{product.category}</DetailValue>
        </DetailRow>

        <DetailRow>
          <DetailLabel>Fecha de caducidad</DetailLabel>
          <DetailValue>{formatDate(product.expirationDate)}</DetailValue>
        </DetailRow>

        {product.quantityAmount !== undefined && product.quantityAmount !== null && (
          <DetailRow>
            <DetailLabel>Cantidad total</DetailLabel>
            <DetailValue>
              {product.quantityAmount} {product.quantityUnit}
            </DetailValue>
          </DetailRow>
        )}

        <DetailRow>
          <DetailLabel>Cantidad comprada</DetailLabel>
          <DetailValue>{availableProduct.quantity}</DetailValue>
        </DetailRow>

        {product.price !== undefined && product.price !== null && (
          <DetailRow>
            <DetailLabel>Precio</DetailLabel>
            <DetailValue>{product.price} €</DetailValue>
          </DetailRow>
        )}

        {product.genericProduct && (
          <DetailRow>
            <DetailLabel>Producto genérico</DetailLabel>
            <DetailValue>{product.genericProduct.name}</DetailValue>
          </DetailRow>
        )}

        {product.comment && (
          <DetailRow>
            <DetailLabel>Comentario</DetailLabel>
            <DetailValue>{product.comment}</DetailValue>
          </DetailRow>
        )}
      </DetailsList>

      <SectionTitle>Cantidad restante</SectionTitle>

      <SliderRow>
        <SliderLabel $depleted={depleted}>
          <span>Restante</span>
          <span>
            {percentageRemaining}% {isSaving && <CircularProgress size={12} />}
          </span>
        </SliderLabel>
        <Slider
          value={percentageRemaining}
          onChange={(_event, value) => setPercentageRemaining(value as number)}
          onChangeCommitted={(_event, value) => handleSliderCommit(value as number)}
          min={0}
          max={100}
          step={5}
          color={depleted ? 'error' : 'primary'}
        />
      </SliderRow>

      <ButtonsRow>
        <Button variant="outlined" color="error" fullWidth disabled={isDeleting} onClick={handleDelete}>
          {isDeleting ? <CircularProgress size={24} /> : 'Borrar producto'}
        </Button>
      </ButtonsRow>
    </AvailableProductDetailWrapper>
  )
}
