import { prisma } from "@/config/prisma";

export interface CreateFridgeProductInput {
  barcode: string;
  name?: string;
  photoUrl?: string;
  description: string;
  category: string;
  expirationDate: string;
  quantityAmount: number;
  quantityUnit: "g" | "ml";
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
      quantityAmount: input.quantityAmount,
      quantityUnit: input.quantityUnit,
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

export interface UpdateFridgeProductInput {
  barcode?: string;
  name?: string;
  photoUrl?: string;
  description?: string;
  category?: string;
  expirationDate?: string;
  quantityAmount?: number;
  quantityUnit?: "g" | "ml";
  quantityRemaining?: number;
  comment?: string;
}

export async function updateFridgeProduct(id: number, input: UpdateFridgeProductInput) {
  return prisma.fridgeProduct.update({
    where: { id },
    data: {
      barcode: input.barcode,
      name: input.name,
      photoUrl: input.photoUrl,
      description: input.description,
      category: input.category,
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : undefined,
      quantityAmount: input.quantityAmount,
      quantityUnit: input.quantityUnit,
      quantityRemaining: input.quantityRemaining,
      comment: input.comment,
    },
  });
}

export async function deleteFridgeProduct(id: number) {
  return prisma.fridgeProduct.delete({ where: { id } });
}
