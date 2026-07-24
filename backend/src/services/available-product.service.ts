import { prisma } from "@/config/prisma";

export interface AvailableProductItemInput {
  productId: number;
  quantity: number;
}

const includeProduct = {
  product: true,
} as const;

export async function createAvailableProducts(items: AvailableProductItemInput[]) {
  return prisma.$transaction(
    items.map((item) =>
      prisma.availableProduct.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
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

export async function updateAvailableProductPercentage(id: number, percentageRemaining: number) {
  return prisma.availableProduct.update({
    where: { id },
    data: { percentageRemaining },
    include: includeProduct,
  });
}

export async function deleteAvailableProduct(id: number) {
  return prisma.availableProduct.delete({ where: { id } });
}
