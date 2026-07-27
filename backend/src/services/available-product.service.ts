import { prisma } from "@/config/prisma";

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
