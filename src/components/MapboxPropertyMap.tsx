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

export const MapboxPropertyMap = ({ properties }: MapboxPropertyMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const htmlMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // 1) fetch token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (!error && data?.token) setMapboxToken(data.token);
        else setMapboxToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
      } catch {
        setMapboxToken('pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTRmYm0ycDMwYWVzMnBzaHo0aTg5enBkIn0.VhY5RN5gX_zc5SjGHLqKJQ');
      }
    };
    fetchToken();
  }, []);

  // 2) init map
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

  // Helpers
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

  // 3) build clustered source + layers, then render HTML price pills for unclustered points
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!properties || properties.length === 0) return;

    // Remove old source/layers if re-running
    if (map.getLayer('prop-clusters')) map.removeLayer('prop-clusters');
    if (map.getLayer('prop-cluster-count')) map.removeLayer('prop-cluster-count');
    if (map.getSource('props')) map.removeSource('props');

    // GeoJSON
    const fc: GeoJSON.FeatureCollection<GeoJSON.Point, any> = {
      type: 'FeatureCollection',
      features: properties
        .map(p => {
          const lat = p.latitude ?? getCityCoords(p.city).lat;
          const lng = p.longitude ?? getCityCoords(p.city).lng;
          if (lat == null || lng == null) return null;
          const priceNum =
            typeof p.price === 'number' ? p.price : parseFloat(String(p.price));
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
    };

    map.addSource('props', {
      type: 'geojson',
      data: fc,
      cluster: true,
      clusterMaxZoom: 13,   // at >= 13 we’ll start showing individual price pills
      clusterRadius: 55,
    });

    // Cluster bubbles (simple circle)
    map.addLayer({
      id: 'prop-clusters',
      type: 'circle',
      source: 'props',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#FF385C',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          16, 10, 18, 25, 22, 50, 28
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      },
    });

    // Cluster count label
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
      paint: {
        'text-color': '#ffffff',
      },
    });

    // Click cluster to zoom in (like Airbnb)
    map.on('click', 'prop-clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['prop-clusters'] });
      const clusterId = features[0].properties?.cluster_id;
      const src = map.getSource('props') as mapboxgl.GeoJSONSource;
      if (!src) return;
      src.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
      });
    });

    // Hover cursor on clusters
    map.on('mouseenter', 'prop-clusters', () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', 'prop-clusters', () => (map.getCanvas().style.cursor = ''));

    // Price pills for *unclustered* features only, rendered as auto-sized HTML markers
    const refreshPricePills = () => {
      if (!map.isStyleLoaded()) return;

      // Clear old
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];

      // Visible unclustered features
      const features = map.querySourceFeatures('props', {
        sourceLayer: undefined,
        filter: ['!', ['has', 'point_count']],
      }) as mapboxgl.MapboxGeoJSONFeature[];

      features.forEach((f) => {
        const [lng, lat] = (f.geometry as any).coordinates as [number, number];
        const { label, _id, title, location, image } = f.properties as any;

        const el = document.createElement('div');
        el.className = 'price-pill';
        el.style.cssText = `
          background: #FF385C;
          color: #fff;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          border: 2px solid #fff;
          cursor: pointer;
          transform: translateY(-4px);
          transition: transform .15s ease;
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
    };

    // Fit bounds once
    const bounds = new mapboxgl.LngLatBounds();
    fc.features.forEach((ft) => {
      const [lng, lat] = ft.geometry.coordinates;
      bounds.extend([lng, lat]);
    });
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }

    // Refresh pills whenever view changes (zoom/pan/style load)
    const refresh = () => refreshPricePills();
    map.on('moveend', refresh);
    map.on('data', refresh); // ensures first render after tiles load
    // Also refresh if currency formatting function identity changes
    // (not strictly necessary but keeps them in sync).

    // Cleanup listeners and HTML markers on re-render
    return () => {
      map.off('moveend', refresh);
      map.off('data', refresh);
      htmlMarkersRef.current.forEach(m => m.remove());
      htmlMarkersRef.current = [];
    };
  }, [properties, formatPrice, navigate]);

  return <div ref={mapContainer} className="w-full h-full" />;
};
