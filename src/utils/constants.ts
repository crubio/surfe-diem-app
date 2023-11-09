// Some string constants used in the app. e.g., tooltips, labels, etc.

export const SIG_WAVE_HEIGHT = "Significant wave height is the average height of the highest third of the waves."
export const DOMINANT_WAVE_PERIOD = "Dominant wave period (seconds) is the period with the maximum wave energy."
export const AVERAGE_WAVE_PERIOD = "Average wave period (seconds) of all waves during the 20-minute period."
export const MEAN_WAVE_DIRECTION = "Mean wave direction (degrees) is the direction from which the waves at the dominant period are coming."
export const DEFAULT_CENTER = [-122.4376, 37.7577]
export const DEFAULT_SPOTS = ["San Francisco", "Santa Cruz", "Pacifica-San Mateo County", "Monterey", "San Luis Obispo County"] // If no location data, use default sub region spots
export const FEATURED_SPOTS = ["South Ocean Beach", "Steamer Lane", "Pleasure Point", "Manresa", "Privates"] // If no location data, use these default popular spots in Santa Cruz & pick them out of the response object