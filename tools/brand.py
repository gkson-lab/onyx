"""
Draws the Onyx Agents mark and writes every file that carries it.

The mark is a pentagon-cut onyx seen from above: five facets (the five specialists) round a lit table (Onyx
Core). The cuts between the facets run to the corners, as a stone's do, and the light comes from the upper right,
so the top-right facet is the brightest. Every file below is drawn from the one geometry in this script.

  brand/onyx-mark.svg          shaded: the facets in five greys, the table white (for dark grounds)
  brand/onyx-mark-mono.svg     one colour (currentColor), the facets at five opacities (the app, both themes)
  brand/onyx-mark-solid.svg    one flat colour (currentColor): badges and the smallest sizes
  brand/onyx-icon.svg          the app icon: the shaded mark on a near-black rounded square
  agents/apps/web/public/      icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png,
                               badge-96.png (the browser tab, the phone's home screen, notifications)
  agents/onyx.ico              the Windows shortcuts' icon (16 to 256 px)

Run from the repository's top folder: python3 tools/brand.py  (needs Pillow)
"""
import math
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The geometry, in a 100 x 100 box. The pentagon stands on a flat side; CY centres its bounding box.
R_OUT, R_IN, CORE, GAP = 47.0, 31.0, 18.0, 5.0
CX, CY = 50.0, 54.5

# Facet k lies between corners k and k+1, corner 0 at the top, going clockwise: 0 is the top-right facet.
SHADES = ['#e2e2e2', '#727272', '#3d3d3d', '#2b2b2b', '#9b9b9b']
OPACITY = [0.92, 0.5, 0.32, 0.26, 0.66]
TABLE = '#f6f6f6'
GROUND = '#0b0b0b'


def pentagon(r, cx=CX, cy=CY):
	return [(cx + r * math.cos(math.radians(-90 + 72 * k)), cy + r * math.sin(math.radians(-90 + 72 * k))) for k in range(5)]


def _along(p, q, d):
	length = math.dist(p, q)
	return (p[0] + (q[0] - p[0]) * d / length, p[1] + (q[1] - p[1]) * d / length)


def facets():
	"""The five facets, each a quadrilateral: outer edge pulled in from the corners by half the gap."""
	o, i = pentagon(R_OUT), pentagon(R_IN)
	inner_gap = GAP / 2 * R_IN / R_OUT
	return [[_along(o[k], o[(k + 1) % 5], GAP / 2), _along(o[(k + 1) % 5], o[k], GAP / 2),
	         _along(i[(k + 1) % 5], i[k], inner_gap), _along(i[k], i[(k + 1) % 5], inner_gap)] for k in range(5)]


def table():
	return pentagon(CORE)


def _pts(points):
	return ' '.join(f'{x:.2f},{y:.2f}' for x, y in points)


def svg_body(kind):
	parts = []
	for k, f in enumerate(facets()):
		if kind == 'shaded':
			parts.append(f'<path d="M{_pts(f)}Z" fill="{SHADES[k]}"/>')
		elif kind == 'mono':
			parts.append(f'<path d="M{_pts(f)}Z" fill="currentColor" fill-opacity="{OPACITY[k]}"/>')
		else:
			parts.append(f'<path d="M{_pts(f)}Z" fill="currentColor"/>')
	parts.append(f'<path d="M{_pts(table())}Z" fill="{TABLE if kind == "shaded" else "currentColor"}"/>')
	return ''.join(parts)


def svg(kind, tile=False):
	body = svg_body(kind)
	if tile:
		body = f'<rect width="100" height="100" rx="22.5" fill="{GROUND}"/><g transform="translate(18 18) scale(0.64)">{body}</g>'
	return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">{body}</svg>\n'


def png(size, kind='shaded', ground=None, rounded=True, scale=0.64, color=(255, 255, 255, 255)):
	"""Draws the mark with Pillow at 8x and scales down: ground None is a clear background."""
	ss = 8
	big = size * ss
	im = Image.new('RGBA', (big, big), (0, 0, 0, 0))
	d = ImageDraw.Draw(im)
	if ground:
		if rounded:
			d.rounded_rectangle([0, 0, big - 1, big - 1], radius=int(big * 0.225), fill=ground)
		else:
			d.rectangle([0, 0, big, big], fill=ground)
	# The mark's bounding box is centred on (50, 50): scale it about that point.
	tx = lambda p: ((50 + (p[0] - 50) * scale) * big / 100, (50 + (p[1] - 50) * scale) * big / 100)

	def fill_of(k):
		if kind == 'solid':
			return color
		h = SHADES[k].lstrip('#')
		return tuple(int(h[j:j + 2], 16) for j in (0, 2, 4)) + (255,)

	for k, f in enumerate(facets()):
		d.polygon([tx(p) for p in f], fill=fill_of(k))
	t = TABLE.lstrip('#')
	d.polygon([tx(p) for p in table()], fill=color if kind == 'solid' else tuple(int(t[j:j + 2], 16) for j in (0, 2, 4)) + (255,))
	return im.resize((size, size), Image.LANCZOS)


def write(path, text):
	path = os.path.join(ROOT, path)
	os.makedirs(os.path.dirname(path), exist_ok=True)
	with open(path, 'w', newline='\n') as f:
		f.write(text)
	print('wrote', os.path.relpath(path, ROOT))


def save(im, path, **kw):
	path = os.path.join(ROOT, path)
	os.makedirs(os.path.dirname(path), exist_ok=True)
	im.save(path, **kw)
	print('wrote', os.path.relpath(path, ROOT))


def main():
	write('brand/onyx-mark.svg', svg('shaded'))
	write('brand/onyx-mark-mono.svg', svg('mono'))
	write('brand/onyx-mark-solid.svg', svg('solid'))
	write('brand/onyx-icon.svg', svg('shaded', tile=True))
	pub = 'agents/apps/web/public'
	write(f'{pub}/icon.svg', svg('shaded', tile=True))
	save(png(192, ground=GROUND), f'{pub}/icon-192.png', optimize=True)
	save(png(512, ground=GROUND), f'{pub}/icon-512.png', optimize=True)
	# Maskable: the platform cuts its own shape, so the ground fills the square and the mark keeps to the middle.
	save(png(512, ground=GROUND, rounded=False, scale=0.56), f'{pub}/icon-maskable-512.png', optimize=True)
	# iOS rounds the corners itself and shows any transparency as black.
	save(png(180, ground=GROUND, rounded=False, scale=0.62).convert('RGB'), f'{pub}/apple-touch-icon.png', optimize=True)
	# Android draws a notification's badge from its alpha only.
	save(png(96, kind='solid', scale=0.86), f'{pub}/badge-96.png', optimize=True)
	# Windows: each size drawn on its own, the smallest with the mark larger in its square.
	sizes = [256, 128, 64, 48, 32, 24, 16]
	ims = [png(s, ground=GROUND, scale=0.64 if s >= 32 else 0.78) for s in sizes]
	save(ims[0], 'agents/onyx.ico', format='ICO', sizes=[(s, s) for s in sizes], append_images=ims[1:])


if __name__ == '__main__':
	main()
