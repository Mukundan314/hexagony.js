const DIRECTIONS = {
  E: [1, 0],
  NE: [1, -1],
  NW: [0, -1],
  W: [-1, 0],
  SW: [-1, 1],
  SE: [0, 1],
};

function distance(point1, point2) {
  return (
    Math.abs(point1[0] - point2[0])
    + Math.abs(point1[0] + point1[1] - point2[0] - point2[1])
    + Math.abs(point1[1] - point2[1])
  ) / 2;
}

export function neighbours(point) {
  const result = {};

  Object.keys(DIRECTIONS).forEach((key) => {
    result[key] = [point[0] + DIRECTIONS[key][0], point[1] + DIRECTIONS[key][1]];
  });

  return result;
}

export function wrapAroundHexagon(point, size) {
  const mirroredCenters = [
    [2 * size + 1, -size],
    [size, size + 1],
    [-size - 1, 2 * size + 1],
    [-size, -size - 1],
    [size + 1, -2 * size - 1],
  ];

  let wrapedPoint = point;

  mirroredCenters.forEach((center) => {
    if (distance(center, point) <= size) {
      wrapedPoint = [point[0] - center[0], point[1] - center[1]];
    }
  });

  return wrapedPoint;
}
