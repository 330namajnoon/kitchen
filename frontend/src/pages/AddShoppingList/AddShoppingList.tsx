import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { ShoppingListForm } from '@/components/ShoppingListForm'
import { useGetGenericProductsQuery } from '@/services/genericProductsApi'
import { useAddShoppingListMutation } from '@/services/shoppingListsApi'
import { paths } from '@/routes/paths'
import type { ShoppingListFormValues } from '@/types/shoppingList'
import { AddShoppingListWrapper, PageTitle } from './AddShoppingList.styles'

const DRAFT_STORAGE_KEY = 'kitchen:addShoppingListDraft'

const validationSchema = yup.object({
  estimatedPurchaseDate: yup.string().required('La fecha estimada es obligatoria'),
  items: yup.array().min(1, 'Añade al menos un producto'),
})

export const AddShoppingList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: genericProducts } = useGetGenericProductsQuery()
  const [addShoppingList, { isLoading: isSaving }] = useAddShoppingListMutation()

  const formik = useFormik<ShoppingListFormValues>({
    initialValues: {
      estimatedPurchaseDate: '',
      status: 'pending',
      items: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await addShoppingList({
          estimatedPurchaseDate: values.estimatedPurchaseDate,
          items: values.items,
        }).unwrap()
        sessionStorage.removeItem(DRAFT_STORAGE_KEY)
        navigate(paths.shoppingLists)
      } catch {
        // el error se muestra debajo del formulario
      }
    },
  })

  // Mismo patrón que AddRecipe: al crear un producto genérico nuevo desde el editor de productos
  // se navega a otra página y se vuelve, así que el borrador se guarda en sessionStorage para
  // sobrevivir al remontaje y el producto recién creado se añade automáticamente a la lista.
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
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateGenericProduct = () => {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formik.values))
    navigate(paths.addGenericProduct, { state: { returnTo: paths.addShoppingList } })
  }

  return (
    <AddShoppingListWrapper>
      <PageTitle>Nueva lista de la compra</PageTitle>

      <ShoppingListForm
        formik={formik}
        genericProducts={genericProducts ?? []}
        onCreateGenericProduct={handleCreateGenericProduct}
        footer={
          <Button type="submit" variant="contained" fullWidth disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} /> : 'Guardar lista'}
          </Button>
        }
      />
    </AddShoppingListWrapper>
  )
}
