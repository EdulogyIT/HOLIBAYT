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

// tune for earlier pill visibility
const CLUSTER_MAX_ZOOM = 10;
const CLUSTER_RADIUS   = 35;

// --- Algeria city helpers ---
const norm = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const DZ_CITIES: Record<string, { lat: number; lng: number }> = {
  algiers:{lat:36.7538,lng:3.0588}, alger:{lat:36.7538,lng:3.0588},
  oran:{lat:35.6969,lng:-0.6331}, constantine:{lat:36.365,lng:6.6147},
  annaba:{lat:36.9,lng:7.7667}, bejaia:{lat:36.7525,lng:5.0556},
  tiziouzou:{lat:36.7169,lng:4.0497}, blida:{lat:36.48,lng:2.83},
  tipaza:{lat:36.5897,lng:2.4477}, boumerdes:{lat:36.7664,lng:3.4772},
  jijel:{lat:36.8167,lng:5.7667}, skikda:{lat:36.8665,lng:6.9063},
  mostaganem:{lat:35.9312,lng:0.0892}, chlef:{lat:36.1647,lng:1.3317},
  tlemcen:{lat:34.878,lng:-1.315}, "sidi bel abbes":{lat:35.1899,lng:-0.6417},
  relizane:{lat:35.737,lng:0.555}, bouira:{lat:36.38,lng:3.9014},
  medea:{lat:36.2642,lng:2.7539}, tiaret:{lat:35.371,lng:1.3169},
  tissemsilt:{lat:35.6072,lng:1.8115}, msila:{lat:35.7058,lng:4.5418},
  setif:{lat:36.1905,lng:5.4139}, batna:{lat:35.5559,lng:6.1741},
  biskra:{lat:34.85,lng:5.7333}, khenchela:{lat:35.4358,lng:7.1433},
  tebessa:{lat:35.4042,lng:8.1242}, "souk ahras":{lat:36.2848,lng:7.9515},
  djelfa:{lat:34.6728,lng:3.263}, laghouat:{lat:33.8,lng:2.8833},
  bechar:{lat:31.6111,lng:-2.2333}, adrar:{lat:27.874,lng:-0.2939},
  tamanrasset:{lat:22.785,lng:5.5228}, illizi:{lat:26.4833,lng:8.4667},
  eloued:{lat:33.3683,lng:6.8676}, ouargla:{lat:31.95,lng:5.3167},
  ghardaia:{lat:32.489,lng:3.6736}, elbayadh:{lat:33.6832,lng:1.0193},
  naama:{lat:33.2667,lng:-0.3167}
};

const getCityCoords = (city: string): { lat: number; lng: number } =>
  DZ_CITIES[norm(city)] || { lat: 36.7538, lng: 3.0588 }; // default Algiers

