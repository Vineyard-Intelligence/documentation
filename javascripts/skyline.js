/*
 * The procedural night-city skyline from vineyard.run, reused as the documentation home page's
 * background so the two front doors look like the same product.
 *
 * COPIED, not imported, and that is the honest description: website/index.html is a single
 * hand-written file with no build step and this site is mkdocs, so there is no shared module
 * either could pull from. If the palette changes over there it has to change here too. The
 * alternative was a build step on both sides to share ~200 lines of canvas code, which is a
 * worse trade than one duplicated file.
 *
 * Loaded on EVERY page — mkdocs-material's extra_javascript is global — and does nothing on all
 * but one: it looks for #vy-skyline, which only the home page renders. That is why this needs no
 * per-page template override.
 */

var REDUCE_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// PIXEL SKYLINE: a procedural night-city waterfront, reinterpreting the
// reference art in the site's violet palette. The unlit scene (sky,
// silhouettes, shore) is baked once; every light — windows, stars,
// shore lamps — is drawn live each render, breathing slowly with its
// own phase and speed. The water mirrors the composed scene, so the
// reflection shimmers along with the lights.
(function () {
	var canvas = document.getElementById('vy-skyline');
	if (!canvas || !canvas.getContext) return;
	var ctx = canvas.getContext('2d');
	var dpr = Math.min(window.devicePixelRatio || 1, 2);

	var base = document.createElement('canvas');   // unlit scene, baked once
	var bctx = base.getContext('2d');
	var scene = document.createElement('canvas');  // base + live lights, per render
	var sctx = scene.getContext('2d');

	// palette — violet-dominant, with sparse warm windows like the reference
	var COOL = ['#b197fc', '#9d86e8', '#8672d6', '#d8ccff'];
	var WARM = ['#e6d6a3', '#d9c188'];
	var WARM_RATE = 0.18;
	var REFLECTION_ALPHA = 0.34;

	var width, height, waterY, frame, lights, shimmers;
	// var telemetry = document.getElementById('id_telemetry_nodes');

	function rand(a, b) { return a + Math.random() * (b - a); }
	function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
	function windowColor() { return Math.random() < WARM_RATE ? pick(WARM) : pick(COOL); }

	// every light breathes: slow speed, random phase, never fully off
	function addLight(x, y, w, h, color, baseAlpha) {
		lights.push({
			x: Math.round(x), y: Math.round(y), w: w, h: h,
			color: color, base: baseAlpha,
			phase: rand(0, Math.PI * 2), speed: rand(0.004, 0.016)
		});
	}

	function drawSky() {
		var g = bctx.createLinearGradient(0, 0, 0, waterY);
		g.addColorStop(0, '#020107');
		g.addColorStop(0.6, '#0a0616');
		g.addColorStop(1, '#191033');
		bctx.fillStyle = g;
		bctx.fillRect(0, 0, width, height); // fill past waterline too; water re-tints below

		var count = Math.round(width / 22);
		for (var i = 0; i < count; i++) {
			addLight(Math.random() * width, Math.random() * height * 0.42, 1, 1, '#d2c8ff', rand(0.25, 0.85));
		}
	}

	// one building: silhouette baked, every lit window becomes a live light
	function drawBuilding(x, bw, bh, layer) {
		var top = waterY - bh;
		bctx.fillStyle = layer.sil;
		bctx.fillRect(Math.round(x), Math.round(top), Math.round(bw), Math.round(bh));

		var litRate = rand(layer.litMin, layer.litMax);
		var c = layer.cell;
		for (var wy = top + c.inset; wy < waterY - c.h - 2; wy += c.py) {
			for (var wx = x + c.inset; wx < x + bw - c.w - c.inset; wx += c.px) {
				if (Math.random() > litRate) continue;
				addLight(wx, wy, c.w, c.h, windowColor(), rand(0.4, 1) * layer.alpha);
			}
		}
	}

	function drawLayer(layer) {
		var x = -rand(10, 40);
		while (x < width + 20) {
			var bw = rand(layer.wMin, layer.wMax);
			var bh = waterY * rand(layer.hMin, layer.hMax);
			drawBuilding(x, bw, bh, layer);
			x += bw + rand(layer.gapMin, layer.gapMax);
		}
	}

	// the reference's twin towers, translated into the near layer
	function drawTwinTowers(layer) {
		var tw = Math.max(38, Math.min(72, width * 0.045));
		var xc = width * 0.74;
		drawBuilding(xc - tw - 9, tw, waterY * 0.78, layer);
		drawBuilding(xc + 9, tw, waterY * 0.74, layer);
	}

	function drawShore() {
		// tree silhouettes along the waterline
		bctx.fillStyle = '#05040c';
		for (var x = -6; x < width + 6; x += rand(6, 12)) {
			var th = rand(6, 18);
			var twd = rand(8, 16);
			bctx.beginPath();
			bctx.ellipse(x, waterY - th * 0.4, twd * 0.5, th * 0.6, 0, 0, Math.PI * 2);
			bctx.fill();
		}
		// sparse shore lights peeking through the trees
		for (var lx = rand(10, 40); lx < width; lx += rand(35, 90)) {
			addLight(lx, waterY - 3, 2, 2, Math.random() < 0.5 ? '#e6d6a3' : '#b197fc', rand(0.5, 0.9));
		}
	}

	function buildScene() {
		lights = [];
		shimmers = [];
		bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		bctx.imageSmoothingEnabled = false;
		bctx.clearRect(0, 0, width, height);

		drawSky();

		// far -> mid -> near, so closer (darker) silhouettes overlap
		drawLayer({
			sil: '#0c0918', alpha: 0.45, litMin: 0.08, litMax: 0.26,
			wMin: 34, wMax: 80, hMin: 0.20, hMax: 0.42, gapMin: 2, gapMax: 14,
			cell: { w: 2, h: 2, px: 4, py: 4, inset: 2 }
		});
		var near = {
			sil: '#070510', alpha: 1.0, litMin: 0.15, litMax: 0.50,
			wMin: 50, wMax: 130, hMin: 0.26, hMax: 0.58, gapMin: 4, gapMax: 26,
			cell: { w: 4, h: 3, px: 7, py: 6, inset: 3 }
		};
		drawLayer({
			sil: '#0a0714', alpha: 0.7, litMin: 0.12, litMax: 0.36,
			wMin: 40, wMax: 100, hMin: 0.24, hMax: 0.50, gapMin: 3, gapMax: 18,
			cell: { w: 3, h: 2, px: 5, py: 5, inset: 2 }
		});
		drawTwinTowers(near);
		drawLayer(near);

		drawShore();

		// static shimmer lines on the water, precomputed once
		for (var i = 0; i < Math.round(width / 60); i++) {
			shimmers.push({
				x: Math.round(rand(0, width - 50)),
				y: Math.round(rand(waterY + 2, height - 2)),
				w: Math.round(rand(15, 50)),
				a: rand(0.04, 0.10)
			});
		}

		// if (telemetry) telemetry.textContent = String(lights.length).padStart(4, '0');
	}

	function render() {
		// The animation loop keeps ticking while `resize` is bailing on a 0-sized viewport, and on
		// the very first load that leaves `lights` undefined — so this guard is what stops the
		// bail above from simply moving the exception one function along.
		if (!width || !height || !lights) return;
		// 1) compose: unlit scene + breathing lights
		sctx.setTransform(1, 0, 0, 1, 0, 0);
		sctx.clearRect(0, 0, scene.width, scene.height);
		sctx.drawImage(base, 0, 0);
		sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		for (var i = 0; i < lights.length; i++) {
			var t = lights[i];
			var pulse = REDUCE_MOTION ? 0.85
				: 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * t.speed + t.phase));
			sctx.globalAlpha = t.base * pulse;
			sctx.fillStyle = t.color;
			sctx.fillRect(t.x, t.y, t.w, t.h);
		}
		sctx.globalAlpha = 1;

		// 2) onscreen: scene, then its mirror in the water, then water tint
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(scene, 0, 0);

		var reflH = height - waterY;
		if (reflH > 0) {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.save();
			ctx.globalAlpha = REFLECTION_ALPHA;
			ctx.translate(0, waterY + reflH);
			ctx.scale(1, -1);
			ctx.drawImage(scene,
				0, (waterY - reflH) * dpr, width * dpr, reflH * dpr,
				0, 0, width, reflH);
			ctx.restore();

			var g = ctx.createLinearGradient(0, waterY, 0, height);
			g.addColorStop(0, 'rgba(12,9,26,0.22)');
			g.addColorStop(1, 'rgba(2,1,8,0.58)');
			ctx.fillStyle = g;
			ctx.fillRect(0, waterY, width, reflH);

			for (var s = 0; s < shimmers.length; s++) {
				ctx.fillStyle = 'rgba(177,151,252,' + shimmers[s].a + ')';
				ctx.fillRect(shimmers[s].x, shimmers[s].y, shimmers[s].w, 1);
			}
		}
	}

	function resize() {
		// A zero-sized viewport is not a no-op, it THROWS: `canvas.width = 0` makes `base` a
		// 0x0 canvas and `drawImage` on it raises InvalidStateError, which then kills the frame
		// loop for the rest of the page's life. The website never hit this because it is a
		// standalone page that is always visible; a docs page can be laid out inside a pane
		// that is momentarily 0 wide, and it was — measured, three throws on one load.
		//
		// Bailing leaves the canvas showing its CSS background (#010405, the same night sky),
		// and the resize listener fires again the moment the pane has a size.
		if (!window.innerWidth || !window.innerHeight) return;
		width = window.innerWidth;
		height = window.innerHeight;
		waterY = Math.round(height * 0.88);
		frame = 0;
		canvas.width = base.width = scene.width = width * dpr;
		canvas.height = base.height = scene.height = height * dpr;
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		ctx.imageSmoothingEnabled = false;
		sctx.imageSmoothingEnabled = false;
		buildScene();
		render();
	}

	function loop() {
		frame++;
		if (frame % 5 === 0) render(); // slow breathing; the scene itself is static
		requestAnimationFrame(loop);
	}

	window.addEventListener('resize', resize);
	resize();
	if (!REDUCE_MOTION) requestAnimationFrame(loop);
})();
