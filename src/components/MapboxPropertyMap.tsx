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

// 👉 tune these to taste
const CLUSTER_MAX_ZOOM = 10;   // was 13 — lower = uncluster sooner
const CLUSTER_RADIUS   = 35;   // was 55 — smaller = less aggressive merging

export const MapboxPropertyMap = ({ properties }: MapboxPropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const htmlMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (!error && data?.token) setMapboxToken(data.token);
        else setMapboxToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
      } catch {
        setMapboxToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
      }
    })();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapRef.current) return;
    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [3.0588, 36.7538],
      zoom: 5,
      cooperativeGestures: true,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current = map;
    return () => {
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  const getCityCoords = (city: string): { lat: number; lng: number } => {
    const coords: Record<string, { lat: number; lng: number }> = {
      Algiers: { lat: 36.7538, lng: 3.0588 },
      Alger: { lat: 36.7538, lng: 3.0588 },
      Oran: { lat: 35.6969, lng: -0.6331 },
      Constantine: { lat: 36.365, lng: 6.6147 },
      Annaba: { lat: 36.9, lng: 7.7667 },
      Blida: { lat: 36.48, lng: 2.83 },
      Batna: { lat: 35.5559, lng: 6.1741 },
      Setif: { lat: 36.1905, lng: 5.4139 },
      Tlemcen: { lat: 34.878, lng: -1.315 },
      'Béjaïa': { lat: 36.7525, lng: 5.0556 },
    };
    return coords[city] || { lat: 36.7538, lng: 3.0588 };
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const fc: GeoJSON.FeatureCollection<GeoJSON.Point, any> = {
      type: 'FeatureCollection',
      features: (properties || [])
        .map(p => {
          const lat = p.latitude ?? getCityCoords(p.city).lat;
          const lng = p.longitude ?? getCityCoords(p.city).lng;
          if (lat == null || lng == null) return null;
          const priceNum = typeof p.price === 'number' ? p.price : parseFloat(String(p.price));
          const label = formatPrice(priceNum, p.price_type, p.price_currency || 'DZD');
          return {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: { _id: p.id, title: p.title, location: p.location, image: p.images?.[0] ?? '', label, priceNum },
          } as GeoJSON.Feature<GeoJSON.Point>;
        })
        .filter(Boolean) as GeoJSON.Feature<GeoJSON.Point, any>[],
    };

    const drawPricePills = () => {
      if (!map.isStyleLoaded()) return;
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];

      const feats = map.querySourceFeatures('props', { filter: ['!', ['has', 'point_count']] }) as mapboxgl.MapboxGeoJSONFeature[];
      feats.forEach(f => {
        const [lng, lat] = (f.geometry as any).coordinates as [number, number];
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
          </div>`;
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml))
          .addTo(map);

        htmlMarkersRef.current.push(marker);
      });
    };

    const ensureLayers = () => {
      const src = map.getSource('props') as mapboxgl.GeoJSONSource | undefined;
      if (!src) {
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
          const features = map.queryRenderedFeatures(e.point, { layers: ['prop-clusters'] });
          const clusterId = features[0].properties?.cluster_id;
          const s = map.getSource('props') as mapboxgl.GeoJSONSource;
          s.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
          });
        });

        map.on('mouseenter', 'prop-clusters', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'prop-clusters', () => (map.getCanvas().style.cursor = ''));
      } else {
        src.setData(fc);
      }
    };

    const applyAll = () => {
      ensureLayers();
      drawPricePills();

      const bounds = new mapboxgl.LngLatBounds();
      fc.features.forEach(ft => bounds.extend(ft.geometry.coordinates as [number, number]));
      if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 50, maxZoom: 11 }); // a touch closer than before
    };

    if (!map.isStyleLoaded()) map.once('load', applyAll);
    else applyAll();

    // 👉 refresh after each render pass so pills appear immediately
    const refresh = () => drawPricePills();
    map.on('idle', refresh);
    map.on('moveend', refresh);

    return () => {
      map.off('idle', refresh);
      map.off('moveend', refresh);
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];
    };
  }, [properties, formatPrice, navigate]);

  return <div ref={mapContainer} className="w-full h-full" />;
};
