// src/components/MapboxPropertyMap.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  price: string | number;
  price_type?: string;
  price_currency?: string;
  city: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
}

interface MapboxPropertyMapProps {
  properties: Property[];
}

/** Tune clustering just for the bubbles (pills are independent of this). */
const CLUSTER_MAX_ZOOM = 10; // lower -> uncluster earlier
const CLUSTER_RADIUS   = 35; // lower -> less merging

/** -------- Algeria helpers -------- */
const norm = (s: string) =>
  (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

const DZ: Record<string, { lat: number; lng: number }> = {
  algiers:{lat:36.7538,lng:3.0588}, alger:{lat:36.7538,lng:3.0588},
  oran:{lat:35.6969,lng:-0.6331}, constantine:{lat:36.365,lng:6.6147},
  annaba:{lat:36.9,lng:7.7667}, bejaia:{lat:36.7525,lng:5.0556},
  tiziouzou:{lat:36.7169,lng:4.0497}, blida:{lat:36.48,lng:2.83},
  tipaza:{lat:36.5897,lng:2.4477}, boumerdes:{lat:36.7664,lng:3.4772},
  jijel:{lat:36.8167,lng:5.7667}, skikda:{lat:36.8665,lng:6.9063},
  mostaganem:{lat:35.9312,lng:0.0892}, chlef:{lat:36.1647,lng:1.3317},
  tlemcen:{lat:34.878,lng:-1.315}, 'sidi bel abbes':{lat:35.1899,lng:-0.6417},
  relizane:{lat:35.737,lng:0.555}, bouira:{lat:36.38,lng:3.9014},
  medea:{lat:36.2642,lng:2.7539}, tiaret:{lat:35.371,lng:1.3169},
  tissemsilt:{lat:35.6072,lng:1.8115}, msila:{lat:35.7058,lng:4.5418},
  setif:{lat:36.1905,lng:5.4139}, batna:{lat:35.5559,lng:6.1741},
  biskra:{lat:34.85,lng:5.7333}, khenchela:{lat:35.4358,lng:7.1433},
  tebessa:{lat:35.4042,lng:8.1242}, 'souk ahras':{lat:36.2848,lng:7.9515},
  djelfa:{lat:34.6728,lng:3.263}, laghouat:{lat:33.8,lng:2.8833},
  bechar:{lat:31.6111,lng:-2.2333}, adrar:{lat:27.874,lng:-0.2939},
  tamanrasset:{lat:22.785,lng:5.5228}, illizi:{lat:26.4833,lng:8.4667},
  eloued:{lat:33.3683,lng:6.8676}, ouargla:{lat:31.95,lng:5.3167},
  ghardaia:{lat:32.489,lng:3.6736}, elbayadh:{lat:33.6832,lng:1.0193},
  naama:{lat:33.2667,lng:-0.3167},
};
const cityLL = (city: string) => DZ[norm(city)] || { lat: 36.7538, lng: 3.0588 };

/** -------- tiny utils -------- */
const groupBy = <T, K extends string | number>(arr: T[], key: (v: T) => K) => {
  const out = new Map<K, T[]>();
  for (const it of arr) {
    const k = key(it);
    out.set(k, [...(out.get(k) || []), it]);
  }
  return out;
};

/** Spread coincident points into a ring so all pills are clickable. Dynamic radius based on count. */
const spiderfy = (map: mapboxgl.Map, base: [number, number], n: number): [number, number][] => {
  if (n <= 1) return [base];
  const c = map.project({ lng: base[0], lat: base[1] });
  // Dynamic radius: scale based on count (26px base + 8px per property beyond 3, cap at 120px)
  const r = Math.min(26 + Math.max(0, n - 3) * 8, 120);
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n;
    const p = map.unproject([c.x + r * Math.cos(a), c.y + r * Math.sin(a)]);
    pts.push([p.lng, p.lat]);
  }
  return pts;
};

