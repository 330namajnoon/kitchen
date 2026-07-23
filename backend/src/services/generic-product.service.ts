import { prisma } from "@/config/prisma";

export interface CreateGenericProductInput {
  name: string;
  description?: string;
}

export async function createGenericProduct(input: CreateGenericProductInput) {
  return prisma.genericProduct.create({
    data: {
      name: input.name,
      description: input.description,
    },
  });
}

export async function getGenericProducts() {
  return prisma.genericProduct.findMany({
    orderBy: { name: "asc" },
  });
}

export interface UpdateGenericProductInput {
  name?: string;
  description?: string;
}

export async function updateGenericProduct(id: number, input: UpdateGenericProductInput) {
  return prisma.genericProduct.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
    },
  });
}

export async function deleteGenericProduct(id: number) {
  return prisma.genericProduct.delete({ where: { id } });
}
