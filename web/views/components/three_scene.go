package components

import "workshop/internal/domain/sighting"

// GlobePoint is one sighting on the globe, as latitude and longitude in degrees.
type GlobePoint struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// GlobePoints turns sightings into positions for the globe, leaving out any
// with no coordinates.
func GlobePoints(sightings []sighting.Sighting) []GlobePoint {
	points := make([]GlobePoint, 0, len(sightings))
	for _, s := range sightings {
		if s.Location.Latitude == 0 && s.Location.Longitude == 0 {
			continue
		}
		points = append(points, GlobePoint{Lat: s.Location.Latitude, Lng: s.Location.Longitude})
	}
	return points
}
