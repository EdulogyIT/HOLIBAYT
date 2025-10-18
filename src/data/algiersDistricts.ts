/**
 * GeoJSON data for Algiers districts
 * These are approximate boundaries for major districts in Algiers
 */

export interface DistrictProperties {
  name: string;
  name_ar: string;
  name_fr: string;
}

export const ALGIERS_DISTRICTS_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: {
        name: 'Alger Centre',
        name_ar: 'الجزائر الوسطى',
        name_fr: 'Alger Centre'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [3.050, 36.760],
          [3.070, 36.760],
          [3.070, 36.780],
          [3.050, 36.780],
          [3.050, 36.760]
        ]]
      }
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Hydra',
        name_ar: 'هيدرا',
        name_fr: 'Hydra'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [3.060, 36.745],
          [3.080, 36.745],
          [3.080, 36.760],
          [3.060, 36.760],
          [3.060, 36.745]
        ]]
      }
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Bab Ezzouar',
        name_ar: 'باب الزوار',
        name_fr: 'Bab Ezzouar'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [3.175, 36.715],
          [3.200, 36.715],
          [3.200, 36.740],
          [3.175, 36.740],
          [3.175, 36.715]
        ]]
      }
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Cheraga',
        name_ar: 'الشراقة',
        name_fr: 'Cheraga'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [2.950, 36.745],
          [2.980, 36.745],
          [2.980, 36.770],
          [2.950, 36.770],
          [2.950, 36.745]
        ]]
      }
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Kouba',
        name_ar: 'القبة',
        name_fr: 'Kouba'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [3.075, 36.720],
          [3.100, 36.720],
          [3.100, 36.745],
          [3.075, 36.745],
          [3.075, 36.720]
        ]]
      }
    },
    {
      type: 'Feature' as const,
      properties: {
        name: 'Dar El Beida',
        name_ar: 'دار البيضاء',
        name_fr: 'Dar El Beida'
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [3.200, 36.695],
          [3.230, 36.695],
          [3.230, 36.720],
          [3.200, 36.720],
          [3.200, 36.695]
        ]]
      }
    }
  ]
};

export const ALGIERS_CENTER: [number, number] = [3.0588, 36.7538];
export const ALGIERS_BOUNDS: [[number, number], [number, number]] = [
  [2.85, 36.65], // Southwest
  [3.25, 36.85]  // Northeast
];
