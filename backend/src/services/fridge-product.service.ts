import { prisma } from "@/config/prisma";

export interface CreateFridgeProductInput {
  barcode: string;
  name?: string;
  photoUrl?: string;
  description: string;
  category: string;
  expirationDate: string;
  quantityRemaining: number;
  comment?: string;
}

export async function createFridgeProduct(input: CreateFridgeProductInput) {
  return prisma.fridgeProduct.create({
    data: {
      barcode: input.barcode,
      name: input.name,
      photoUrl: input.photoUrl,
      description: input.description,
      category: input.category,
      expirationDate: new Date(input.expirationDate),
      quantityRemaining: input.quantityRemaining,
      comment: input.comment,
    },
  });
}

export async function getFridgeProducts() {
  return prisma.fridgeProduct.findMany({
    orderBy: { createdAt: "desc" },
  });
}
