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

export { getCurrentPosition };

// Legacy export for backward compatibility
export const getGeolocation = getCurrentPosition;