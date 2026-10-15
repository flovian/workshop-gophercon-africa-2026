// Night Safari — a globe of the sightings.
//
// A dark earth under a lattice, with every record that has a position
// plotted as a point. The positions arrive as JSON from the page; the
// colours come from the site's own tokens so the scene matches the CSS.

import { mount } from '/assets/js/threejs.js';

function readPoints() {
	const el = document.getElementById('globe-points');
	if (!el) return [];
	try {
		return JSON.parse(el.textContent) || [];
	} catch (err) {
		return [];
	}
}

function markerGeometry(THREE, data, radius) {
	const positions = new Float32Array(data.length * 3);
	let n = 0;
	for (let i = 0; i < data.length; i++) {
		const lat = (data[i].lat * Math.PI) / 180;
		const lng = (data[i].lng * Math.PI) / 180;
		positions[n++] = radius * Math.cos(lat) * Math.sin(lng);
		positions[n++] = radius * Math.sin(lat);
		positions[n++] = radius * Math.cos(lat) * Math.cos(lng);
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
	return geometry;
}

mount('globe', function ({ THREE, scene, camera, colour, pointer }) {
	const group = new THREE.Group();
	scene.add(group);

	const body = new THREE.Mesh(
		new THREE.SphereGeometry(1.5, 48, 32),
		new THREE.MeshStandardMaterial({
			color: colour('--three-surface', '#151210'),
			roughness: 1,
			metalness: 0,
		}),
	);
	group.add(body);

	const lattice = new THREE.LineSegments(
		new THREE.WireframeGeometry(new THREE.SphereGeometry(1.52, 24, 16)),
		new THREE.LineBasicMaterial({
			color: colour('--three-primary', '#d4a017'),
			transparent: true,
			opacity: 0.13,
		}),
	);
	group.add(lattice);

	const geometry = markerGeometry(THREE, readPoints(), 1.56);
	if (geometry.getAttribute('position').count > 0) {
		group.add(
			new THREE.Points(
				geometry,
				new THREE.PointsMaterial({
					color: colour('--three-accent', '#e2703a'),
					size: 0.045,
					sizeAttenuation: true,
				}),
			),
		);
	}

	scene.add(new THREE.AmbientLight(0xffffff, 0.65));

	const key = new THREE.DirectionalLight(0xffffff, 2.1);
	key.position.set(3, 4, 5);
	scene.add(key);

	const rim = new THREE.DirectionalLight(colour('--three-accent', '#e2703a'), 2.6);
	rim.position.set(-4, 2, -3);
	scene.add(rim);

	camera.position.set(0, 0, 4.4);
	group.rotation.z = 0.32;

	return function (time) {
		group.rotation.y = time * 0.14 + pointer.x * 0.25;
		group.rotation.x = -0.15 + pointer.y * 0.12;
	};
});