export const MapboxPropertyMap = ({ properties }: MapboxPropertyMapProps) => {
  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [token, setToken] = useState('');
  const layersAdded = useRef(false);
  const htmlMarkers = useRef<mapboxgl.Marker[]>([]);
  const zoomLevelRef = useRef(5);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  /** Get Mapbox token */
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (!error && data?.token) setToken(data.token);
        else setToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
      } catch {
        setToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
      }
    })();
  }, []);

  /** Init map */
  useEffect(() => {
    if (!token || !mapEl.current || map.current) return;
    
    try {
      mapboxgl.accessToken = token;
      
      // Check if browser supports WebGL
      if (!mapboxgl.supported()) {
        console.error('WebGL not supported');
        throw new Error('WebGL not supported');
      }

      const m = new mapboxgl.Map({
      container: mapEl.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [3.0588, 36.7538],
      zoom: 5,
      cooperativeGestures: true,
      dragRotate: false,
      touchPitch: false,
    });
    const navControl = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true,
    });
    
    m.addControl(navControl, 'top-right');
    
    // Add custom styling for better visibility
    const style = document.createElement('style');
    style.textContent = `
      .mapboxgl-ctrl-group {
        background: white !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        border-radius: 8px !important;
      }
      .mapboxgl-ctrl-zoom-in,
      .mapboxgl-ctrl-zoom-out,
      .mapboxgl-ctrl-compass {
        width: 36px !important;
        height: 36px !important;
        font-size: 18px !important;
        font-weight: bold !important;
      }
      .mapboxgl-ctrl-icon {
        filter: contrast(1.2) !important;
      }
    `;
    document.head.appendChild(style);
    
      m.once('load', () => setIsMapReady(true));
      map.current = m;

      return () => {
        if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
        htmlMarkers.current.forEach(mm => mm.remove());
        htmlMarkers.current = [];
        m.remove();
        map.current = null;
        setIsMapReady(false);
        layersAdded.current = false;
      };
    } catch (error) {
      console.error('Map initialization failed:', error);
      throw error; // Let error boundary catch it
    }
  }, [token]);

  /** Add cluster layers once (for the red circles with counts). Pills do NOT depend on this. */
  useEffect(() => {
    const m = map.current;
    if (!m || !isMapReady || layersAdded.current) return;

    const toFC = (): GeoJSON.FeatureCollection<GeoJSON.Point, any> => ({
      type: 'FeatureCollection',
      features: properties
        .map((p) => {
          const lat = p.latitude ?? cityLL(p.city).lat;
          const lng = p.longitude ?? cityLL(p.city).lng;
          if (lat == null || lng == null) return null;
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: {},
          } as GeoJSON.Feature<GeoJSON.Point>;
        })
        .filter(Boolean) as GeoJSON.Feature<GeoJSON.Point, any>[],
    });

    if (!m.getSource('props')) {
      m.addSource('props', {
        type: 'geojson',
        data: toFC(),
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: CLUSTER_RADIUS,
      });

      m.addLayer({
        id: 'prop-clusters',
        type: 'circle',
        source: 'props',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#FF385C',
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 18, 25, 22, 50, 28],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      m.addLayer({
        id: 'prop-cluster-count',
        type: 'symbol',
        source: 'props',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      });

      m.on('click', 'prop-clusters', (e) => {
        const feats = m.queryRenderedFeatures(e.point, { layers: ['prop-clusters'] });
        if (!feats.length) return;
        const clusterId = feats[0].properties?.cluster_id as number;
        const src = m.getSource('props') as mapboxgl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          m.easeTo({ center: (feats[0].geometry as any).coordinates, zoom });
        });
      });

      m.on('mouseenter', 'prop-clusters', () => (m.getCanvas().style.cursor = 'pointer'));
      m.on('mouseleave', 'prop-clusters', () => (m.getCanvas().style.cursor = ''));

      layersAdded.current = true;
    }
  }, [isMapReady, properties]);

  /** Draw price pills IMMEDIATELY from `properties` (with spiderfy). */
  useEffect(() => {
    const m = map.current;
    if (!m || !isMapReady) return;

    // update cluster source data (optional, for bubbles only)
    const clusterSrc = m.getSource('props') as mapboxgl.GeoJSONSource | undefined;
    if (clusterSrc) {
      const fc: GeoJSON.FeatureCollection<GeoJSON.Point, any> = {
        type: 'FeatureCollection',
        features: properties
          .map((p) => {
            const lat = p.latitude ?? cityLL(p.city).lat;
            const lng = p.longitude ?? cityLL(p.city).lng;
            if (lat == null || lng == null) return null;
            return {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [lng, lat] },
              properties: {},
            } as GeoJSON.Feature<GeoJSON.Point>;
          })
          .filter(Boolean) as any[],
      };
      clusterSrc.setData(fc);
    }

    // clear existing pills
    htmlMarkers.current.forEach(mm => mm.remove());
    htmlMarkers.current = [];

    // group properties by coordinate (rounded) and spiderfy coincident ones
    const groups = groupBy(properties, (p) => {
      const lat = p.latitude ?? cityLL(p.city).lat;
      const lng = p.longitude ?? cityLL(p.city).lng;
      return `${lng.toFixed(5)}|${lat.toFixed(5)}`;
    });

    for (const [, arr] of groups) {
      const baseLng = arr[0].longitude ?? cityLL(arr[0].city).lng;
      const baseLat = arr[0].latitude ?? cityLL(arr[0].city).lat;
      const positions = spiderfy(m, [baseLng, baseLat], arr.length);

      arr.forEach((p, i) => {
        const [lng, lat] = positions[i];
        const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price));
        const label = formatPrice(priceNum, p.price_type, p.price_currency || 'DZD');

        const el = document.createElement('div');
        el.style.cssText = `
          background:#FF385C;color:#fff;padding:6px 10px;border-radius:999px;
          font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,.25);
          border:2px solid #fff;cursor:pointer;transition:box-shadow .15s ease;
          pointer-events:auto;
        `;
        el.textContent = label;
        el.onmouseenter = () => (el.style.boxShadow = '0 4px 16px rgba(255,56,92,.4)');
        el.onmouseleave  = () => (el.style.boxShadow = '0 2px 10px rgba(0,0,0,.25)');
        el.addEventListener('click', () => navigate(`/property/${p.id}`));

        const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(`
          <div style="padding:8px;min-width:200px">
            ${p.images?.[0] ? `<img src="${p.images[0]}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ''}
            <div style="font-weight:600;font-size:14px;margin-bottom:4px">${p.title ?? ''}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px">${p.location ?? ''}</div>
            <div style="font-weight:800;color:#FF385C">${label}</div>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(m);

        htmlMarkers.current.push(marker);
      });
    }

    // fit bounds to all markers
    const bounds = new mapboxgl.LngLatBounds();
    properties.forEach(p => {
      const lat = p.latitude ?? cityLL(p.city).lat;
      const lng = p.longitude ?? cityLL(p.city).lng;
      if (lat != null && lng != null) bounds.extend([lng, lat]);
    });
    if (!bounds.isEmpty()) m.fitBounds(bounds, { padding: 50, maxZoom: 11 });

    return () => {
      htmlMarkers.current.forEach(mm => mm.remove());
      htmlMarkers.current = [];
    };
  }, [properties, isMapReady, formatPrice, navigate]);

  return <div ref={mapEl} className="w-full h-full" />;
};
