import { useNavigate } from 'react-router-dom'
import Add from '@mui/icons-material/Add'
import CircularProgress from '@mui/material/CircularProgress'
import Fab from '@mui/material/Fab'
import { useGetShoppingListsQuery } from '@/services/shoppingListsApi'
import { buildEditShoppingListPath, paths } from '@/routes/paths'
import {
  CenteredState,
  PageTitle,
  ShoppingListCard,
  ShoppingListDate,
  ShoppingListInfo,
  ShoppingListItemCount,
  ShoppingListStack,
  ShoppingListsWrapper,
  StatusBadge,
} from './ShoppingLists.styles'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

const statusLabel = { pending: 'Pendiente', completed: 'Completada' } as const

export const ShoppingLists = () => {
  const navigate = useNavigate()
  const { data: shoppingLists, isLoading, isError } = useGetShoppingListsQuery()

  return (
    <ShoppingListsWrapper>
      <PageTitle>Listas de la compra</PageTitle>

      {isLoading && (
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      )}

      {isError && <CenteredState>No se han podido cargar las listas de la compra.</CenteredState>}

      {!isLoading && !isError && shoppingLists?.length === 0 && (
        <CenteredState>Todavía no hay listas de la compra. Crea la primera.</CenteredState>
      )}

      {!isLoading && !isError && (shoppingLists?.length ?? 0) > 0 && (
        <ShoppingListStack>
          {shoppingLists!.map((shoppingList) => (
            <ShoppingListCard key={shoppingList.id} onClick={() => navigate(buildEditShoppingListPath(shoppingList.id), { state: { shoppingList } })}>
              <ShoppingListInfo>
                <ShoppingListDate>{formatDate(shoppingList.estimatedPurchaseDate)}</ShoppingListDate>
                <ShoppingListItemCount>
                  {shoppingList.items.length} producto{shoppingList.items.length === 1 ? '' : 's'}
                </ShoppingListItemCount>
              </ShoppingListInfo>
              <StatusBadge $status={shoppingList.status}>{statusLabel[shoppingList.status]}</StatusBadge>
            </ShoppingListCard>
          ))}
        </ShoppingListStack>
      )}

      <Fab
        color="primary"
        aria-label="Añadir lista de la compra"
        onClick={() => navigate(paths.addShoppingList)}
        sx={{ position: 'fixed', bottom: { xs: 92, sm: 24 }, right: 24 }}
      >
        <Add />
      </Fab>
    </ShoppingListsWrapper>
  )
}
