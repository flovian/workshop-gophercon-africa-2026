package pages

import (
	"cmp"
	"fmt"
	"sort"
	"strconv"

	"workshop/internal/domain/sighting"
)

// Fact is one true thing drawn from the records, set out to be read at a
// glance: a short label, the figure that made it remarkable, and the record
// that earned it. Nothing here is guessed -- every one is counted from the
// sightings themselves.
type Fact struct {
	Label  string
	Value  string
	Detail string
}

// fieldNotes reads the archive and returns the handful of extremes that make
// a dataset worth wandering through: the coldest and hottest hours anyone
// recorded, the oldest note, the person who filed the most, the species seen
// once, and the one that turned up in the most countries.
func fieldNotes(sightings []sighting.Sighting) []Fact {
	if len(sightings) == 0 {
		return nil
	}

	var (
		coldest, hottest sighting.Sighting
		oldest           sighting.Sighting
		haveTemp         bool
		observers        = map[string]int{}
		perSpecies       = map[string]int{}
		countries        = map[string]map[string]struct{}{}
		display          = map[string]string{}
	)

	for _, s := range sightings {
		temp := s.Weather.Temperature.Actual
		if !haveTemp || temp < coldest.Weather.Temperature.Actual {
			coldest = s
		}
		if !haveTemp || temp > hottest.Weather.Temperature.Actual {
			hottest = s
		}
		haveTemp = true

		if oldest.HappenedAt.IsZero() || s.HappenedAt.Before(oldest.HappenedAt) {
			oldest = s
		}

		if s.RecordedBy != "" {
			observers[s.RecordedBy]++
		}

		key := s.Species.ScientificName
		if key == "" {
			key = s.Species.VernacularName
		}
		display[key] = commonName(s)
		perSpecies[key]++
		if countries[key] == nil {
			countries[key] = map[string]struct{}{}
		}
		countries[key][s.Location.Country] = struct{}{}
	}

	facts := []Fact{
		{
			Label:  "Coldest hour",
			Value:  degrees(coldest.Weather.Temperature.Actual),
			Detail: commonName(coldest) + " · " + coldest.Location.Country,
		},
		{
			Label:  "Hottest hour",
			Value:  degrees(hottest.Weather.Temperature.Actual),
			Detail: commonName(hottest) + " · " + hottest.Location.Country,
		},
		{
			Label:  "Oldest note",
			Value:  oldest.HappenedAt.Format("2006"),
			Detail: commonName(oldest) + " · " + oldest.Location.Country,
		},
	}

	if name, n := topKey(observers); n > 1 {
		facts = append(facts, Fact{
			Label:  "Most committed observer",
			Value:  strconv.Itoa(n) + " records",
			Detail: name,
		})
	}
	if key, n := mostCosmopolitan(countries); n > 1 {
		facts = append(facts, Fact{
			Label:  "Most widely seen",
			Value:  strconv.Itoa(n) + " countries",
			Detail: display[key],
		})
	}
	if key, ok := seenOnce(perSpecies); ok {
		facts = append(facts, Fact{
			Label:  "Seen only once",
			Value:  "1 record",
			Detail: display[key],
		})
	}
	return facts
}

// degrees renders a temperature to the nearest whole degree.
func degrees(c float64) string {
	return fmt.Sprintf("%.0f °C", c)
}

// commonName mirrors the card's choice: the name a reader would know, then
// back through the taxonomy.
func commonName(s sighting.Sighting) string {
	return cmp.Or(s.Species.VernacularName, s.Species.CanonicalName, s.Species.ScientificName, "Unknown species")
}

// topKey returns the highest-counting key, breaking ties alphabetically so
// the same archive always reads the same way.
func topKey(counts map[string]int) (string, int) {
	best, bestN := "", 0
	for key, n := range counts {
		if n > bestN || (n == bestN && key < best) {
			best, bestN = key, n
		}
	}
	return best, bestN
}

// mostCosmopolitan names the species recorded in the most countries.
func mostCosmopolitan(countries map[string]map[string]struct{}) (string, int) {
	best, bestN := "", 0
	for key, set := range countries {
		if len(set) > bestN || (len(set) == bestN && key < best) {
			best, bestN = key, len(set)
		}
	}
	return best, bestN
}

// seenOnce returns the first species, alphabetically, that the archive holds
// exactly one record of.
func seenOnce(perSpecies map[string]int) (string, bool) {
	singles := make([]string, 0, len(perSpecies))
	for name, n := range perSpecies {
		if n == 1 {
			singles = append(singles, name)
		}
	}
	if len(singles) == 0 {
		return "", false
	}
	sort.Strings(singles)
	return singles[0], true
}
