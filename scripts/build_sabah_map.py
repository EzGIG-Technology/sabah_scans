"""Build src/data/sabahMap.js: Sabah district outlines, neighbouring land and town points.

Sources (download first):
  geoBoundaries MYS ADM2, simplified (CC BY 4.0):
    https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/MYS/ADM2/geoBoundaries-MYS-ADM2_simplified.geojson
  Natural Earth 1:10m countries as TopoJSON (public domain), from the world-atlas npm package:
    npm pack world-atlas@2.0.2  ->  package/countries-10m.json

Usage:
  python3 scripts/build_sabah_map.py <mys_adm2.geojson> <countries-10m.json> src/data/sabahMap.js

The script checks that every town point falls inside its own district and prints any that do not.
"""
import json, sys, math
adm2_path, topo_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]

LON0, LON1, LAT0, LAT1 = 114.75, 119.45, 7.55, 3.75   # view: west, east, north, south
K = 200.0
COSL = math.cos(math.radians(5.6))
W = round((LON1 - LON0) * K * COSL, 1); H = round((LAT0 - LAT1) * K, 1)
def proj(lon, lat): return ((lon - LON0) * K * COSL, (LAT0 - lat) * K)

def dp(pts, tol):
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay; L = math.hypot(dx, dy) or 1e-12
        best, bi = -1, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / L if (dx or dy) else math.hypot(px - ax, py - ay)
            if d > best: best, bi = d, i
        if best > tol:
            keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def area(ring):
    return abs(sum(ring[i][0] * ring[i - 1][1] - ring[i - 1][0] * ring[i][1] for i in range(len(ring)))) / 2

def ring_path(ring):
    pts = [proj(x, y) for x, y in ring]
    out = []; last = None
    for x, y in pts:
        p = (round(x, 1), round(y, 1))
        if p != last: out.append(p); last = p
    if len(out) < 3: return ''
    return 'M' + 'L'.join(f'{x:g},{y:g}' for x, y in out) + 'Z'

def polys_of(geom):
    return geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]

def in_view(ring, pad=0.4):
    xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
    return max(xs) > LON0 - pad and min(xs) < LON1 + pad and max(ys) > LAT1 - pad and min(ys) < LAT0 + pad

def clamp(ring, pad=0.25):
    return [(min(max(x, LON0 - pad), LON1 + pad), min(max(y, LAT1 - pad), LAT0 + pad)) for x, y in ring]

REGION = {
  'Kudat': 'kudat', 'Kota Marudu': 'kudat', 'Pitas': 'kudat',
  'Kota Kinabalu': 'kk', 'Penampang': 'kk', 'Putatan': 'kk', 'Papar': 'kk', 'Tuaran': 'kk', 'Kota Belud': 'kk', 'Ranau': 'kk',
  'Beaufort': 'beaufort', 'Kuala Penyu': 'beaufort', 'Sipitang': 'beaufort',
  'Keningau': 'keningau', 'Tenom': 'keningau', 'Tambunan': 'keningau', 'Nabawan / Persiangan': 'keningau',
  'Sandakan': 'sandakan', 'Beluran': 'sandakan', 'Telupid': 'sandakan', 'Kinabatangan': 'sandakan', 'Tongod': 'sandakan',
  'Lahad Datu': 'lahaddatu', 'Kunak': 'lahaddatu',
  'Tawau': 'tawau', 'Kalabakan': 'tawau',
  'Semporna': 'semporna',
}

adm2 = json.load(open(adm2_path))
sabah, sabah_rings, context = [], {}, []
for f in adm2['features']:
    name = f['properties']['shapeName']
    for poly in polys_of(f['geometry']):
        outer = poly[0]
        if not in_view(outer): continue
        if name in REGION:
            if area(outer) < 0.00012: continue
            r = dp(outer, 0.0025)
            sabah_rings.setdefault(name, []).append(outer)
            sabah.append((name, ring_path(r)))
        else:
            if area(outer) < 0.0008: continue
            context.append(ring_path(dp(clamp(outer), 0.006)))

# Neighbours from Natural Earth 10m: Brunei, Indonesia, Philippines
topo = json.load(open(topo_path))
sc, tr = topo['transform']['scale'], topo['transform']['translate']
arcs = []
for arc in topo['arcs']:
    x = y = 0; pts = []
    for dx, dy in arc:
        x += dx; y += dy; pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
    arcs.append(pts)
def arc_pts(i): return arcs[i] if i >= 0 else arcs[~i][::-1]
def ring_from(ids):
    pts = []
    for i in ids:
        a = arc_pts(i); pts += a if not pts else a[1:]
    return pts
for g in topo['objects']['countries']['geometries']:
    if g.get('properties', {}).get('name') not in ('Brunei', 'Indonesia', 'Philippines'): continue
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    for poly in polys:
        outer = ring_from(poly[0])
        if not in_view(outer) or area(outer) < 0.0008: continue
        context.append(ring_path(dp(clamp(outer), 0.006)))

