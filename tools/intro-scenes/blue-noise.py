"""Writes intro/scenes/noise.bin: the 128 x 128 x 64 blue-noise volume the cloud renderer dithers its ray marching
with. It stands in for NVIDIA's spatiotemporal blue noise, which three-geospatial loads by default: one 128 x 128
blue-noise mask made here by void-and-cluster (Ulichney 1993), and each of the 64 layers that mask shifted by the
golden ratio, so every frame is blue noise and each pixel steps evenly through its values over time.
Needs numpy. Run from the repository's top folder:  python3 tools/intro-scenes/blue-noise.py"""
import numpy as np

N, DEPTH, SIGMA = 128, 64, 1.9
rng = np.random.default_rng(7)

# A toroidal Gaussian, so the energy of a point wraps round the tile's edges.
d = np.minimum(np.arange(N), N - np.arange(N))
kernel = np.exp(-(d[:, None] ** 2 + d[None, :] ** 2) / (2 * SIGMA ** 2))
kf = np.fft.rfft2(kernel)
energy_of = lambda pts: np.fft.irfft2(np.fft.rfft2(pts) * kf, s=(N, N))
roll = lambda y, x: np.roll(np.roll(kernel, y, 0), x, 1)

# 1. A random tenth of the pixels, relaxed until no point is in a tighter cluster than the largest void.
pts = np.zeros((N, N))
pts.flat[rng.choice(N * N, N * N // 10, replace=False)] = 1
e = energy_of(pts)
while True:
    tight = np.unravel_index(np.argmax(np.where(pts == 1, e, -np.inf)), pts.shape)
    pts[tight] = 0; e -= roll(*tight)
    void = np.unravel_index(np.argmin(np.where(pts == 0, e, np.inf)), pts.shape)
    if void == tight:
        pts[tight] = 1; e += roll(*tight)
        break
    pts[void] = 1; e += roll(*void)
initial = pts.copy(); ones = int(initial.sum())
rank = np.zeros((N, N), dtype=np.int64)

# 2. Rank the initial points from the tightest cluster down.
p, e = initial.copy(), energy_of(initial)
for r in range(ones - 1, -1, -1):
    tight = np.unravel_index(np.argmax(np.where(p == 1, e, -np.inf)), p.shape)
    p[tight] = 0; e -= roll(*tight); rank[tight] = r
# 3. Then fill the largest voids, in order, until every pixel has a rank.
p, e = initial.copy(), energy_of(initial)
for r in range(ones, N * N):
    void = np.unravel_index(np.argmin(np.where(p == 0, e, np.inf)), p.shape)
    p[void] = 1; e += roll(*void); rank[void] = r

mask = (rank + 0.5) / (N * N)
golden = (np.sqrt(5) - 1) / 2
layers = [np.floor(((mask + t * golden) % 1.0) * 256).clip(0, 255).astype(np.uint8) for t in range(DEPTH)]
volume = np.stack(layers)  # depth, height, width: the order the loader reads
volume.tofile('intro/scenes/noise.bin')

# A quick check that it is blue: little energy at low frequencies.
spectrum = np.abs(np.fft.fftshift(np.fft.fft2(mask - mask.mean())))
c = N // 2
print('noise.bin', volume.nbytes, 'bytes; low/high frequency energy:', round(spectrum[c - 4:c + 5, c - 4:c + 5].mean() / spectrum.mean(), 3))
