import { prisma } from "@/config/prisma";

export interface ShoppingListItemInput {
  genericProductId: number;
  quantityAmount: number;
  quantityUnit: "g" | "ml" | "u";
}

export type ShoppingListStatus = "pending" | "completed";

export interface CreateShoppingListInput {
  estimatedPurchaseDate: Date;
  status?: ShoppingListStatus;
  items: ShoppingListItemInput[];
}

const includeItems = {
  items: { include: { genericProduct: true } },
} as const;

export async function createShoppingList(input: CreateShoppingListInput) {
  return prisma.shoppingList.create({
    data: {
      estimatedPurchaseDate: input.estimatedPurchaseDate,
      status: input.status,
      items: {
        create: input.items.map((item) => ({
          genericProductId: item.genericProductId,
          quantityAmount: item.quantityAmount,
          quantityUnit: item.quantityUnit,
        })),
      },
    },
    include: includeItems,
  });
}

export async function getShoppingLists() {
  return prisma.shoppingList.findMany({
    orderBy: [{ estimatedPurchaseDate: "asc" }, { createdAt: "desc" }],
    include: includeItems,
  });
}

export interface UpdateShoppingListInput {
  estimatedPurchaseDate?: Date;
  status?: ShoppingListStatus;
  items?: ShoppingListItemInput[];
}

export async function updateShoppingList(id: number, input: UpdateShoppingListInput) {
  return prisma.$transaction(async (tx) => {
    if (input.items) {
      await tx.shoppingListItem.deleteMany({ where: { shoppingListId: id } });
    }

    return tx.shoppingList.update({
      where: { id },
      data: {
        estimatedPurchaseDate: input.estimatedPurchaseDate,
        status: input.status,
        items: input.items
          ? {
              create: input.items.map((item) => ({
                genericProductId: item.genericProductId,
                quantityAmount: item.quantityAmount,
                quantityUnit: item.quantityUnit,
              })),
            }
          : undefined,
      },
      include: includeItems,
    });
  });
}

export async function deleteShoppingList(id: number) {
  return prisma.shoppingList.delete({ where: { id } });
}
