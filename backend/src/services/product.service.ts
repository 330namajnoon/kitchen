import { prisma } from "@/config/prisma";

export interface CreateProductInput {
  barcode: string;
  name?: string;
  photoUrl?: string;
  description: string;
  category: string;
  quantityAmount: number;
  quantityUnit: "g" | "ml" | "u" | "tsp" | "tbsp" | "pinch" | "cup";
  price?: number;
  comment?: string;
  genericProductId?: number;
}

export async function createProduct(input: CreateProductInput) {
  return prisma.product.create({
    data: {
      barcode: input.barcode,
      name: input.name,
      photoUrl: input.photoUrl,
      description: input.description,
      category: input.category,
      quantityAmount: input.quantityAmount,
      quantityUnit: input.quantityUnit,
      price: input.price,
      comment: input.comment,
      genericProductId: input.genericProductId,
    },
  });
}

export async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { genericProduct: true },
  });
}

export interface UpdateProductInput {
  barcode?: string;
  name?: string;
  photoUrl?: string;
  description?: string;
  category?: string;
  quantityAmount?: number;
  quantityUnit?: "g" | "ml" | "u" | "tsp" | "tbsp" | "pinch" | "cup";
  price?: number;
  comment?: string;
  genericProductId?: number;
}

export async function updateProduct(id: number, input: UpdateProductInput) {
  return prisma.product.update({
    where: { id },
    data: {
      barcode: input.barcode,
      name: input.name,
      photoUrl: input.photoUrl,
      description: input.description,
      category: input.category,
      quantityAmount: input.quantityAmount,
      quantityUnit: input.quantityUnit,
      price: input.price,
      comment: input.comment,
      genericProductId: input.genericProductId,
    },
    include: { genericProduct: true },
  });
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({ where: { id } });
}
