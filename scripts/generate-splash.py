"""Render the static first frame of ClockFace for the native launch screen."""
from pathlib import Path
import math
from PIL import Image, ImageDraw

SCALE = 4
image = Image.new('RGBA', (320 * SCALE, 320 * SCALE))
color = (215, 161, 124)

def layer(draw_shape):
    overlay = Image.new('RGBA', image.size)
    draw_shape(ImageDraw.Draw(overlay))
    image.alpha_composite(overlay)

def bounds(radius):
    return tuple(v * SCALE for v in (160-radius, 160-radius, 160+radius, 160+radius))

# Match the radial gradient and orbit in src/components/ClockFace.tsx.
for radius in range(157 * SCALE, 0, -1):
    position = radius / (157 * SCALE)
    stops = [(0, 0), (.62, 0), (.8, .065), (.88, .025), (1, 0)]
    for (a, av), (b, bv) in zip(stops, stops[1:]):
        if a <= position <= b:
            alpha = av + (bv-av) * (position-a)/(b-a)
            ImageDraw.Draw(image).ellipse(bounds(radius/SCALE), fill=(*color, round(alpha*255)))
            break
layer(lambda d: d.ellipse(bounds(126), outline=(*color, 41), width=SCALE))
for index in range(32):
    opacity = .015 + (index / 31)**2 * .4
    for width, alpha in [(8, opacity*.09), (1.7, opacity)]:
        layer(lambda d: d.arc(bounds(136), -218+index*4, -214+index*4, fill=(*color, round(alpha*255)), width=round(width*SCALE)))
layer(lambda d: d.arc(bounds(113), 35, 130, fill=(*color, 31), width=3))
layer(lambda d: d.ellipse(tuple(v*SCALE for v in (158,22,162,26)), fill=(*color,166)))
image.resize((640,640), Image.Resampling.LANCZOS).save(Path(__file__).resolve().parent.parent / 'assets/splash-halo.png')