export const MapboxPropertyMap = ({ properties }: MapboxPropertyMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapReadyRef = useRef(false);               // <-- guard for style load
  const layersAddedRef = useRef(false);            // <-- ensure source/layers once
  const htmlMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [token, setToken] = useState<string>('');
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // token
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

  // init map
  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [3.0588, 36.7538],
      zoom: 5,
      cooperativeGestures: true,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const onLoad = () => { mapReadyRef.current = true; };
    map.on('load', onLoad);

    mapRef.current = map;

    return () => {
      map.off('load', onLoad);
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
      layersAddedRef.current = false;
    };
  }, [token]);

  // helpers
  const groupBy = <T, K extends string | number>(arr: T[], key: (v: T) => K) => {
    const m = new Map<K, T[]>();
    for (const it of arr) {
      const k = key(it);
      m.set(k, [...(m.get(k) || []), it]);
    }
    return m;
  };

  const spiderfy = (map: mapboxgl.Map, base: [number, number], n: number): [number, number][] => {
    if (n <= 1) return [base];
    const c = map.project({ lng: base[0], lat: base[1] });
    const r = 26;
    const out: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (2 * Math.PI * i) / n;
      const p = map.unproject({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
      out.push([p.lng, p.lat]);
    }
    return out;
  };

  const toFC = (items: Property[]): GeoJSON.FeatureCollection<GeoJSON.Point, any> => ({
    type: 'FeatureCollection',
    features: items
      .map((p) => {
        const lat = p.latitude ?? getCityCoords(p.city).lat;
        const lng = p.longitude ?? getCityCoords(p.city).lng;
        if (lat == null || lng == null) return null;

        const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price));
        const label = formatPrice(priceNum, p.price_type, p.price_currency || 'DZD');

        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {
            _id: p.id,
            title: p.title,
            location: p.location,
            image: p.images?.[0] ?? '',
            label,
            priceNum,
          },
        } as GeoJSON.Feature<GeoJSON.Point>;
      })
      .filter(Boolean) as GeoJSON.Feature<GeoJSON.Point, any>[],
  });

  // data + rendering
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    const fc = toFC(properties);

    // 1) ensure source/layers
    if (!layersAddedRef.current) {
      if (!map.getSource('props')) {
        map.addSource('props', {
          type: 'geojson',
          data: fc,
          cluster: true,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
          clusterRadius: CLUSTER_RADIUS,
        });

        map.addLayer({
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

        map.addLayer({
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

        map.on('click', 'prop-clusters', (e) => {
          const feats = map.queryRenderedFeatures(e.point, { layers: ['prop-clusters'] });
          if (!feats.length) return;
          const clusterId = feats[0].properties?.cluster_id as number;
          const src = map.getSource('props') as mapboxgl.GeoJSONSource;
          src.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: (feats[0].geometry as any).coordinates, zoom });
          });
        });

        map.on('mouseenter', 'prop-clusters', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'prop-clusters', () => (map.getCanvas().style.cursor = ''));

        layersAddedRef.current = true;
      }
    }

    // 2) always setData with the latest FC
    const src = map.getSource('props') as mapboxgl.GeoJSONSource | undefined;
    if (src) src.setData(fc);

    // 3) fit once per update (keeps things in view but not too tight)
    const bounds = new mapboxgl.LngLatBounds();
    fc.features.forEach(f => bounds.extend(f.geometry.coordinates as [number, number]));
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 50, maxZoom: 11 });

    // 4) draw price pills (with spiderfy)
    const drawPills = () => {
      if (!mapReadyRef.current) return;

      // clear old
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];

      const feats = map.querySourceFeatures('props', {
        filter: ['!', ['has', 'point_count']],
      }) as mapboxgl.MapboxGeoJSONFeature[];

      const groups = groupBy(feats, (f) => {
        const [lng, lat] = (f.geometry as any).coordinates as [number, number];
        return `${lng.toFixed(5)}|${lat.toFixed(5)}`;
      });

      for (const [, arr] of groups) {
        const base = (arr[0].geometry as any).coordinates as [number, number];
        const ring = spiderfy(map, base, arr.length);

        arr.forEach((f, i) => {
          const [lng, lat] = ring[i];
          const { label, _id, title, location, image } = f.properties as any;

          const el = document.createElement('div');
          el.style.cssText = `
            background:#FF385C;color:#fff;padding:6px 10px;border-radius:999px;
            font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,.25);
            border:2px solid #fff;cursor:pointer;transform:translateY(-4px);transition:transform .15s ease;
          `;
          el.textContent = label;
          el.onmouseenter = () => (el.style.transform = 'translateY(-4px) scale(1.06)');
          el.onmouseleave = () => (el.style.transform = 'translateY(-4px)');
          el.addEventListener('click', () => navigate(`/property/${_id}`));

          const popupHtml = `
            <div style="padding:8px;min-width:200px">
              ${image ? `<img src="${image}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ''}
              <div style="font-weight:600;font-size:14px;margin-bottom:4px">${title ?? ''}</div>
              <div style="font-size:12px;color:#666;margin-bottom:4px">${location ?? ''}</div>
              <div style="font-weight:800;color:#FF385C">${label}</div>
            </div>
          `;

          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml))
            .addTo(map);

          htmlMarkersRef.current.push(marker);
        });
      }
    };

    // draw once now, and keep fresh after user moves/zooms
    drawPills();
    const onMoveEnd = () => drawPills();
    const onZoomEnd = () => drawPills();
    map.on('moveend', onMoveEnd);
    map.on('zoomend', onZoomEnd);

    return () => {
      map.off('moveend', onMoveEnd);
      map.off('zoomend', onZoomEnd);
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];
    };
  }, [properties, formatPrice, navigate]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};
