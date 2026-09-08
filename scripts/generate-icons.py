"""Render the original YogaBond halo mark at launcher and favicon sizes."""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math

ROOT = Path(__file__).resolve().parent.parent / 'assets'
BACKGROUND = '#181613'
ACCENT = (215, 161, 124)

def render(name, size, adaptive=False):
    scale = 3 if size < 256 else 2
    n = size * scale
    center = n / 2
    radius = n * (.235 if adaptive else .30)
    trail_radius = radius + n * .035
    ink = Image.new('RGBA', (n, n))
    draw = ImageDraw.Draw(ink)
    bounds = lambda r: (center-r, center-r, center+r, center+r)
    draw.ellipse(bounds(radius), outline=(*ACCENT, 60), width=round(n*.007))
    draw.arc(bounds(radius), -90, 155, fill=(*ACCENT, 235), width=round(n*.012))
    for angle in [-90,155]:
        x = center + (radius-n*.006) * math.cos(math.radians(angle))
        y = center + (radius-n*.006) * math.sin(math.radians(angle))
        r = n*.006
        draw.ellipse((x-r,y-r,x+r,y+r), fill=(*ACCENT,235))
    for i in range(100):
        draw.arc(bounds(trail_radius), -190+i, -188+i,
                 fill=(*ACCENT, round(18+225*(i/99)**2)), width=max(2,round(n*.007)))
    r=n*.007
    draw.ellipse((center-r,center-trail_radius+n*.0035-r,center+r,center-trail_radius+n*.0035+r),fill=(*ACCENT,255))
    glow=ink.filter(ImageFilter.GaussianBlur(n*.012))
    glow.putalpha(glow.getchannel('A').point(lambda a: round(a*.45)))
    result=Image.new('RGBA',(n,n),(0,0,0,0) if adaptive else BACKGROUND)
    result=Image.alpha_composite(Image.alpha_composite(result,glow),ink)
    result=result.resize((size,size),Image.Resampling.LANCZOS)
    if not adaptive: result=result.convert('RGB')
    result.save(ROOT/name)

render('icon.png',1024)
render('adaptive-icon.png',1024,True)
render('favicon.png',64)
