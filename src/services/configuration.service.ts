import { Coordinate, ShapeConfiguration } from "@/models/ShapeConfiguration";
import { get, post, put, remove } from "@/services/base.service";

const baseUrl = "/api/configuration";

export const ConfigurationService = {
  create: async (configuration: string, selectedCoords: Coordinate[]) => {
    return post(`${baseUrl}/create`, { configuration, selectedCoords });
  },

  getAll: async (): Promise<ShapeConfiguration[]> => {
    return await get<ShapeConfiguration[]>(`${baseUrl}/all`);
  },

  getById: async (id: number): Promise<ShapeConfiguration> => {
    return await get<ShapeConfiguration>(`${baseUrl}/${id}`);
  },

  update: async (id: number, configuration: string, selectedCoords: Coordinate[]) => {
    return put(`${baseUrl}/update`, { id, configuration, selectedCoords });
  },

  delete: async (id: number) => remove(`${baseUrl}/delete`, { id }),
};