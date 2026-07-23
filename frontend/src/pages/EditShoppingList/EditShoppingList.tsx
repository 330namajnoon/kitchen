import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { ButtonsRow } from '@/components/ShoppingListForm/ShoppingListForm.styles'
import { ShoppingListForm } from '@/components/ShoppingListForm'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { useDeleteShoppingListMutation, useGetShoppingListsQuery, useUpdateShoppingListMutation } from '@/services/shoppingListsApi'
import { paths } from '@/routes/paths'
import type { ShoppingList, ShoppingListFormValues } from '@/types/shoppingList'
import { CenteredState, EditShoppingListWrapper, PageTitle } from './EditShoppingList.styles'

const DRAFT_STORAGE_KEY = 'kitchen:editShoppingListDraft'

const validationSchema = yup.object({
  estimatedPurchaseDate: yup.string().required('La fecha estimada es obligatoria'),
  items: yup.array().min(1, 'Añade al menos un producto'),
})

export const EditShoppingList = () => {
  const { id = '' } = useParams<{ id: string }>()
  const shoppingListId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const shoppingListFromState = (location.state as { shoppingList?: ShoppingList } | null)?.shoppingList

  const { data: shoppingLists, isLoading, isError } = useGetShoppingListsQuery(undefined, { skip: Boolean(shoppingListFromState) })
  const { data: genericProducts } = useGetGenericProductsQuery()
  const [updateShoppingList, { isLoading: isSaving }] = useUpdateShoppingListMutation()
  const [deleteShoppingList, { isLoading: isDeleting }] = useDeleteShoppingListMutation()

  const shoppingList = shoppingListFromState ?? shoppingLists?.find((item) => item.id === shoppingListId)

  const formik = useFormik<ShoppingListFormValues>({
    enableReinitialize: true,
    initialValues: {
      estimatedPurchaseDate: shoppingList?.estimatedPurchaseDate.slice(0, 10) ?? '',
      status: shoppingList?.status ?? 'pending',
      items: shoppingList?.items.map(({ genericProductId, quantityAmount, quantityUnit }) => ({
        genericProductId,
        quantityAmount,
        quantityUnit,
      })) ?? [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateShoppingList({
          id: shoppingListId,
          estimatedPurchaseDate: values.estimatedPurchaseDate,
          status: values.status,
          items: values.items,
        }).unwrap()
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
        navigate(paths.shoppingLists)
      } catch {
        // el error se muestra debajo del formulario
      }
    },
  })

  const hasHydratedDraft = useRef(false)
  useEffect(() => {
    if (hasHydratedDraft.current) return
    hasHydratedDraft.current = true

    let draft: Partial<ShoppingListFormValues> | null = null
    const draftRaw = sessionStorage.getItem(DRAFT_STORAGE_KEY)
    if (draftRaw) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
      try {
        draft = JSON.parse(draftRaw)
      } catch {
        // borrador corrupto, se ignora
      }
    }

    const state = location.state as { createdGenericProductId?: number } | null
    const createdGenericProductId = state?.createdGenericProductId

    if (draft || createdGenericProductId) {
      const base = draft ? { ...formik.values, ...draft } : formik.values
      const values =
        !createdGenericProductId || base.items.some((item) => item.genericProductId === createdGenericProductId)
          ? base
          : {
              ...base,
              items: [...base.items, { genericProductId: createdGenericProductId, quantityAmount: 0, quantityUnit: 'g' as const }],
            }
      formik.setValues(values)
    }

    if (createdGenericProductId) {
      navigate(location.pathname, { replace: true, state: { shoppingList } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateGenericProduct = () => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(paths.addGenericProduct, { state: { returnTo: location.pathname, returnState: { shoppingList } } })
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres borrar esta lista de la compra?')) return

    try {
      await deleteShoppingList(shoppingListId).unwrap()
      navigate(paths.shoppingLists)
    } catch {
      // el error se muestra debajo del formulario
    }
  }

  if (!Number.isInteger(shoppingListId)) {
    return (
      <EditShoppingListWrapper>
        <CenteredState>
          <p>Lista de la compra no válida.</p>
          <Button variant="contained" onClick={() => navigate(paths.shoppingLists)}>
            Volver a listas de la compra
          </Button>
        </CenteredState>
      </EditShoppingListWrapper>
    )
  }

  if (!shoppingListFromState && isLoading) {
    return (
      <EditShoppingListWrapper>
        <CenteredState>
          <CircularProgress />
        </CenteredState>
      </EditShoppingListWrapper>
    )
  }

  if (!shoppingList || (!shoppingListFromState && isError)) {
    return (
      <EditShoppingListWrapper>
        <CenteredState>
          <p>No se ha encontrado la lista de la compra.</p>
          <Button variant="contained" onClick={() => navigate(paths.shoppingLists)}>
            Volver a listas de la compra
          </Button>
        </CenteredState>
      </EditShoppingListWrapper>
    )
  }

  return (
    <EditShoppingListWrapper>
      <PageTitle>Lista del {new Date(shoppingList.estimatedPurchaseDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</PageTitle>

      <ShoppingListForm
        formik={formik}
        genericProducts={genericProducts ?? []}
        onCreateGenericProduct={handleCreateGenericProduct}
        showStatus
        footer={
          <ButtonsRow>
            <Button type="submit" variant="contained" fullWidth disabled={isSaving || isDeleting}>
              {isSaving ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
            <Button variant="outlined" color="error" fullWidth disabled={isSaving || isDeleting} onClick={handleDelete}>
              {isDeleting ? <CircularProgress size={24} /> : 'Borrar lista'}
            </Button>
          </ButtonsRow>
        }
      />
    </EditShoppingListWrapper>
  )
}
