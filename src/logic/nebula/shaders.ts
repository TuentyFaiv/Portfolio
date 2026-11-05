/*
 * The nebula, drawn from nothing but math: four sheets of curling cloud at different
 * depths, laid out like the design (a band across the top, clusters low on each side,
 * an open middle with thin threads), lit from the upper left. It is sharp at any size
 * because every pixel is computed, never stretched from an image.
 *
 * Two versions of one shader: WGSL for WebGPU and GLSL for WebGL. Keep them in step;
 * the e2e test "both backends draw the same nebula" compares their output.
 *
 * Two scenes share the clouds: the sky behind /story, and a band across the Contact slide.
 * The band is transparent where there is no cloud, and fades out along ragged edges before
 * the rows where the page has text. The ripples' spare floats carry it: r0.w is 1 for the
 * band, r1.w and r2.w are those text rows at the top and bottom, in CSS pixels.
 */

/** Uniform layout shared by both backends: six vec4, in this order. */
export const UNIFORM_FLOATS = 24;

export const glslVertex = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

export const glslFragment = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec4 u_a; // canvas w, h, device pixels per CSS pixel, min(1, w / h)
uniform vec4 u_b; // time, scroll depth, theme (1 dark), cursor presence
uniform vec4 u_c; // parallax x, y, cursor x, y (cursor 0..1, y down)
// Ripples: x, y (0..1, y down), start time. Spare floats: scene, band clear top, bottom.
uniform vec4 u_r0;
uniform vec4 u_r1;
uniform vec4 u_r2;

