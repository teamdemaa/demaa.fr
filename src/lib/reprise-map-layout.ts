export type RepriseMapLocation = {
  latitude: number;
  longitude: number;
};

export type RepriseMapLocationCluster<T extends RepriseMapLocation> = {
  locations: T[];
  position: RepriseMapLocation;
};

export const REPRISE_MAP_CLUSTER_RADIUS_KM = 100;

/**
 * Groups locations that are close enough to share one marker.
 *
 * Unlike the previous collision layout, this never invents a display position:
 * every cluster stays at the geographic centre of its source locations.
 */
export function clusterRepriseMapLocations<T extends RepriseMapLocation>(
  locations: readonly T[],
  radiusKm = REPRISE_MAP_CLUSTER_RADIUS_KM,
): RepriseMapLocationCluster<T>[] {
  const parents = locations.map((_, index) => index);

  function findRoot(index: number): number {
    if (parents[index] !== index) parents[index] = findRoot(parents[index]);
    return parents[index];
  }

  function connect(leftIndex: number, rightIndex: number) {
    const leftRoot = findRoot(leftIndex);
    const rightRoot = findRoot(rightIndex);
    if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot;
  }

  for (let leftIndex = 0; leftIndex < locations.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < locations.length; rightIndex += 1) {
      if (distanceInKilometres(locations[leftIndex], locations[rightIndex]) <= radiusKm) {
        connect(leftIndex, rightIndex);
      }
    }
  }

  const grouped = new Map<number, T[]>();
  locations.forEach((location, index) => {
    const root = findRoot(index);
    grouped.set(root, [...(grouped.get(root) ?? []), location]);
  });

  return [...grouped.values()].map((clusterLocations) => ({
    locations: clusterLocations,
    position: {
      latitude: average(clusterLocations.map((location) => location.latitude)),
      longitude: average(clusterLocations.map((location) => location.longitude)),
    },
  }));
}

function distanceInKilometres(left: RepriseMapLocation, right: RepriseMapLocation) {
  const earthRadiusKm = 6_371;
  const latitudeDelta = degreesToRadians(right.latitude - left.latitude);
  const longitudeDelta = degreesToRadians(right.longitude - left.longitude);
  const leftLatitude = degreesToRadians(left.latitude);
  const rightLatitude = degreesToRadians(right.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(leftLatitude) * Math.cos(rightLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function average(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}
