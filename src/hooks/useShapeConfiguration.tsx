import { useCallback, useState } from "react";
import {
  serializeSquareConfig,
  serializeLineConfig,
  serializeConnectedLinesConfig,
} from "@/lib/serializer/serializeShapeConfig";
import { ConfigurationService } from "@/services/configuration.service";

import type { SquareWithTailProps } from "@/components/shape/SquareWithTail";
import type { LineShapeProps } from "@/components/shape/Line";
import type { ConnectedLinesShapeProps } from "@/components/shape/ConnectingLines";
import { parseGeneralConfig } from "@/lib/parser/parseShapeConfig";
import { Coordinate, ShapeType } from "@/models/ShapeConfiguration";
import { ColorHelper } from "@/helpers/color.helper";

export function useShapeConfiguration() {
  const [shapeType, setShapeType] = useState<ShapeType>("SquareWithTail");

  const [squareProps, setSquareProps] = useState<SquareWithTailProps>({
    width: 100,
    height: 100,
    radius: 10,
    strokeColor: "theme",
    tail: {
      corner: "bottom-right",
      side: "right",
      length: 20,
      angle: 30,
    },
  });

  const [lineProps, setLineProps] = useState<LineShapeProps>({
    length: 150,
    thickness: 4,
    direction: "horizontal",
    strokeColor: "theme",
  });

  const [connectedProps, setConnectedProps] = useState<ConnectedLinesShapeProps>({
    length: 80,
    thickness: 4,
    strokeColor: "theme",
    angle: 60,
  });

  const [selectedCoords, setSelectedCoords] = useState<Coordinate[]>([]);

  const setShapeTypeSafe = (value: string) => {
    setShapeType(value as ShapeType);
  }

  const toggleCoordinate = (coord: Coordinate) => {
    const exists = selectedCoords.some(
      (c) => c.x === coord.x && c.y === coord.y
    );
    if (exists) {
      setSelectedCoords((prev) =>
        prev.filter((c) => !(c.x === coord.x && c.y === coord.y))
      );
    } else {
      setSelectedCoords((prev) => [...prev, coord]);
    }
  };

  const update = (key: string, value: any) => {
    const isInvalid = value === "" || (typeof value === "number" && isNaN(value));
    if (isInvalid) return;

    if (shapeType === "SquareWithTail") {
      const updated = { ...squareProps, [key]: value };
      setSquareProps(updated);
    } else if (shapeType === "Line") {
      const updated = { ...lineProps, [key]: value };
      setLineProps(updated);
    } else {
      const updated = { ...connectedProps, [key]: value };
      setConnectedProps(updated);
    }
  };

  const updateTail = (
    key: keyof NonNullable<SquareWithTailProps["tail"]>,
    value: any
  ) => {
    const isNumber = key === "length" || key === "angle";
    if (isNumber && (value === "" || isNaN(value))) return;

    const updatedTail: Required<SquareWithTailProps>["tail"] = {
      ...squareProps.tail!,
      [key]: value,
    };

    setSquareProps((prev) => {
      return { ...prev, tail: updatedTail };
    });
  };

  const handleSave = async () => {
    let configuration = "";
    if (shapeType === "SquareWithTail") {
      configuration = serializeSquareConfig(squareProps);
    } else if (shapeType === "Line") {
      configuration = serializeLineConfig(lineProps);
    } else {
      configuration = serializeConnectedLinesConfig(connectedProps);
    }
  
    try {
      // pass selectedCoords to the service
      await ConfigurationService.create(configuration, selectedCoords);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleUpdate = async (id: number) => {
    let configuration = "";
    if (shapeType === "SquareWithTail") {
      configuration = serializeSquareConfig(squareProps);
    } else if (shapeType === "Line") {
      configuration = serializeLineConfig(lineProps);
    } else {
      configuration = serializeConnectedLinesConfig(connectedProps);
    }

    try {
      await ConfigurationService.update(id, configuration, selectedCoords);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const generateSideCoordinates = (): Coordinate[] => {
    const coords: Coordinate[] = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 5; y++) {
        coords.push({ x, y });
      }
    }
    return coords;
  };

  const loadConfiguration = useCallback((configStr: string, coords: Coordinate[]) => {
    const type = configStr.split(";")[0] as ShapeType;
    setShapeType(type);

    const props = parseGeneralConfig(configStr);
    if (type === 'SquareWithTail') {
      setSquareProps(props as SquareWithTailProps);
    } else if (type === 'Line') {
      setLineProps(props as LineShapeProps);
    } else {
      setConnectedProps(props as ConnectedLinesShapeProps);
    }

    setSelectedCoords(coords);
  },
  []);

  const currentProps =
  shapeType === "SquareWithTail"
    ? squareProps
    : shapeType === "Line"
    ? lineProps
    : connectedProps;

  return {
    shapeType,
    setShapeTypeSafe,
    squareProps,
    lineProps,
    connectedProps,
    currentProps,
    update,
    updateTail,
    handleSave,
    selectedCoords,
    toggleCoordinate,
    generateSideCoordinates,
    handleUpdate,
    loadConfiguration
  };
}
