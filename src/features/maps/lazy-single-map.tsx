import { ComponentProps, lazy, Suspense, useEffect, useRef, useState } from 'react';
// Sizes .map-container, so the placeholder takes the map's space before the map loads
import './mapbox/mapbox.css';

const MapBoxSingle = lazy(() => import('./mapbox/single-instance'));

type LazySingleMapProps = ComponentProps<typeof MapBoxSingle>;

/**
 * MapBoxSingle, loaded only when it comes within 300px of the viewport; a
 * same-size placeholder holds its space until then. Loads immediately where
 * IntersectionObserver is unavailable.
 */
export const LazySingleMap = (props: LazySingleMapProps) => {
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    if (nearViewport || !placeholderRef.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(placeholderRef.current);
    return () => observer.disconnect();
  }, [nearViewport]);

  const placeholder = <div ref={placeholderRef} className="map-container" aria-hidden="true" />;

  if (!nearViewport) return placeholder;
  return (
    <Suspense fallback={<div className="map-container" aria-hidden="true" />}>
      <MapBoxSingle {...props} />
    </Suspense>
  );
};
