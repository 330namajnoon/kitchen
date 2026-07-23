import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Add from '@mui/icons-material/Add'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { buildEditGenericProductPath, paths } from '@/routes/paths'
import {
  CenteredState,
  GenericProductsWrapper,
  PageTitle,
  ProductCard,
  ProductDescription,
  ProductList,
  ProductName,
  SearchField,
} from './GenericProducts.styles'

export const GenericProducts = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: products, isLoading, isError } = useGetGenericProductsQuery()

  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = products?.filter(
    (product) =>
      !normalizedSearch ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description?.toLowerCase().includes(normalizedSearch),
  )

  return (
    <GenericProductsWrapper>
      <PageTitle>Productos genéricos</PageTitle>

      {!isLoading && !isError && (products?.length ?? 0) > 0 && (
        <SearchField>
          <TextField
            label="Buscar"
            placeholder="Buscar por nombre o descripción"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
          />
        </SearchField>
      )}

      {isLoading && (
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      )}

      {isError && <CenteredState>No se han podido cargar los productos genéricos.</CenteredState>}

      {!isLoading && !isError && products?.length === 0 && (
        <CenteredState>Todavía no hay productos genéricos. Crea el primero.</CenteredState>
      )}

      {!isLoading && !isError && (products?.length ?? 0) > 0 && filteredProducts?.length === 0 && (
        <CenteredState>No se ha encontrado ningún producto genérico con ese término.</CenteredState>
      )}

      {!isLoading && !isError && (filteredProducts?.length ?? 0) > 0 && (
        <ProductList>
          {filteredProducts!.map((product) => (
            <ProductCard
              key={product.id}
              onClick={() => navigate(buildEditGenericProductPath(product.id), { state: { genericProduct: product } })}
            >
              <ProductName>{product.name}</ProductName>
              {product.description && <ProductDescription>{product.description}</ProductDescription>}
            </ProductCard>
          ))}
        </ProductList>
      )}

      <Fab
        color="primary"
        aria-label="Añadir producto genérico"
        onClick={() => navigate(paths.addGenericProduct)}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>
    </GenericProductsWrapper>
  )
}
