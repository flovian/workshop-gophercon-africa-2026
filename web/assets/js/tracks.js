// block: tracks — copy to web/assets/js/tracks.js. See tracks.md.
//
// Turns the per-species routes the server wrote into an interactive map: pick
// an animal and its sightings are joined in the order they happened, a tracer
// walks the line, and the caption says how far the animal was seen to move.
// Needs Leaflet, which the layout loads first.

(function () {
	const el = document.querySelector('[data-track-map]');
	if (!el || typeof L === 'undefined') return;

	const script = document.getElementById('track-data');
	let tracks = [];
	try {
		tracks = (script && JSON.parse(script.textContent)) || [];
	} catch (err) {
		tracks = [];
	}
	if (!tracks.length) return;

	const picker = document.querySelector('.tracks__picker');
	const caption = document.querySelector('[data-track-caption]');
	const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const CREDIT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

	const colour = (prop, fallback) => getComputedStyle(el).getPropertyValue(prop).trim() || fallback;

	const map = L.map(el, {
		scrollWheelZoom: false,
		zoomAnimation: !still,
		worldCopyJump: true,
	});
	L.tileLayer(TILES, { attribution: CREDIT, maxZoom: 18, minZoom: 1 }).addTo(map);

	let route = null;
	let stops = null;
	let tracer = null;
	let raf = 0;

	function popup(point, index) {
		const root = document.createElement('div');
		root.className = 'map__popup';
		root.appendChild(document.createElement('strong')).textContent = index + '. ' + point.date;
		root.appendChild(document.createElement('span')).textContent = point.place || '';
		if (point.anchor) {
			const link = root.appendChild(document.createElement('a'));
			link.href = '#' + point.anchor;
			link.textContent = 'Jump to record';
		}
		return root;
	}

	// Great-circle distance between two points, in kilometres.
	function away(a, b) {
		const R = 6371;
		const rad = Math.PI / 180;
		const dLat = (b[0] - a[0]) * rad;
		const dLng = (b[1] - a[1]) * rad;
		const h =
			Math.sin(dLat / 2) ** 2 +
			Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
		return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
	}

	function total(points) {
		let km = 0;
		for (let i = 1; i < points.length; i++) km += away(points[i - 1], points[i]);
		return km;
	}

	function stop() {
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
	}

	function trace(points) {
		stop();
		if (still || points.length < 2) return;
		const tracerColour = colour('--ember', '#e2703a');
		const spans = [];
		let sum = 0;
		for (let i = 1; i < points.length; i++) {
			const d = away(points[i - 1], points[i]);
			spans.push(d);
			sum += d;
		}
		if (sum === 0) return;

		tracer = L.circleMarker(points[0], { radius: 6, color: tracerColour, weight: 0, fillColor: tracerColour, fillOpacity: 1 }).addTo(map);
		const duration = 2600;
		const started = performance.now();

		function step(now) {
			const t = Math.min(1, (now - started) / duration) * sum;
			let walked = 0;
			let i = 0;
			while (i < spans.length && walked + spans[i] < t) {
				walked += spans[i];
				i++;
			}
			const seg = spans[i] || 1;
			const f = i < spans.length ? (t - walked) / seg : 1;
			const a = points[i];
			const b = points[i + 1] || a;
			tracer.setLatLng([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
			if (t < sum) raf = requestAnimationFrame(step);
		}
		raf = requestAnimationFrame(step);
	}

	function draw(track) {
		stop();
		if (route) map.removeLayer(route);
		if (stops) map.removeLayer(stops);
		if (tracer) map.removeLayer(tracer);
		tracer = null;

		const line = colour('--gold', '#d4a017');
		const fill = colour('--gold-soft', '#e8c25a');
		const stroke = colour('--ink', '#12100e');
		const points = track.points;

		route = L.polyline(points.map((p) => [p.lat, p.lng]), {
			color: line,
			weight: 3,
			opacity: 0.9,
			dashArray: '2 8',
			lineCap: 'round',
		}).addTo(map);

		stops = L.featureGroup();
		points.forEach((p, i) => {
			L.circleMarker([p.lat, p.lng], { radius: 5, weight: 2, color: stroke, fillColor: fill, fillOpacity: 0.95 })
				.bindPopup(() => popup(p, i + 1))
				.bindTooltip(String(i + 1))
				.addTo(stops);
		});
		stops.addTo(map);

		map.fitBounds(route.getBounds(), { padding: [30, 30], animate: false, maxZoom: 7 });

		const first = points[0];
		const last = points[points.length - 1];
		const km = total(points);
		if (caption) {
			caption.textContent =
				' ' + track.animal + ' — ' + points.length + ' sightings, ' +
				km.toFixed(0) + ' km of straight-line travel, from ' + first.date + ' to ' + last.date + '.';
		}
		trace(points);
	}

	function choose(index) {
		const track = tracks[index];
		if (!track) return;
		if (picker) {
			picker.querySelectorAll('.tracks__pick').forEach((btn) => {
				btn.setAttribute('aria-pressed', String(Number(btn.dataset.track) === index));
			});
		}
		draw(track);
	}

	if (picker) {
		picker.addEventListener('click', (event) => {
			const btn = event.target.closest('.tracks__pick');
			if (btn) choose(Number(btn.dataset.track));
		});
	}

	map.on('focus', () => map.scrollWheelZoom.enable());
	map.on('blur', () => map.scrollWheelZoom.disable());

	choose(0);
})();