float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float noise(vec2 p) {
	vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
const mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
float fbm4(vec2 p) { float v = 0.0; float a = 0.5; for (int k = 0; k < 4; k++) { v += a * noise(p); p = turn * p * 2.02 + 1.7; a *= 0.5; } return v; }
float fbm7(vec2 p) { float v = 0.0; float a = 0.5; for (int k = 0; k < 7; k++) { v += a * noise(p); p = turn * p * 2.03 + 3.1; a *= 0.5; } return v; }
float fbm3(vec2 p) { float v = 0.0; float a = 0.5; for (int k = 0; k < 3; k++) { v += a * noise(p); p = turn * p * 2.03 + 3.1; a *= 0.5; } return v; }
float ridge(vec2 p) { float v = 0.0; float a = 0.5; for (int k = 0; k < 4; k++) { v += a * (1.0 - abs(noise(p) * 2.0 - 1.0)); p = turn * p * 2.1 + 4.7; a *= 0.5; } return v; }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/* Where the clouds gather, matching the design: a band across the top, clusters at the
   lower left and lower right, and an open middle. s: screen space, -0.5..0.5 on both
   axes, y up, so the layout holds on wide and tall screens alike. */
float composition(vec2 s) {
	float top = smoothstep(0.02, 0.3, s.y + 0.05 * sin(s.x * 9.0 + 1.0));
	vec2 l = (s - vec2(-0.47, -0.2)) * vec2(3.6, 3.0);
	vec2 r = (s - vec2(0.45, -0.36)) * vec2(3.4, 3.4);
	return clamp(top + exp(-dot(l, l)) + exp(-dot(r, r)), 0.0, 1.0);
}

/* The Contact band: clouds gather on the left, from the email down, and thin out to the
   right and toward the bottom. The page masks the band's edges. */
float band(vec2 s) {
	return clamp(0.2 + 0.85 * (1.0 - smoothstep(0.0, 0.9, s.x)) * smoothstep(-0.9, -0.1, s.y), 0.0, 1.0);
}

vec2 touch(vec2 uv, float aspect) {
	vec2 cursor = (vec2(u_c.z, 1.0 - u_c.w) - 0.5) * vec2(aspect, 1.0);
	vec2 away = uv - cursor;
	float near = exp(-dot(away, away) * 18.0) * u_b.w;
	vec2 offset = away * near * 0.09 + vec2(-away.y, away.x) * near * 0.05;
	for (int k = 0; k < 3; k++) {
		vec4 r = k == 0 ? u_r0 : (k == 1 ? u_r1 : u_r2);
		float age = u_b.x - r.z;
		if (age < 0.0 || age > 2.4) continue;
		vec2 from = uv - (vec2(r.x, 1.0 - r.y) - 0.5) * vec2(aspect, 1.0);
		float d = length(from);
		offset += from / max(d, 0.001) * exp(-pow((d - age * 0.55) * 16.0, 2.0)) * (1.0 - age / 2.4) * 0.028;
	}
	return offset;
}

/* One sheet of cloud at depth z: density, purple rim, light and glow from one field. */
vec4 sheet(vec2 uv, float z, float seed, float shape, float time) {
	vec2 p = uv * z * 0.95 / u_a.w + vec2(seed * 17.3, seed * 9.1) + vec2(time * 0.012, -time * 0.004);
	// Two warps feeding each other: the first bends the field, the second curls it.
	vec2 w1 = vec2(fbm4(p * 0.8 + vec2(time * 0.02, 0.0)), fbm4(p * 0.8 + vec2(5.2, 1.3 - time * 0.015)));
	vec2 w2 = vec2(fbm3(p * 1.6 + w1 * 1.9 + vec2(1.7, 9.2)), fbm3(p * 1.6 + w1 * 1.9 + vec2(8.3, 2.8)));
	vec2 base = p * 1.8 + w2 * 1.5;
	float n = fbm7(base);
	float cut = 0.42 + 0.3 * (1.0 - shape);
	float density = smoothstep(cut, cut + 0.36, n);
	// Lit where the field thins toward the light (upper left), dark in the folds.
	// Light only follows the large shapes, so three octaves on both sides are enough.
	float toward = fbm3(base + vec2(-0.05, 0.06));
	float shade = clamp(0.45 + (fbm3(base) - toward) * 8.0 + (n - cut) * 1.2, 0.0, 1.0);
	float rim = density * (1.0 - smoothstep(0.1, 0.55, density));
	float purple = min(rim * smoothstep(0.3, 0.52, w1.y) * 3.0, 1.0);
	float glow = smoothstep(0.66, 0.95, n) * shade;
	return vec4(density, purple, shade, glow);
}

/* Cloud light to color: deep green in shadow, mint in the light, almost white at the peaks. */
vec3 ramp(float x) {
	vec3 a = vec3(0.02, 0.07, 0.06);
	vec3 b = vec3(0.09, 0.32, 0.25);
	vec3 c = vec3(0.36, 0.72, 0.58);
	vec3 d = vec3(0.66, 0.88, 0.78);
	return x < 0.4 ? mix(a, b, x / 0.4) : (x < 0.8 ? mix(b, c, (x - 0.4) / 0.4) : mix(c, d, (x - 0.8) / 0.2));
}

void main() {
	vec2 pixel = gl_FragCoord.xy;
	float aspect = u_a.x / u_a.y;
	vec2 raw = (pixel / u_a.xy - 0.5) * vec2(aspect, 1.0);
	vec2 moved = touch(raw, aspect);
	vec2 uv = raw - moved;
	float time = u_b.x;
	vec2 spot = pixel / u_a.xy - 0.5 - moved / vec2(aspect, 1.0);
	float shape = u_r0.w > 0.5 ? band(spot) : composition(spot);

	// Four sheets at different depths. The camera flies forward with the scroll; a sheet
	// that passes the camera returns far behind as a new one (its seed changes).
	// A gentle drift through depth: about a third of a layer per slide, so no layer ever
	// rushes past the camera between two slides.
	float camera = u_b.y * 0.32 + time * 0.012;
	vec4 acc = vec4(0.0); // body, light, purple, glow
	float cover = 0.0;
	for (int i = 0; i < 4; i++) {
		float travel = float(i) - camera;
		float z = 0.7 + mod(travel, 4.0);
		float seed = floor(travel / 4.0) * 7.0 + float(i) * 3.1;
		// Layers fade in far away and out near the camera over a long stretch, never at once.
		float fade = smoothstep(4.7, 3.6, z) * smoothstep(0.7, 2.0, z);
		if (fade < 0.01 || cover > 0.97) continue;
		vec2 parallax = u_c.xy * 0.16 / z;
		vec4 s = sheet(uv + parallax, z, seed, shape, time);
		float alpha = s.x * fade * mix(0.3, 0.75, shape);
		float weight = (1.0 - cover) * alpha;
		// x: how lit (0..1), y: purple, z: glow. Farther sheets are a little dimmer.
		float lit = min(s.z * (0.55 + 0.45 * shape) * (1.12 - 0.1 * z) + s.w * 0.2, 0.92);
		acc += weight * vec4(lit, s.y * (0.4 + 0.6 * s.z), s.w, 1.0);
		cover += weight;
	}

	// Thin glowing threads drift across the open middle, as in the design.
	vec2 wuv = uv * 2.6 + vec2(fbm4(uv * 2.0 + time * 0.01), fbm4(uv * 2.0 + 7.3)) * 1.6;
	float threads = pow(ridge(wuv), 5.0) * (1.0 - cover) * (0.35 + 0.65 * (1.0 - shape));
	vec2 q = pixel / u_a.xy;
	// A dim green haze sits behind the clouds, strongest where they gather.
	float haze = (0.25 + 0.75 * smoothstep(0.25, 0.8, fbm4(uv * 1.4 + vec2(time * 0.008, 0.0)))) * (0.25 + 0.75 * shape);
	vec3 space = mix(vec3(0.010, 0.013, 0.020), vec3(0.012, 0.022, 0.024), q.y) + vec3(0.016, 0.07, 0.055) * haze;
	float lit = acc.x / max(cover, 0.001);
	float purple = acc.y / max(cover, 0.001);
	vec3 cloud = mix(ramp(lit), vec3(0.52, 0.40, 0.72) * (0.4 + 0.8 * lit), clamp(purple, 0.0, 0.85));
	vec3 dark = space * (1.0 - cover) + cloud * cover + threads * vec3(0.10, 0.34, 0.26);
	vec2 drift = u_c.xy * u_a.y;
	vec2 grid = (pixel + drift * 0.02) / (13.0 * u_a.z);
	vec2 cell = floor(grid);
	float seed = hash(cell);
	float star = seed > 0.93 ? smoothstep(0.09, 0.02, length(fract(grid) - 0.5 - (vec2(hash(cell + 1.7), hash(cell + 9.2)) - 0.5) * 0.7)) * (0.55 + 0.45 * sin(time * (0.6 + seed) + seed * 40.0)) : 0.0;
	dark += vec3(0.85, 0.95, 1.0) * star * 0.8 * pow(1.0 - cover, 2.0);

	// The band: premultiplied color, transparent where there is no cloud, so the page shows
	// through and the band has no box of its own. Its outline is a ragged, drifting fade that
	// starts past the rows where the page has text.
	if (u_r0.w > 0.5) {
		float css = u_a.z;
		float room = max(u_a.y / css - u_r1.w - u_r2.w, 1.0);
		float rise = min(80.0, room * 0.3);
		float sink = min(140.0, room * 0.4);
		float x = pixel.x / css;
		float high = fbm4(vec2(x * 0.012, time * 0.03));
		float low = fbm4(vec2(x * 0.015 + 9.0, time * 0.03));
		float top = smoothstep(0.0, 1.0, ((u_a.y - pixel.y) / css - u_r1.w - high * rise * 0.5) / (rise * 0.6));
		float bottom = smoothstep(0.0, 1.0, (pixel.y / css - u_r2.w - low * sink * 0.5) / (sink * 0.6));
		float side = (1.0 - smoothstep(0.75, 0.98, q.x + (high - 0.5) * 0.2)) * (1.0 - smoothstep(0.92, 1.0, q.x));
		vec4 night = vec4(cloud * cover + threads * vec3(0.10, 0.34, 0.26) + vec3(0.85, 0.95, 1.0) * star * 0.8 * pow(1.0 - cover, 2.0), cover);
		float w1 = min(cover * 0.9, 0.8);
		float w2 = min(cover * lit * 0.7, 0.45);
		float w3 = min(cover * purple * 1.4, 0.6);
		float w4 = min(threads * 1.2, 0.4);
		float sum = w1 + w2 + w3 + w4;
		vec4 day = vec4(vec3(0.90, 0.70, 0.72) * w1 + vec3(0.78, 0.48, 0.53) * w2 + vec3(0.80, 0.74, 0.93) * w3 + vec3(0.88, 0.72, 0.75) * w4, sum) / max(sum, 1.0);
		vec4 veil = mix(day, night, u_b.z) * top * bottom * side;
		veil.rgb += (hash(pixel + fract(time) * 91.0) - 0.5) / 255.0 * veil.a;
		gl_FragColor = veil;
		return;
	}

	vec3 paper = vec3(0.985, 0.972, 0.968);
	vec3 light = paper
		- (paper - vec3(0.90, 0.70, 0.72)) * min(cover * 0.9 + haze * 0.15, 0.8)
		- (paper - vec3(0.78, 0.48, 0.53)) * min(cover * lit * 0.7, 0.45)
		- (paper - vec3(0.80, 0.74, 0.93)) * min(cover * purple * 1.4, 0.6)
		- (paper - vec3(0.88, 0.72, 0.75)) * min(threads * 1.2, 0.4);

	// The reading area stays calm whatever the clouds do: the centered headline on the
	// first slide, the text column on the others (a centered band on tall screens).
	vec2 sc = q - 0.5;
	float opening = 1.0 - smoothstep(0.3, 0.7, u_b.y);
	float headline = exp(-dot(sc * vec2(2.4, 3.4), sc * vec2(2.4, 3.4)));
	float column = aspect < 1.0 ? exp(-pow(sc.y * 3.0, 2.0)) : smoothstep(0.12, -0.28, sc.x) * exp(-pow(sc.y * 2.2, 2.0));
	float calm = mix(column, headline, opening) * 0.72;
	dark *= 1.0 - calm;
	light = mix(light, paper, calm);

	vec3 color = mix(light, dark, u_b.z);
	color += (hash(pixel + fract(time) * 91.0) - 0.5) / 255.0;
	gl_FragColor = vec4(color, 1.0);
}
`;

export const wgsl = /* wgsl */ `
struct Uniforms {
	a: vec4f, // canvas w, h, device pixels per CSS pixel, min(1, w / h)
	b: vec4f, // time, scroll depth, theme (1 dark), cursor presence
	c: vec4f, // parallax x, y, cursor x, y (cursor 0..1, y down)
	r0: vec4f, // ripples: x, y (0..1, y down), start time; spare floats: scene, band clear top, bottom
	r1: vec4f,
	r2: vec4f,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

@vertex
fn vertex_main(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
	let corners = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
	return vec4f(corners[index], 0.0, 1.0);
}

fn hash(p: vec2f) -> f32 {
	var q = fract(vec3f(p.x, p.y, p.x) * 0.1031);
	q += dot(q, q.yzx + 33.33);
	return fract((q.x + q.y) * q.z);
}

fn noise(p: vec2f) -> f32 {
	let i = floor(p);
	let f = fract(p);
	let w = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash(i), hash(i + vec2f(1.0, 0.0)), w.x),
		mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), w.x),
		w.y
	);
}

