import { GeocodingResponse, ReverseGeocodingRequest } from "@/features/geocoding";

async function getGeolocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position.coords),
                (error) => reject(error)
            );
        } else {
        reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

const formatGeolocationAddress = (geoData: GeocodingResponse) => {
    const features = geoData.features;
    if (!features || features.length === 0) {
        return '';
    }
    const properties = features[0].properties;
    
    if (properties && properties.place_formatted) {
        return properties.place_formatted;
    }

    // Fallback to name_preferred if place_formatted is not available
    return properties.name_preferred || '';
}

export { getGeolocation, formatGeolocationAddress };