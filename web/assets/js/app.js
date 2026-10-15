// Night Safari — the little bits the server can't do: whichever section is
// under the header is marked as the current one in the nav.

(function () {
	const links = Array.from(document.querySelectorAll('.site-nav a[href*="#"]'));
	if (!links.length || !('IntersectionObserver' in window)) return;

	const targets = links
		.map((link) => {
			const id = link.getAttribute('href').split('#')[1];
			const el = id && document.getElementById(id);
			return el ? { link: link, el: el, id: id } : null;
		})
		.filter(Boolean);
	if (!targets.length) return;

	function mark(id) {
		targets.forEach((t) => {
			if (t.id === id) {
				t.link.setAttribute('aria-current', 'location');
			} else {
				t.link.removeAttribute('aria-current');
			}
		});
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) mark(entry.target.id);
			});
		},
		{ rootMargin: '-45% 0px -50% 0px' },
	);

	targets.forEach((t) => observer.observe(t.el));
})();