const turn = mat2x2f(0.8, 0.6, -0.6, 0.8);

fn fbm4(start: vec2f) -> f32 {
	var p = start;
	var v = 0.0;
	var a = 0.5;
	for (var k = 0; k < 4; k++) { v += a * noise(p); p = turn * p * 2.02 + 1.7; a *= 0.5; }
	return v;
}

fn fbm7(start: vec2f) -> f32 {
	var p = start;
	var v = 0.0;
	var a = 0.5;
	for (var k = 0; k < 7; k++) { v += a * noise(p); p = turn * p * 2.03 + 3.1; a *= 0.5; }
	return v;
}

fn fbm3(start: vec2f) -> f32 {
	var p = start;
	var v = 0.0;
	var a = 0.5;
	for (var k = 0; k < 3; k++) { v += a * noise(p); p = turn * p * 2.03 + 3.1; a *= 0.5; }
	return v;
}

fn ridge(start: vec2f) -> f32 {
	var p = start;
	var v = 0.0;
	var a = 0.5;
	for (var k = 0; k < 4; k++) { v += a * (1.0 - abs(noise(p) * 2.0 - 1.0)); p = turn * p * 2.1 + 4.7; a *= 0.5; }
	return v;
}

fn composition(s: vec2f) -> f32 {
	let top = smoothstep(0.02, 0.3, s.y + 0.05 * sin(s.x * 9.0 + 1.0));
	let l = (s - vec2f(-0.47, -0.2)) * vec2f(3.6, 3.0);
	let r = (s - vec2f(0.45, -0.36)) * vec2f(3.4, 3.4);
	return clamp(top + exp(-dot(l, l)) + exp(-dot(r, r)), 0.0, 1.0);
}

