package components

import (
	"cmp"
	"sort"

	"workshop/internal/domain/sighting"
)

// maxTracks keeps the picker to the busiest species, so it stays a choice
// rather than a directory.
const maxTracks = 15

// TrackPoint is one sighting on a track: where and when it happened, and the
// card it belongs to, so a point on the map can jump back to its record.
type TrackPoint struct {
	Lat    float64 `json:"lat"`
	Lng    float64 `json:"lng"`
	Date   string  `json:"date"`
	Place  string  `json:"place"`
	Anchor string  `json:"anchor,omitempty"`
}

// Track is every sighting of one species, in the order they happened: a route
// the animal was seen to take, drawn straight between the points.
type Track struct {
	Animal string       `json:"animal"`
	Points []TrackPoint `json:"points"`
}

// AnimalTracks groups the sightings into one route per species and keeps those
// with somewhere to go -- two points or more -- busiest first, so the picker
// leads with the animals that were seen most.
func AnimalTracks(sightings []sighting.Sighting) []Track {
	grouped := map[string][]sighting.Sighting{}
	for _, s := range sightings {
		key := displayName(s.Species)
		grouped[key] = append(grouped[key], s)
	}

	tracks := make([]Track, 0, len(grouped))
	for animal, group := range grouped {
		if len(group) < 2 {
			continue
		}
		sort.SliceStable(group, func(i, j int) bool {
			return group[i].HappenedAt.Before(group[j].HappenedAt)
		})

		points := make([]TrackPoint, 0, len(group))
		for _, s := range group {
			points = append(points, TrackPoint{
				Lat:    s.Location.Latitude,
				Lng:    s.Location.Longitude,
				Date:   s.HappenedAt.Format("2 Jan 2006"),
				Place:  place(s.Location),
				Anchor: "sighting-" + s.ID.String(),
			})
		}
		tracks = append(tracks, Track{Animal: animal, Points: points})
	}

	sort.SliceStable(tracks, func(i, j int) bool {
		if len(tracks[i].Points) != len(tracks[j].Points) {
			return len(tracks[i].Points) > len(tracks[j].Points)
		}
		return cmp.Less(tracks[i].Animal, tracks[j].Animal)
	})
	if len(tracks) > maxTracks {
		tracks = tracks[:maxTracks]
	}
	return tracks
}
