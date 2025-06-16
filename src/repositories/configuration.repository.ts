import { Coordinate } from "@/models/ShapeConfiguration";
import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export const ConfigurationRepository = {
  create: async (config: string, selectedCoords: Coordinate[], title: string) => {
    return prisma.shapeConfiguration.create({
      data: {
        configuration: config,
        selectedCoords: (selectedCoords as unknown) as Prisma.JsonArray,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: title
      },
    });
  },
  getAll: async () => prisma.shapeConfiguration.findMany({ orderBy: { id: "desc" } }),
  getById: async (id: number) => prisma.shapeConfiguration.findUnique({ where: { id } }),
  update: async (
    id: number,
    config: string,
    selectedCoords: Coordinate[],
    title: string,
    date: Date
  ) => {
    return prisma.shapeConfiguration.update({
      where: { id },
      data: {
        configuration: config,
        selectedCoords: (selectedCoords as unknown) as Prisma.JsonArray,
        updatedAt: date,
        title: title
      },
    });
  },
  delete: async (id: number) => prisma.shapeConfiguration.delete({ where: { id } }),
};
