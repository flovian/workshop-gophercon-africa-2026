package pages

import (
	"strconv"
	"strings"

	"workshop/internal/domain/sighting"
)

// topSpecies ranks the species with the most sightings, by scientific name.
func topSpecies(sightings []sighting.Sighting, n int) []sighting.Tally {
	return sighting.Top(sighting.CountBy(sightings, func(s sighting.Sighting) string {
		return s.Species.ScientificName
	}), n)
}

// topCountries ranks the countries with the most sightings.
func topCountries(sightings []sighting.Sighting, n int) []sighting.Tally {
	return sighting.Top(sighting.CountBy(sightings, func(s sighting.Sighting) string {
		return s.Location.Country
	}), n)
}

// count formats a headline figure with thousands separators.
func count(n int) string {
	s := strconv.Itoa(n)
	if len(s) <= 3 {
		return s
	}

	neg := strings.HasPrefix(s, "-")
	if neg {
		s = s[1:]
	}

	var b strings.Builder
	lead := len(s) % 3
	if lead == 0 {
		lead = 3
	}
	b.WriteString(s[:lead])
	for i := lead; i < len(s); i += 3 {
		b.WriteByte(',')
		b.WriteString(s[i : i+3])
	}
	if neg {
		return "-" + b.String()
	}
	return b.String()
}