# Towns: lon, lat, region, share of the region's registered workers
TOWNS = [
  ('Kota Kinabalu', 116.0735, 5.9804, 'kk', 0.42, True), ('Penampang', 116.105, 5.917, 'kk', 0.12, False), ('Putatan', 116.05, 5.885, 'kk', 0.08, False),
  ('Papar', 115.9333, 5.7333, 'kk', 0.12, False), ('Tuaran', 116.232, 6.178, 'kk', 0.12, False), ('Kota Belud', 116.431, 6.351, 'kk', 0.08, False), ('Ranau', 116.664, 5.954, 'kk', 0.06, False),
  ('Kudat', 116.8477, 6.8837, 'kudat', 0.5, True), ('Kota Marudu', 116.76, 6.48, 'kudat', 0.35, False), ('Pitas', 117.05, 6.70, 'kudat', 0.15, False),
  ('Beaufort', 115.7455, 5.3473, 'beaufort', 0.45, True), ('Membakut', 115.7833, 5.4667, 'beaufort', 0.13, False), ('Kuala Penyu', 115.6017, 5.5714, 'beaufort', 0.12, False), ('Sipitang', 115.565, 5.075, 'beaufort', 0.30, False),
  ('Keningau', 116.1602, 5.3378, 'keningau', 0.45, True), ('Tenom', 115.9471, 5.12, 'keningau', 0.25, False), ('Tambunan', 116.3667, 5.6667, 'keningau', 0.12, False), ('Nabawan', 116.44, 5.04, 'keningau', 0.18, False),
  ('Sandakan', 118.1179, 5.8402, 'sandakan', 0.34, True), ('Beluran', 117.5568, 5.8939, 'sandakan', 0.20, False), ('Telupid', 117.1167, 5.6333, 'sandakan', 0.08, False),
  ('Kinabatangan', 117.85, 5.50, 'sandakan', 0.30, False), ('Tongod', 116.95, 5.27, 'sandakan', 0.08, False),
  ('Lahad Datu', 118.327, 5.0268, 'lahaddatu', 0.68, True), ('Kunak', 118.2526, 4.6853, 'lahaddatu', 0.32, False),
  ('Tawau', 117.8912, 4.2448, 'tawau', 0.72, True), ('Kalabakan', 117.4667, 4.4167, 'tawau', 0.28, False),
  ('Semporna', 118.6111, 4.4791, 'semporna', 1.0, True),
]
def pip(lon, lat, ring):
    inside = False; j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-15) + xi: inside = not inside
        j = i
    return inside
bad = []
for name, lon, lat, reg, share, main in TOWNS:
    hit = [d for d, rings in sabah_rings.items() if any(pip(lon, lat, r) for r in rings)]
    if not hit or REGION[hit[0]] != reg: bad.append((name, hit))
print('town checks failed:', bad)

towns_js = ',\n'.join(
    f"  {{ name: '{n}', region: '{r}', share: {s}, main: {str(m).lower()}, x: {proj(lo, la)[0]:.1f}, y: {proj(lo, la)[1]:.1f} }}"
    for n, lo, la, r, s, m in TOWNS)
dist_js = ',\n'.join(f"  {{ name: '{n}', region: '{REGION[n]}', d: '{d}' }}" for n, d in sabah if d)
kx, ky = proj(116.5583, 6.075)
labels = [('South China Sea', 115.55, 6.95), ('Sulu Sea', 118.55, 6.75), ('Celebes Sea', 119.0, 3.98), ('SARAWAK', 115.25, 4.25), ('KALIMANTAN', 116.55, 3.9), ('BRUNEI', 114.95, 4.62)]
lab_js = ', '.join(f"{{ t: '{t}', x: {proj(lo, la)[0]:.1f}, y: {proj(lo, la)[1]:.1f}, sea: {str('Sea' in t).lower()} }}" for t, lo, la in labels)
js = f"""// Sabah map geometry, generated by scripts/build_sabah_map.py from open boundary data. Do not edit by hand.
// Districts: geoBoundaries MYS ADM2 (CC BY 4.0, www.geoboundaries.org). Neighbouring land: Natural Earth 1:10m (public domain).
// Projection: equirectangular, {K:g} units per degree of latitude, longitude scaled by cos(5.6°). View {LON0}–{LON1}°E, {LAT1}–{LAT0}°N.
export const MAP_W = {W}
export const MAP_H = {H}
export const project = (lon, lat) => [(lon - {LON0}) * {K * COSL:.4f}, ({LAT0} - lat) * {K:g}]

// The 27 districts of Sabah, each tagged with the SCANS reporting area it belongs to (districts in demo.js).
export const SABAH_DISTRICTS = [
{dist_js},
]

// Land outside Sabah: Sarawak, Labuan, Brunei, Kalimantan and the southern Philippines.
export const NEIGHBOURS = '{''.join(context)}'

// Towns with registered workers. share = part of the reporting area's workers who work around this town (sample split).
export const TOWNS = [
{towns_js},
]

export const KINABALU = {{ x: {kx:.1f}, y: {ky:.1f} }}
export const MAP_LABELS = [{lab_js}]
"""
open(out_path, 'w').write(js)
print('districts', len(sabah), 'context rings', len(context), 'bytes', len(js))