fn band(s: vec2f) -> f32 {
	return clamp(0.2 + 0.85 * (1.0 - smoothstep(0.0, 0.9, s.x)) * smoothstep(-0.9, -0.1, s.y), 0.0, 1.0);
}

fn ripple(index: i32) -> vec4f {
	if (index == 0) { return u.r0; }
	if (index == 1) { return u.r1; }
	return u.r2;
}

fn touch(uv: vec2f, aspect: f32) -> vec2f {
	let cursor = (vec2f(u.c.z, 1.0 - u.c.w) - 0.5) * vec2f(aspect, 1.0);
	let away = uv - cursor;
	let near = exp(-dot(away, away) * 18.0) * u.b.w;
	var offset = away * near * 0.09 + vec2f(-away.y, away.x) * near * 0.05;
	for (var k = 0; k < 3; k++) {
		let r = ripple(k);
		let age = u.b.x - r.z;
		if (age < 0.0 || age > 2.4) { continue; }
		let away_from = uv - (vec2f(r.x, 1.0 - r.y) - 0.5) * vec2f(aspect, 1.0);
		let d = length(away_from);
		offset += away_from / max(d, 0.001) * exp(-pow((d - age * 0.55) * 16.0, 2.0)) * (1.0 - age / 2.4) * 0.028;
	}
	return offset;
}

