import type { ReactNode } from 'react'
import type { FormikProps } from 'formik'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { ShoppingListItemsEditor } from '@/components/ShoppingListItemsEditor'
import type { GenericProduct } from '@/types/genericProduct'
import type { Product } from '@/types/product'
import type { ShoppingListFormValues } from '@/types/shoppingList'
import { Form, SectionTitle } from './ShoppingListForm.styles'

interface ShoppingListFormProps {
  formik: FormikProps<ShoppingListFormValues>
  genericProducts: GenericProduct[]
  products: Product[]
  onCreateGenericProduct: () => void
  onAddProduct: (genericProductId: number, method: 'manual' | 'scan' | 'ai') => void
  showStatus?: boolean
  footer: ReactNode
}

export const ShoppingListForm = ({
  formik,
  genericProducts,
  products,
  onCreateGenericProduct,
  onAddProduct,
  showStatus,
  footer,
}: ShoppingListFormProps) => {
  return (
    <Form onSubmit={formik.handleSubmit}>
      <TextField
        name="estimatedPurchaseDate"
        label="Fecha estimada de compra"
        type="date"
        value={formik.values.estimatedPurchaseDate}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.estimatedPurchaseDate && Boolean(formik.errors.estimatedPurchaseDate)}
        helperText={formik.touched.estimatedPurchaseDate && formik.errors.estimatedPurchaseDate}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
      />

      {showStatus && (
        <TextField
          select
          name="status"
          label="Estado"
          value={formik.values.status}
          onChange={formik.handleChange}
          fullWidth
        >
          <MenuItem value="pending">Pendiente</MenuItem>
          <MenuItem value="completed">Completada</MenuItem>
        </TextField>
      )}

      <SectionTitle>Productos</SectionTitle>

      <ShoppingListItemsEditor
        items={formik.values.items}
        genericProducts={genericProducts}
        products={products}
        onChange={(items) => formik.setFieldValue('items', items)}
        onCreateGenericProduct={onCreateGenericProduct}
        onAddProduct={onAddProduct}
      />
      {typeof formik.errors.items === 'string' && formik.touched.items && <p>{formik.errors.items}</p>}

      {footer}
    </Form>
  )
}
