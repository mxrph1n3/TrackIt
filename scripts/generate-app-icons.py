#!/usr/bin/env python3
"""
Premium TrackIt app icon concepts — vector-precise, supersampled PNG exports.

Uses exact brand tokens from src/theme/designTokens.ts and Action Hub geometry.
Output: assets/icon-concepts/premium/
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "icon-concepts" / "premium"
SIZE = 1024
V4_ICON_SIZE = 1040
V4_ZOOM = 1.36
SUPER = 4  # render at SIZE*SUPER, downscale with LANCZOS

# Brand tokens
OBSIDIAN = (7, 7, 10)
ETHEREAL_BG = (243, 245, 250)
ETHEREAL_BG_END = (226, 217, 255)
OBSIDIAN_END = (16, 16, 26)
OBSIDIAN_DISK = (22, 18, 38)
OBSIDIAN_INNER = (42, 37, 64)
OBSIDIAN_INNER_DARK = (22, 18, 42)
PRIMARY = (119, 93, 216)
PRIMARY_LIGHT = (149, 128, 232)
PRIMARY_DEEP = (98, 73, 192)
CRYSTAL = (124, 92, 252)
CRYSTAL_INK = (30, 26, 62)
BORDER_GLOW = (149, 128, 232)
WHITE = (255, 255, 255)

# Radial hub accent dots (actionHubRadial.ts)
ORBIT_DOTS = [
    (119, 93, 216),   # task
    (119, 93, 216),   # workout
    (245, 158, 11),   # meal
    (99, 102, 241),   # habit
    (52, 211, 153),   # expense
    (5, 150, 105),    # income
]


def _clamp(v: float, lo: float = 0.0, hi: float = 255.0) -> int:
    return int(max(lo, min(hi, round(v))))


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _lerp_rgb(c1: tuple[int, ...], c2: tuple[int, ...], t: float) -> tuple[int, int, int]:
    return (
        _clamp(_lerp(c1[0], c2[0], t)),
        _clamp(_lerp(c1[1], c2[1], t)),
        _clamp(_lerp(c1[2], c2[2], t)),
    )


def _new_canvas() -> Image.Image:
    return Image.new("RGBA", (SIZE * SUPER, SIZE * SUPER), (0, 0, 0, 0))


def _finalize(img: Image.Image) -> Image.Image:
    return img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def _obsidian_background(draw: ImageDraw.ImageDraw, w: int, h: int) -> None:
    """Subtle radial vignette — not flat black."""
    cx, cy = w / 2, h / 2
    max_r = math.hypot(cx, cy)
    for y in range(0, h, SUPER):
        for x in range(0, w, SUPER):
            t = math.hypot(x - cx, y - cy) / max_r
            color = _lerp_rgb(OBSIDIAN, OBSIDIAN_END, t * 0.55)
            draw.rectangle([x, y, x + SUPER - 1, y + SUPER - 1], fill=(*color, 255))


def _draw_radial_gradient(
    base: Image.Image,
    cx: float,
    cy: float,
    radius: float,
    inner: tuple[int, int, int],
    outer: tuple[int, int, int],
) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    steps = int(radius)
    for i in range(steps, 0, -1):
        t = 1 - i / steps
        color = _lerp_rgb(outer, inner, t)
        alpha = _clamp(255 * (0.92 + 0.08 * t))
        r = i
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, alpha))
    base.alpha_composite(layer)


def _draw_soft_glow(
    base: Image.Image,
    cx: float,
    cy: float,
    radius: float,
    color: tuple[int, int, int],
    alpha: float = 0.35,
) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    steps = 12
    for i in range(steps, 0, -1):
        t = i / steps
        r = radius * t
        a = _clamp(255 * alpha * (1 - t) * (1 - t))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, a))
    blurred = layer.filter(ImageFilter.GaussianBlur(radius=radius * 0.08))
    base.alpha_composite(blurred)


def _draw_aa_circle(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    radius: float,
    fill: tuple[int, int, int, int] | None = None,
    outline: tuple[int, int, int, int] | None = None,
    width: int = 1,
) -> None:
    bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
    if fill:
        draw.ellipse(bbox, fill=fill)
    if outline:
        draw.ellipse(bbox, outline=outline, width=width)


def _draw_crystal_emblem(
    base: Image.Image,
    cx: float,
    cy: float,
    size: float,
    color: tuple[int, int, int] = CRYSTAL,
) -> None:
    """CrystalEmblemIcon with facet depth — outer gradient + inner core."""
    s = size / 24
    outer = [
        (cx, cy - 9 * s),
        (cx + 9 * s, cy),
        (cx, cy + 9 * s),
        (cx - 9 * s, cy),
    ]
    inner = [
        (cx, cy - 5 * s),
        (cx + 5 * s, cy),
        (cx, cy + 5 * s),
        (cx - 5 * s, cy),
    ]

    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Outer diamond — per-facet shading
    facets = [
        ([outer[0], outer[1], (cx, cy)], PRIMARY_LIGHT),
        ([outer[1], outer[2], (cx, cy)], color),
        ([outer[2], outer[3], (cx, cy)], PRIMARY_DEEP),
        ([outer[3], outer[0], (cx, cy)], PRIMARY),
    ]
    for tri, fc in facets:
        draw.polygon(tri, fill=(*fc, 255))

    draw.polygon(inner, fill=(*color, 105))

    # Top-left specular edge
    draw.line([outer[0], outer[1]], fill=(*WHITE, 55), width=max(1, SUPER // 2))

    base.alpha_composite(layer)


def _draw_medallion_shell(
    base: Image.Image,
    cx: float,
    cy: float,
    outer_r: float,
    inner_r: float,
) -> None:
    _draw_soft_glow(base, cx, cy, outer_r * 1.35, PRIMARY, alpha=0.28)

    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Outer glass ring
    _draw_aa_circle(draw, cx, cy, outer_r, fill=(*OBSIDIAN_DISK, 235))
    _draw_aa_circle(
        draw,
        cx,
        cy,
        outer_r,
        outline=(*BORDER_GLOW, 115),
        width=max(1, SUPER),
    )

    base.alpha_composite(layer)

    # Inner disk gradient
    _draw_radial_gradient(base, cx, cy, inner_r, OBSIDIAN_INNER, OBSIDIAN_INNER_DARK)

    inner_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    idraw = ImageDraw.Draw(inner_layer)
    _draw_aa_circle(idraw, cx, cy, inner_r, outline=(*PRIMARY_LIGHT, 90), width=max(1, SUPER // 2))
    base.alpha_composite(inner_layer)


def render_hub_medallion(
    *,
    include_background: bool = True,
    medallion_scale: float = 0.345,
) -> Image.Image:
    """Action Hub tab-bar FAB — configurable for iOS / Android layers."""
    w = SIZE * SUPER
    img = _new_canvas()

    if include_background:
        bg = Image.new("RGBA", (w, w), (0, 0, 0, 0))
        _obsidian_background(ImageDraw.Draw(bg), w, w)
        img.alpha_composite(bg)

    cx = cy = w / 2
    outer_r = w * medallion_scale
    inner_r = outer_r * 0.86

    _draw_medallion_shell(img, cx, cy, outer_r, inner_r)
    _draw_crystal_emblem(img, cx, cy, outer_r * 0.62, CRYSTAL)

    highlight = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    _draw_aa_circle(
        hd,
        cx - outer_r * 0.22,
        cy - outer_r * 0.28,
        outer_r * 0.55,
        fill=(255, 255, 255, 18),
    )
    highlight = highlight.filter(ImageFilter.GaussianBlur(radius=outer_r * 0.12))
    img.alpha_composite(highlight)

    return _finalize(img)


def icon_hub_medallion() -> Image.Image:
    return render_hub_medallion(include_background=True, medallion_scale=0.345)


def android_icon_foreground() -> Image.Image:
    """Medallion on transparency — fits Android adaptive safe zone (~66%)."""
    return render_hub_medallion(include_background=False, medallion_scale=0.285)


def android_icon_background() -> Image.Image:
    """Obsidian backdrop for adaptive icon."""
    w = SIZE * SUPER
    img = Image.new("RGBA", (w, w), (*OBSIDIAN, 255))
    _obsidian_background(ImageDraw.Draw(img), w, w)
    return _finalize(img)


def android_icon_monochrome() -> Image.Image:
    """Themed icon silhouette — white hub mark on transparency."""
    w = SIZE * SUPER
    img = _new_canvas()
    cx = cy = w / 2
    outer_r = w * 0.285
    inner_r = outer_r * 0.86

    layer = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    _draw_aa_circle(draw, cx, cy, outer_r, fill=(255, 255, 255, 255))
    _draw_aa_circle(draw, cx, cy, inner_r, fill=(255, 255, 255, 255))

    s = (outer_r * 0.62) / 24
    outer = [
        (cx, cy - 9 * s),
        (cx + 9 * s, cy),
        (cx, cy + 9 * s),
        (cx - 9 * s, cy),
    ]
    inner = [
        (cx, cy - 5 * s),
        (cx + 5 * s, cy),
        (cx, cy + 5 * s),
        (cx - 5 * s, cy),
    ]
    draw.polygon(outer, fill=(7, 7, 10, 255))
    draw.polygon(inner, fill=(7, 7, 10, 255))

    img.alpha_composite(layer)
    return _finalize(img)


def favicon_icon() -> Image.Image:
    base = render_hub_medallion(include_background=True, medallion_scale=0.345)
    return base.resize((48, 48), Image.Resampling.LANCZOS)


def splash_icon() -> Image.Image:
    """Center mark for splash — medallion only, transparent edges."""
    return render_hub_medallion(include_background=False, medallion_scale=0.38)


def icon_progress_ring() -> Image.Image:
    """Dashboard overall progress — ring + hub crystal."""
    w = SIZE * SUPER
    img = _new_canvas()
    bg = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    _obsidian_background(ImageDraw.Draw(bg), w, w)
    img.alpha_composite(bg)

    cx = cy = w / 2
    outer_r = w * 0.30
    stroke = max(3, int(w * 0.022))
    progress = 0.68

    _draw_soft_glow(img, cx, cy, outer_r * 1.2, PRIMARY, alpha=0.18)

    draw = ImageDraw.Draw(img)

    # Track ring
    bbox = [cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r]
    draw.arc(bbox, start=0, end=360, fill=(*PRIMARY, 38), width=stroke)

    # Progress arc (starts at top, clockwise)
    draw.arc(
        bbox,
        start=-90,
        end=-90 + 360 * progress,
        fill=(*PRIMARY_LIGHT, 255),
        width=stroke,
    )

    inner_r = outer_r * 0.72
    _draw_radial_gradient(img, cx, cy, inner_r, OBSIDIAN_INNER, OBSIDIAN_DISK)

    inner_layer = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    idraw = ImageDraw.Draw(inner_layer)
    _draw_aa_circle(idraw, cx, cy, inner_r, outline=(*BORDER_GLOW, 70), width=max(1, SUPER // 2))
    img.alpha_composite(inner_layer)

    _draw_crystal_emblem(img, cx, cy, inner_r * 0.62, CRYSTAL)

    return _finalize(img)


def icon_life_radar() -> Image.Image:
    """Four life domains radar — Dashboard progress categories."""
    w = SIZE * SUPER
    img = _new_canvas()
    bg = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    _obsidian_background(ImageDraw.Draw(bg), w, w)
    img.alpha_composite(bg)

    cx = cy = w / 2
    max_r = w * 0.28
    # Discipline, Habits, Mindset, Health — asymmetric progress
    values = [0.82, 0.64, 0.71, 0.58]
    angles = [-90, 0, 90, 180]

    _draw_soft_glow(img, cx, cy, max_r * 1.1, PRIMARY, alpha=0.14)

    layer = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Grid rings
    for ring in (0.35, 0.65, 1.0):
        r = max_r * ring
        _draw_aa_circle(draw, cx, cy, r, outline=(*PRIMARY, 28), width=max(1, SUPER // 2))

    # Axes + filled polygon
    points: list[tuple[float, float]] = []
    for angle_deg, val in zip(angles, values):
        rad = math.radians(angle_deg)
        r = max_r * val
        px = cx + r * math.cos(rad)
        py = cy + r * math.sin(rad)
        points.append((px, py))
        draw.line(
            [(cx, cy), (px, py)],
            fill=(*PRIMARY, 55),
            width=max(1, SUPER),
        )

    draw.polygon(points, fill=(*PRIMARY, 42), outline=(*PRIMARY_LIGHT, 180))

    img.alpha_composite(layer)

    _draw_crystal_emblem(img, cx, cy, max_r * 0.34, CRYSTAL)

    return _finalize(img)


def icon_hub_orbit() -> Image.Image:
    """Radial Action Hub — medallion + 6 action orbit dots."""
    w = SIZE * SUPER
    img = icon_hub_medallion()
    img = img.resize((w, w), Image.Resampling.LANCZOS)

    cx = cy = w / 2
    orbit_r = w * 0.395
    dot_r = w * 0.014

    layer = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    n = len(ORBIT_DOTS)
    for i, color in enumerate(ORBIT_DOTS):
        angle = math.radians(-90 + i * (360 / n))
        px = cx + orbit_r * math.cos(angle)
        py = cy + orbit_r * math.sin(angle)
        _draw_soft_glow(layer, px, py, dot_r * 4, color, alpha=0.45)
        _draw_aa_circle(draw, px, py, dot_r, fill=(*color, 230))
        _draw_aa_circle(draw, px, py, dot_r, outline=(*WHITE, 40), width=max(1, SUPER // 3))

    # Orbit track
    _draw_aa_circle(
        draw,
        cx,
        cy,
        orbit_r,
        outline=(*PRIMARY, 22),
        width=max(1, SUPER // 2),
    )

    img.alpha_composite(layer)
    return _finalize(img)


def icon_crystal_emblem() -> Image.Image:
    """Minimal — nested diamond on obsidian, maximum clarity at small sizes."""
    w = SIZE * SUPER
    img = _new_canvas()
    bg = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    _obsidian_background(ImageDraw.Draw(bg), w, w)
    img.alpha_composite(bg)

    cx = cy = w / 2
    emblem_size = w * 0.44

    _draw_soft_glow(img, cx, cy, emblem_size * 0.95, PRIMARY, alpha=0.38)
    _draw_soft_glow(img, cx, cy, emblem_size * 0.5, PRIMARY_LIGHT, alpha=0.28)

    _draw_crystal_emblem(img, cx, cy, emblem_size, PRIMARY_LIGHT)

    return _finalize(img)


def icon_focus_crystal_photo() -> Image.Image | None:
    """Tight crop of brand crystal — masked, no noise artifacts."""
    source = ROOT / "crystall-dark.png"
    if not source.exists():
        return None

    w = SIZE * SUPER
    img = _new_canvas()
    bg = Image.new("RGBA", (w, w), (0, 0, 0, 0))
    _obsidian_background(ImageDraw.Draw(bg), w, w)
    img.alpha_composite(bg)

    crystal = Image.open(source).convert("RGBA")
    cw, ch = crystal.size
    # Tight crop on hero gem only (right-center of source art)
    crop_size = int(min(cw, ch) * 0.38)
    left = int(cw * 0.48)
    top = int(ch * 0.22)
    crystal = crystal.crop((left, top, left + crop_size, top + crop_size))

    target = int(w * 0.58)
    crystal = crystal.resize((target, target), Image.Resampling.LANCZOS)

    from PIL import ImageEnhance

    crystal = ImageEnhance.Contrast(crystal).enhance(1.12)
    crystal = ImageEnhance.Color(crystal).enhance(1.08)
    crystal = ImageEnhance.Sharpness(crystal).enhance(1.2)

    cx = cy = w / 2
    _draw_soft_glow(img, cx, cy + target * 0.06, target * 0.42, PRIMARY, alpha=0.32)
    _draw_soft_glow(img, cx, cy, target * 0.55, PRIMARY_LIGHT, alpha=0.15)

    paste_x = int(cx - target / 2)
    paste_y = int(cy - target / 2)
    img.alpha_composite(crystal, (paste_x, paste_y))

    # Radial vignette to obsidian
    mask = Image.new("L", (w, w), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([w * 0.02, w * 0.02, w * 0.98, w * 0.98], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=w * 0.08))
    dark = Image.new("RGBA", (w, w), (*OBSIDIAN, 255))
    img = Image.composite(img, dark, mask)

    return _finalize(img)


CONCEPTS: list[tuple[str, callable]] = [
    ("01-hub-medallion", icon_hub_medallion),
    ("02-progress-ring", icon_progress_ring),
    ("03-life-radar", icon_life_radar),
    ("04-hub-orbit", icon_hub_orbit),
    ("05-crystal-emblem", icon_crystal_emblem),
]

V4_CHECK_CRYSTAL_SOURCE = ROOT / "assets" / "icon-concepts" / "trackit-icon-v4-check-crystal.png"
V4_CHECK_CRYSTAL_LIGHT_SOURCE = ROOT / "assets" / "icon-concepts" / "trackit-icon-v4-check-crystal-light.png"

# Calibrated from dark V4 source (1536×1024) — shared crop for light sibling.
V4_NORM_BBOX = (0.1862, 0.0176, 0.8132, 0.9814)


def _content_bbox(img: Image.Image, luminance_threshold: int = 18) -> tuple[int, int, int, int]:
    """Bounding box of non-black pixels (icon + glow)."""
    rgb = img.convert("RGB")
    pixels = rgb.load()
    w, h = rgb.size
    min_x, min_y = w, h
    max_x, max_y = 0, 0

    for y in range(h):
        for x in range(w):
            r, g, b = pixels[x, y]
            if r + g + b > luminance_threshold:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if max_x <= min_x or max_y <= min_y:
        return 0, 0, w, h

    return min_x, min_y, max_x + 1, max_y + 1


def _projection_bbox(
    img: Image.Image,
    *,
    luma_threshold: int = 100,
    min_axis_fraction: float = 0.04,
) -> tuple[int, int, int, int]:
    """Tight bounds via row/column density — ignores wide ambient glow."""
    rgb = img.convert("RGB")
    pixels = rgb.load()
    w, h = rgb.size

    col_hits = [
        sum(1 for y in range(h) if sum(pixels[x, y]) > luma_threshold) for x in range(w)
    ]
    row_hits = [
        sum(1 for x in range(w) if sum(pixels[x, y]) > luma_threshold) for y in range(h)
    ]

    col_min_hits = max(1, int(h * min_axis_fraction))
    row_min_hits = max(1, int(w * min_axis_fraction))

    active_cols = [i for i, v in enumerate(col_hits) if v >= col_min_hits]
    active_rows = [i for i, v in enumerate(row_hits) if v >= row_min_hits]

    if not active_cols or not active_rows:
        return _content_bbox(img)

    return active_cols[0], active_rows[0], active_cols[-1] + 1, active_rows[-1] + 1


def _tight_square_crop(
    img: Image.Image,
    padding_ratio: float = 0.0,
    *,
    use_projection: bool = False,
    canvas_rgb: tuple[int, int, int] = OBSIDIAN,
    norm_bbox: tuple[float, float, float, float] | None = None,
) -> Image.Image:
    """Crop to content bbox, expand to square — edge-to-edge when padding is 0."""
    rgba = img.convert("RGBA")
    w, h = rgba.size

    if norm_bbox is not None:
        left = int(norm_bbox[0] * w)
        top = int(norm_bbox[1] * h)
        right = int(norm_bbox[2] * w)
        bottom = int(norm_bbox[3] * h)
    elif use_projection:
        left, top, right, bottom = _projection_bbox(rgba)
    else:
        left, top, right, bottom = _content_bbox(rgba)

    cw = right - left
    ch = bottom - top
    side = max(cw, ch)
    pad = int(side * padding_ratio)
    side += pad * 2

    cx = (left + right) / 2
    cy = (top + bottom) / 2
    half = side / 2
    x0 = int(round(cx - half))
    y0 = int(round(cy - half))
    x1 = x0 + side
    y1 = y0 + side

    canvas = Image.new("RGBA", (side, side), (*canvas_rgb, 255))
    paste_x = max(0, -x0)
    paste_y = max(0, -y0)
    crop_x0 = max(0, x0)
    crop_y0 = max(0, y0)
    crop_x1 = min(w, x1)
    crop_y1 = min(h, y1)
    fragment = rgba.crop((crop_x0, crop_y0, crop_x1, crop_y1))
    canvas.paste(fragment, (paste_x, paste_y))
    return canvas


def _center_square_crop(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def _fit_icon_size(img: Image.Image, size: int = SIZE) -> Image.Image:
    square = _center_square_crop(img.convert("RGBA"))
    if square.size[0] != size:
        square = square.resize((size, size), Image.Resampling.LANCZOS)
    return square


def _fit_v4_icon_size(
    img: Image.Image,
    size: int = V4_ICON_SIZE,
    zoom: float = V4_ZOOM,
    *,
    theme: str = "dark",
) -> Image.Image:
    """V4 — shared crop + zoom; dark uses projection, light uses matched norm bbox."""
    canvas = OBSIDIAN if theme == "dark" else ETHEREAL_BG
    square = _tight_square_crop(
        img,
        padding_ratio=0.0,
        use_projection=(theme == "dark"),
        canvas_rgb=canvas,
        norm_bbox=None if theme == "dark" else V4_NORM_BBOX,
    )

    if zoom > 1.0:
        side = square.size[0]
        inner = max(1, int(round(side / zoom)))
        offset = (side - inner) // 2
        square = square.crop((offset, offset, offset + inner, offset + inner))

    if square.size[0] != size:
        square = square.resize((size, size), Image.Resampling.LANCZOS)
    return square


def android_icon_light_background() -> Image.Image:
    """Ethereal backdrop for light adaptive icon."""
    w = V4_ICON_SIZE * SUPER
    img = Image.new("RGBA", (w, w), (*ETHEREAL_BG, 255))
    draw = ImageDraw.Draw(img)
    cx = cy = w / 2
    max_r = math.hypot(cx, cy)
    for y in range(0, w, SUPER):
        for x in range(0, w, SUPER):
            t = math.hypot(x - cx, y - cy) / max_r
            color = _lerp_rgb(ETHEREAL_BG, ETHEREAL_BG_END, t * 0.45)
            draw.rectangle([x, y, x + SUPER - 1, y + SUPER - 1], fill=(*color, 255))
    return img.resize((V4_ICON_SIZE, V4_ICON_SIZE), Image.Resampling.LANCZOS)


def _monochrome_from_raster(
    img: Image.Image,
    *,
    tight_v4: bool = False,
    theme: str = "dark",
) -> Image.Image:
    """White silhouette for Android themed icon."""
    if tight_v4:
        rgba = _fit_v4_icon_size(img, theme=theme)
    else:
        rgba = _fit_icon_size(img)
    gray = rgba.convert("L")
    mask = gray.point(lambda p: 255 if p > 28 else 0)
    mono = Image.new("RGBA", rgba.size, (0, 0, 0, 0))
    white = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    mono.paste(white, mask=mask)
    return mono


def export_v4_check_crystal_assets() -> None:
    """Production bundle — V4 Check Crystal, 1040px, Obsidian + Ethereal."""
    if not V4_CHECK_CRYSTAL_SOURCE.exists():
        raise FileNotFoundError(f"Missing source icon: {V4_CHECK_CRYSTAL_SOURCE}")

    dark_source = Image.open(V4_CHECK_CRYSTAL_SOURCE)
    icon_dark = _fit_v4_icon_size(dark_source, theme="dark")

    icon_light = icon_dark
    if V4_CHECK_CRYSTAL_LIGHT_SOURCE.exists():
        light_source = Image.open(V4_CHECK_CRYSTAL_LIGHT_SOURCE)
        icon_light = _fit_v4_icon_size(light_source, theme="light")

    assets = ROOT / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    exports: list[tuple[str, Image.Image]] = [
        ("icon.png", icon_light),
        ("icon-dark.png", icon_dark),
        ("android-icon-foreground.png", icon_dark),
        ("android-icon-background.png", android_icon_background().resize(
            (V4_ICON_SIZE, V4_ICON_SIZE), Image.Resampling.LANCZOS
        )),
        ("android-icon-monochrome.png", _monochrome_from_raster(dark_source, tight_v4=True, theme="dark")),
        ("favicon.png", icon_light.resize((48, 48), Image.Resampling.LANCZOS)),
        ("splash-icon.png", icon_light),
        ("icon-light.png", icon_light),
        ("android-icon-light-foreground.png", icon_light),
        ("android-icon-light-background.png", android_icon_light_background()),
    ]

    if not V4_CHECK_CRYSTAL_LIGHT_SOURCE.exists():
        print("  ⚠ light source missing — using dark art for light exports")

    print(f"\nProduction assets (V4 · {V4_ICON_SIZE}px · dark + light) → {assets}")
    for name, image in exports:
        path = assets / name
        image.save(path, optimize=True)
        print(f"  ✓ {name} ({image.size[0]}×{image.size[1]})")


def export_production_assets(variant: str = "hub-medallion") -> None:
    """Write final TrackIt app icon bundle."""
    if variant == "v4-check-crystal":
        export_v4_check_crystal_assets()
        return

    assets = ROOT / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    exports: list[tuple[str, Image.Image]] = [
        ("icon.png", icon_hub_medallion()),
        ("android-icon-foreground.png", android_icon_foreground()),
        ("android-icon-background.png", android_icon_background()),
        ("android-icon-monochrome.png", android_icon_monochrome()),
        ("favicon.png", favicon_icon()),
        ("splash-icon.png", splash_icon()),
    ]

    print(f"\nProduction assets (Hub Medallion) → {assets}")
    for name, image in exports:
        path = assets / name
        image.save(path, optimize=True)
        print(f"  ✓ {name} ({image.size[0]}×{image.size[1]})")


def main() -> None:
    import sys

    variant = "v4-check-crystal" if "--v4" in sys.argv else "hub-medallion"
    if "--hub" in sys.argv:
        variant = "hub-medallion"

    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Rendering premium icons at {SIZE}px (supersample {SUPER}x) → {OUT}")

    for name, fn in CONCEPTS:
        path = OUT / f"trackit-icon-{name}.png"
        icon = fn()
        icon.save(path, optimize=True)
        print(f"  ✓ {path.name}")

    photo = icon_focus_crystal_photo()
    if photo:
        path = OUT / "trackit-icon-06-focus-crystal-brand.png"
        photo.save(path, optimize=True)
        print(f"  ✓ {path.name}")

    export_production_assets(variant=variant)


if __name__ == "__main__":
    main()