fn sheet(uv: vec2f, z: f32, seed: f32, shape: f32, time: f32) -> vec4f {
	let p = uv * z * 0.95 / u.a.w + vec2f(seed * 17.3, seed * 9.1) + vec2f(time * 0.012, -time * 0.004);
	let w1 = vec2f(fbm4(p * 0.8 + vec2f(time * 0.02, 0.0)), fbm4(p * 0.8 + vec2f(5.2, 1.3 - time * 0.015)));
	let w2 = vec2f(fbm3(p * 1.6 + w1 * 1.9 + vec2f(1.7, 9.2)), fbm3(p * 1.6 + w1 * 1.9 + vec2f(8.3, 2.8)));
	let base = p * 1.8 + w2 * 1.5;
	let n = fbm7(base);
	let cut = 0.42 + 0.3 * (1.0 - shape);
	let density = smoothstep(cut, cut + 0.36, n);
	let toward = fbm3(base + vec2f(-0.05, 0.06));
	let shade = clamp(0.45 + (fbm3(base) - toward) * 8.0 + (n - cut) * 1.2, 0.0, 1.0);
	let rim = density * (1.0 - smoothstep(0.1, 0.55, density));
	let purple = min(rim * smoothstep(0.3, 0.52, w1.y) * 3.0, 1.0);
	let glow = smoothstep(0.66, 0.95, n) * shade;
	return vec4f(density, purple, shade, glow);
}

