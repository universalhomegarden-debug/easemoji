#!/usr/bin/env python3
"""Generate Ease-Moji icons — purple circle with white smiley."""

import struct, zlib, os, math

def create_png(width, height, pixels):
    def chunk(ct, data):
        c = ct + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw += struct.pack('BBBB', r, g, b, a)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')

def circle(r, cx, cy, x, y):
    return (x - cx)**2 + (y - cy)**2 <= r**2

def create_icon(size):
    pixels = []
    cx = cy = size / 2
    bg_r = size * 0.5  # purple circle radius
    smile_r = size * 0.28
    eye_r = size * 0.06
    eye_y = size * 0.35
    smile_y = size * 0.55
    mouth_y = size * 0.58

    for y in range(size):
        for x in range(size):
            if circle(bg_r, cx, cy, x, y):
                # Purple circle background
                px = (139, 92, 246, 255)  # #8b5cf6

                # White smiling face
                # Eyes
                if circle(eye_r, cx - size*0.14, eye_y, x, y) or \
                   circle(eye_r, cx + size*0.14, eye_y, x, y):
                    px = (255, 255, 255, 255)

                # Smile (rough arc using two circles)
                smile_cx = cx
                smile_cy = smile_y
                if circle(smile_r, smile_cx, smile_cy, x, y) and y > smile_cy + size*0.02:
                    px = (255, 255, 255, 255)

                pixels.append(px)
            else:
                pixels.append((0, 0, 0, 0))  # transparent

    return create_png(size, size, pixels)

icons_dir = os.path.join(os.path.dirname(__file__), '..', 'icons')
for s in [16, 48, 128]:
    png = create_icon(s)
    path = os.path.join(icons_dir, f'icon{s}.png')
    with open(path, 'wb') as f:
        f.write(png)
    print(f'Created {path} ({len(png)} bytes)')
