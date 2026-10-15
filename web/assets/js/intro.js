// Night Safari — the opening curtain. It holds the page for a beat while the
// first paint settles, then lifts to reveal the site. Shown once a session,
// skipped for anyone who asked for less motion, and it never blocks anyone:
// a click, a key or the timer are all it takes to send it away.

(function () {
	const el = document.getElementById('curtain');
	if (!el) return;

	let done = false;
	function lift() {
		if (done) return;
		done = true;
		const root = document.documentElement;
		root.classList.remove('curtain-is-on');
		// The hero arrives in sequence the moment the curtain starts to go.
		root.classList.add('reveal-hero');
		el.classList.add('is-gone');
		try {
			sessionStorage.setItem('night-safari:curtain', '1');
		} catch (err) {
			/* private mode: showing every time is fine */
		}
		el.addEventListener('transitionend', () => el.remove(), { once: true });
		window.setTimeout(() => el.remove(), 1400);
	}

	let seen = false;
	try {
		seen = sessionStorage.getItem('night-safari:curtain') === '1';
	} catch (err) {
		seen = false;
	}
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || seen) {
		document.documentElement.classList.remove('curtain-is-on');
		el.remove();
		return;
	}

	// Hold for at least a moment so the reveal reads as deliberate, and never
	// past the cap below, whatever the fonts and tiles decide to do.
	const MIN = 950;
	const started = performance.now();
	function schedule() {
		window.setTimeout(lift, Math.max(0, MIN - (performance.now() - started)));
	}
	if (document.readyState === 'complete') schedule();
	else window.addEventListener('load', schedule, { once: true });

	['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((event) =>
		window.addEventListener(event, lift, { once: true, passive: true }),
	);
	window.setTimeout(lift, 2600);
})();