fn ramp(x: f32) -> vec3f {
	let a = vec3f(0.02, 0.07, 0.06);
	let b = vec3f(0.09, 0.32, 0.25);
	let c = vec3f(0.36, 0.72, 0.58);
	let d = vec3f(0.66, 0.88, 0.78);
	if (x < 0.4) { return mix(a, b, x / 0.4); }
	if (x < 0.8) { return mix(b, c, (x - 0.4) / 0.4); }
	return mix(c, d, (x - 0.8) / 0.2);
}

fn wrap(x: f32, y: f32) -> f32 { return x - y * floor(x / y); }

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
	// WebGPU counts rows from the top; the math below counts from the bottom, like WebGL.
	let pixel = vec2f(position.x, u.a.y - position.y);
	let aspect = u.a.x / u.a.y;
	let raw = (pixel / u.a.xy - 0.5) * vec2f(aspect, 1.0);
	let moved = touch(raw, aspect);
	let uv = raw - moved;
	let time = u.b.x;
	let spot = pixel / u.a.xy - 0.5 - moved / vec2f(aspect, 1.0);
	var shape = composition(spot);
	if (u.r0.w > 0.5) { shape = band(spot); }

	let camera = u.b.y * 0.32 + time * 0.012;
	var acc = vec4f(0.0);
	var cover = 0.0;
	for (var i = 0; i < 4; i++) {
		let travel = f32(i) - camera;
		let z = 0.7 + wrap(travel, 4.0);
		let seed = floor(travel / 4.0) * 7.0 + f32(i) * 3.1;
		let fade = smoothstep(4.7, 3.6, z) * smoothstep(0.7, 2.0, z);
		if (fade < 0.01 || cover > 0.97) { continue; }
		let parallax = u.c.xy * 0.16 / z;
		let s = sheet(uv + parallax, z, seed, shape, time);
		let alpha = s.x * fade * mix(0.3, 0.75, shape);
		let weight = (1.0 - cover) * alpha;
		let lit = min(s.z * (0.55 + 0.45 * shape) * (1.12 - 0.1 * z) + s.w * 0.2, 0.92);
		acc += weight * vec4f(lit, s.y * (0.4 + 0.6 * s.z), s.w, 1.0);
		cover += weight;
	}

	let wuv = uv * 2.6 + vec2f(fbm4(uv * 2.0 + time * 0.01), fbm4(uv * 2.0 + 7.3)) * 1.6;
	let threads = pow(ridge(wuv), 5.0) * (1.0 - cover) * (0.35 + 0.65 * (1.0 - shape));
	let q = pixel / u.a.xy;
	let haze = (0.25 + 0.75 * smoothstep(0.25, 0.8, fbm4(uv * 1.4 + vec2f(time * 0.008, 0.0)))) * (0.25 + 0.75 * shape);
	let space = mix(vec3f(0.010, 0.013, 0.020), vec3f(0.012, 0.022, 0.024), q.y) + vec3f(0.016, 0.07, 0.055) * haze;
	let lit = acc.x / max(cover, 0.001);
	let purple = acc.y / max(cover, 0.001);
	let cloud = mix(ramp(lit), vec3f(0.52, 0.40, 0.72) * (0.4 + 0.8 * lit), clamp(purple, 0.0, 0.85));
	var dark = space * (1.0 - cover) + cloud * cover + threads * vec3f(0.10, 0.34, 0.26);

	let drift = u.c.xy * u.a.y;
	let grid = (pixel + drift * 0.02) / (13.0 * u.a.z);
	let cell = floor(grid);
	let seed = hash(cell);
	var star = 0.0;
	if (seed > 0.93) {
		let offset = (vec2f(hash(cell + 1.7), hash(cell + 9.2)) - 0.5) * 0.7;
		star = smoothstep(0.09, 0.02, length(fract(grid) - 0.5 - offset)) * (0.55 + 0.45 * sin(time * (0.6 + seed) + seed * 40.0));
	}
	dark += vec3f(0.85, 0.95, 1.0) * star * 0.8 * pow(1.0 - cover, 2.0);

	if (u.r0.w > 0.5) {
		let css = u.a.z;
		let room = max(u.a.y / css - u.r1.w - u.r2.w, 1.0);
		let rise = min(80.0, room * 0.3);
		let sink = min(140.0, room * 0.4);
		let x = pixel.x / css;
		let high = fbm4(vec2f(x * 0.012, time * 0.03));
		let low = fbm4(vec2f(x * 0.015 + 9.0, time * 0.03));
		let top = smoothstep(0.0, 1.0, ((u.a.y - pixel.y) / css - u.r1.w - high * rise * 0.5) / (rise * 0.6));
		let bottom = smoothstep(0.0, 1.0, (pixel.y / css - u.r2.w - low * sink * 0.5) / (sink * 0.6));
		let side = (1.0 - smoothstep(0.75, 0.98, q.x + (high - 0.5) * 0.2)) * (1.0 - smoothstep(0.92, 1.0, q.x));
		let night = vec4f(cloud * cover + threads * vec3f(0.10, 0.34, 0.26) + vec3f(0.85, 0.95, 1.0) * star * 0.8 * pow(1.0 - cover, 2.0), cover);
		let w1 = min(cover * 0.9, 0.8);
		let w2 = min(cover * lit * 0.7, 0.45);
		let w3 = min(cover * purple * 1.4, 0.6);
		let w4 = min(threads * 1.2, 0.4);
		let sum = w1 + w2 + w3 + w4;
		let day = vec4f(vec3f(0.90, 0.70, 0.72) * w1 + vec3f(0.78, 0.48, 0.53) * w2 + vec3f(0.80, 0.74, 0.93) * w3 + vec3f(0.88, 0.72, 0.75) * w4, sum) / max(sum, 1.0);
		var veil = mix(day, night, u.b.z) * top * bottom * side;
		veil = vec4f(veil.rgb + (hash(pixel + fract(time) * 91.0) - 0.5) / 255.0 * veil.a, veil.a);
		return veil;
	}

	let paper = vec3f(0.985, 0.972, 0.968);
	var light = paper
		- (paper - vec3f(0.90, 0.70, 0.72)) * min(cover * 0.9 + haze * 0.15, 0.8)
		- (paper - vec3f(0.78, 0.48, 0.53)) * min(cover * lit * 0.7, 0.45)
		- (paper - vec3f(0.80, 0.74, 0.93)) * min(cover * purple * 1.4, 0.6)
		- (paper - vec3f(0.88, 0.72, 0.75)) * min(threads * 1.2, 0.4);

	// The reading area stays calm whatever the clouds do: the centered headline on the
	// first slide, the text column on the others (a centered band on tall screens).
	let sc = q - 0.5;
	let opening = 1.0 - smoothstep(0.3, 0.7, u.b.y);
	let headline = exp(-dot(sc * vec2f(2.4, 3.4), sc * vec2f(2.4, 3.4)));
	var column = smoothstep(0.12, -0.28, sc.x) * exp(-pow(sc.y * 2.2, 2.0));
	if (aspect < 1.0) { column = exp(-pow(sc.y * 3.0, 2.0)); }
	let calm = mix(column, headline, opening) * 0.72;
	dark *= 1.0 - calm;
	light = mix(light, paper, calm);

	var color = mix(light, dark, u.b.z);
	color += (hash(pixel + fract(time) * 91.0) - 0.5) / 255.0;
	return vec4f(color, 1.0);
}
`;
