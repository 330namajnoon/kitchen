import { prisma } from "@/config/prisma";
import type { Prisma } from "@/generated/prisma/client";

export interface AvailableProductItemInput {
  productId: number;
  quantity: number;
  expirationDate?: string;
}

const includeProduct = {
  product: true,
} as const;

function defaultExpirationDate(purchaseDate: Date) {
  const result = new Date(purchaseDate);
  result.setMonth(result.getMonth() + 1);
  return result;
}

export async function createAvailableProducts(items: AvailableProductItemInput[]) {
  const purchaseDate = new Date();

  return prisma.$transaction(
    items.map((item) =>
      prisma.availableProduct.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : defaultExpirationDate(purchaseDate),
        },
        include: includeProduct,
      }),
    ),
  );
}

export async function getAvailableProducts() {
  return prisma.availableProduct.findMany({
    orderBy: { createdAt: "desc" },
    include: includeProduct,
  });
}

export async function getAvailableProductById(id: number) {
  return prisma.availableProduct.findUniqueOrThrow({
    where: { id },
    include: includeProduct,
  });
}

export interface UpdateAvailableProductInput {
  percentageRemaining?: number;
  expirationDate?: string | null;
}

export async function updateAvailableProduct(id: number, input: UpdateAvailableProductInput) {
  return prisma.availableProduct.update({
    where: { id },
    data: {
      percentageRemaining: input.percentageRemaining,
      expirationDate: input.expirationDate === undefined ? undefined : input.expirationDate ? new Date(input.expirationDate) : null,
    },
    include: includeProduct,
  });
}

export async function deleteAvailableProduct(id: number) {
  return prisma.availableProduct.delete({ where: { id } });
}

export interface ConsumeStockItem {
  genericProductId: number;
  quantityAmount: number;
  quantityUnit: "g" | "ml" | "u" | "tsp" | "tbsp" | "pinch" | "cup";
}

/**
 * Descuenta `quantityAmount` de cada producto genérico de las filas de `available_products`
 * que lo cubren (mismo `genericProductId` + `quantityUnit` en el producto), empezando por las
 * que caducan antes. Cada fila representa `quantity` paquetes a un `percentageRemaining` único,
 * así que consumir equivale a recalcular ese porcentaje sobre el total del lote
 * (`product.quantityAmount * quantity`). Si el stock no llega a cubrir lo pedido, se deja todo
 * en 0% y el resto del déficit simplemente no se descuenta de ningún sitio (no hay de dónde).
 *
 * Recibe el cliente de la transacción para poder combinarse con otras escrituras (ver
 * `cooked-meal.service.ts`, que registra el histórico de comidas cocinadas en la misma
 * transacción en la que se descuenta el stock).
 */
export async function consumeStockInTx(tx: Prisma.TransactionClient, items: ConsumeStockItem[]) {
  for (const item of items) {
    let remaining = item.quantityAmount;
    if (remaining <= 0) continue;

    const rows = await tx.availableProduct.findMany({
      where: {
        percentageRemaining: { gt: 0 },
        product: { genericProductId: item.genericProductId, quantityUnit: item.quantityUnit },
      },
      include: { product: true },
      orderBy: [{ expirationDate: "asc" }, { createdAt: "asc" }],
    });

    for (const row of rows) {
      if (remaining <= 0) break;

      const lotAmount = (row.product.quantityAmount ?? 0) * row.quantity;
      if (lotAmount <= 0) continue;

      const rowAvailable = (lotAmount * row.percentageRemaining) / 100;
      const consumed = Math.min(remaining, rowAvailable);
      const newAvailable = rowAvailable - consumed;
      const newPercentage = Math.max(0, Math.min(100, Math.round((newAvailable / lotAmount) * 100)));

      await tx.availableProduct.update({
        where: { id: row.id },
        data: { percentageRemaining: newPercentage },
      });

      remaining -= consumed;
    }
  }
}

export async function consumeStock(items: ConsumeStockItem[]) {
  return prisma.$transaction((tx) => consumeStockInTx(tx, items));
}
