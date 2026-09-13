export type RepriseMapMarkerPosition = {
  x: number;
  y: number;
};

const horizontalGap = 11;
const verticalGap = 7;
const horizontalStep = 12;
const verticalStep = 8;

export function separateRepriseMapMarkers<T extends { position: RepriseMapMarkerPosition }>(markers: readonly T[]): T[] {
  const placed: RepriseMapMarkerPosition[] = [];

  return markers.map((marker) => {
    const position = findAvailablePosition(marker.position, placed);
    placed.push(position);
    return { ...marker, position };
  });
}

function findAvailablePosition(origin: RepriseMapMarkerPosition, placed: readonly RepriseMapMarkerPosition[]) {
  for (const candidate of createCandidates(origin)) {
    if (placed.every((position) => !positionsOverlap(candidate, position))) return candidate;
  }
  return origin;
}

function createCandidates(origin: RepriseMapMarkerPosition) {
  const candidates = [origin];
  for (let ring = 1; ring <= 4; ring += 1) {
    const horizontalOffset = horizontalStep * ring;
    const verticalOffset = verticalStep * ring;
    candidates.push(
      movePosition(origin, 0, -verticalOffset),
      movePosition(origin, 0, verticalOffset),
      movePosition(origin, -horizontalOffset, 0),
      movePosition(origin, horizontalOffset, 0),
      movePosition(origin, -horizontalOffset, -verticalOffset),
      movePosition(origin, horizontalOffset, -verticalOffset),
      movePosition(origin, -horizontalOffset, verticalOffset),
      movePosition(origin, horizontalOffset, verticalOffset),
    );
  }
  return candidates;
}

function movePosition(origin: RepriseMapMarkerPosition, xOffset: number, yOffset: number) {
  return {
    x: clamp(origin.x + xOffset, 5, 95),
    y: clamp(origin.y + yOffset, 5, 95),
  };
}

function positionsOverlap(left: RepriseMapMarkerPosition, right: RepriseMapMarkerPosition) {
  return Math.abs(left.x - right.x) < horizontalGap && Math.abs(left.y - right.y) < verticalGap;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
