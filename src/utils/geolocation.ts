import { GeocodingResponse } from "@features/geocoding";

/**
 * Get the user's current position using the browser's geolocation API
 * @param options - Optional GeolocationOptions for timeout, accuracy, etc.
 * @returns Promise that resolves to GeolocationCoordinates
 */
async function getCurrentPosition(options?: PositionOptions): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        const defaultOptions: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds timeout
            maximumAge: 5 * 60 * 1000, // 5 minutes cache
            ...options
        };

        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => {
                let errorMessage = "Failed to get location";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied by user";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out";
                        break;
                }
                reject(new Error(errorMessage));
            },
            defaultOptions
        );
    });
}

/**
 * Format a geocoding response into a readable address string
 * @param geoData - Mapbox geocoding response
 * @returns Formatted address string or empty string if no data
 */
const formatGeolocationAddress = (geoData: GeocodingResponse): string => {
    const features = geoData.features;
    if (!features || features.length === 0) {
        return '';
    }
    
    const feature = features[0];
    const properties = feature.properties;
    
    // Try different property names in order of preference
    if (properties?.place_formatted) {
        return properties.place_formatted;
    }
    
    if (properties?.name_preferred) {
        return properties.name_preferred;
    }
    
    // Fallback to place_name from the feature itself
    if (feature.place_name) {
        return feature.place_name;
    }
    
    // Last fallback to text property
    return feature.text || '';
}

export { getCurrentPosition, formatGeolocationAddress };

// Legacy export for backward compatibility
export const getGeolocation = getCurrentPosition;