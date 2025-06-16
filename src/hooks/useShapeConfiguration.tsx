import { Coordinate } from "@/models/ShapeConfiguration";
import { ConfigurationService } from "@/services/configuration.service";
import { useCallback, useState } from "react";
import {
  serializeConnectedLinesConfig,
  serializeLineConfig,
  serializeSquareConfig,
  serializeSquareWithTwoTailConfig
} from "@/lib/serializer/serializeShapeConfig";
import {
  defaultConfig as squareDefaults
} from "@/components/shape/SquareWithTail";
import {
  defaultConfig as lineDefaults
} from "@/components/shape/Line";
import {
  defaultConfig as connDefaults
} from "@/components/shape/ConnectingLines";
import {
  defaultConfig as doubleTailDefaults
} from "@/components/shape/SquareWithTwoTail";

export function useShapeConfiguration() {
  const shapeDefaults = {
    SquareWithTail: serializeSquareConfig(squareDefaults),
    Line: serializeLineConfig(lineDefaults),
    ConnectingLines: serializeConnectedLinesConfig(connDefaults),
    SquareWithTwoTail: serializeSquareWithTwoTailConfig(doubleTailDefaults),
  };

  const [configuration, setConfiguration] = useState<string>(shapeDefaults.SquareWithTail);
  const [outerCoords, setOuterCoords] = useState<Coordinate[]>([]);
  const [innerCoords, setInnerCoords] = useState<Coordinate[]>([]);
  const [title, setTitle] = useState<string>("");

  const loadConfiguration = useCallback((configStr: string, coords: Coordinate[], titleStr = "") => {
    setConfiguration(configStr);
    setTitle(titleStr);
    // split coords into outer and inner
    setOuterCoords(coords.filter(c => c.x < 4));     // 0-3
    setInnerCoords(coords.filter(c => c.x >= 4));    // 4-7 → treated as offset index
  }, []);

  const toggleCoordinate = (coord: Coordinate) => {
    const list = coord.x >= 4 ? innerCoords : outerCoords;
    const setter = coord.x >= 4 ? setInnerCoords : setOuterCoords;

    const exists = list.some(c => c.x === coord.x && c.y === coord.y);
    if (exists) {
      setter(list.filter(c => !(c.x === coord.x && c.y === coord.y)));
    } else {
      setter([...list, coord]);
    }
  };

  const updateConfiguration = (newConfig: string) => {
    setConfiguration(newConfig);
  };

  const handleSave = async () => {
    await ConfigurationService.create(configuration, [...outerCoords, ...innerCoords], title);
  };

  const handleUpdate = async (id: number) => {
    await ConfigurationService.update(id, configuration, [...outerCoords, ...innerCoords], title);
  };

  return {
    configuration,
    outerCoords,
    innerCoords,
    loadConfiguration,
    updateConfiguration,
    toggleCoordinate,
    handleSave,
    handleUpdate,

    title,
    setTitle
  };
}
