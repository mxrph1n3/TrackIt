#!/usr/bin/env python3
"""
Regenerate every Obsidian (dark theme) UI image variant for TrackIt.

Presets:
  - cinematic  : gym / welcome / widget hero photos — dark obsidian + violet shadows
  - achieve    : workout completion poster — obsidian void, silver subject, light typography
  - crystal    : focus streak crystal — dark base, preserved purple glow
  - portrait   : avatar — natural skin tones on obsidian background
"""

from __future__ import annotations

import colorsys
import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]

OBSIDIAN_BASE = (7, 7, 10)
OBSIDIAN_MID = (15, 15, 25)
NEON_VIOLET = (119, 93, 216)
NEON_GLOW = (149, 128, 232)
DEEP_VIOLET = (88, 64, 168)
OBSIDIAN_BG = OBSIDIAN_BASE

Preset = str  # 'cinematic' | 'achieve' | 'crystal' | 'portrait'


@dataclass(frozen=True)
class ImageJob:
    source: Path
    destination: Path
    preset: Preset


# Every in-app artwork + project reference masters.
JOBS: tuple[ImageJob, ...] = (
    ImageJob(ROOT / 'assets/images/achieve.png', ROOT / 'assets/images/achive_dark.png', 'achieve'),
    ImageJob(ROOT / 'assets/images/welcome-gate.png', ROOT / 'assets/images/welcome-gate-dark.png', 'cinematic'),
    ImageJob(ROOT / 'src/assets/images/today_widget_bg.png', ROOT / 'src/assets/images/today_widget_bg_dark.png', 'cinematic'),
    ImageJob(ROOT / 'src/assets/images/workout_hero_bg.png', ROOT / 'src/assets/images/workout_hero_bg_dark.png', 'cinematic'),
    ImageJob(ROOT / 'src/assets/images/nutrition_widget_bg.png', ROOT / 'src/assets/images/nutrition_widget_bg_dark.png', 'cinematic'),
    ImageJob(ROOT / 'src/assets/images/default_avatar.png', ROOT / 'src/assets/images/default_avatar_dark.png', 'portrait'),
    ImageJob(ROOT / 'crystall.png', ROOT / 'crystall-dark.png', 'crystal'),
    # Reference masters kept in repo root (dark siblings for design parity).
    ImageJob(ROOT / 'image gym 1.png', ROOT / 'image gym 1_dark.png', 'cinematic'),
    ImageJob(ROOT / 'image gym 2.png', ROOT / 'image gym 2_dark.png', 'cinematic'),
    ImageJob(ROOT / 'image avatar.png', ROOT / 'image avatar_dark.png', 'portrait'),
    ImageJob(
        ROOT / 'Gemini_Generated_Image_ns2gzqns2gzqns2g.png',
        ROOT / 'Gemini_Generated_Image_ns2gzqns2gzqns2g_dark.png',
        'cinematic',
    ),
)


def _clamp(value: float, low: float = 0.0, high: float = 255.0) -> int:
    return int(max(low, min(high, round(value))))


def _luminance(red: int, green: int, blue: int) -> float:
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def _is_purple_family(hue: float, saturation: float, value: float) -> bool:
    if saturation < 0.05 or value < 0.04:
        return False
    return 0.66 <= hue <= 0.93 or hue <= 0.05


def _is_skin_tone(hue: float, saturation: float, value: float) -> bool:
    return 0.02 <= hue <= 0.12 and saturation > 0.12 and value > 0.18


def _grade_cinematic_pixel(red: int, green: int, blue: int) -> tuple[int, int, int]:
    lum = _luminance(red, green, blue) / 255
    shadow_weight = max(0.0, 1.0 - lum * 1.32)
    highlight_weight = max(0.0, (lum - 0.42) * 1.15)

    brightness = 0.24 + lum * 0.22
    base_mix = 1.0 - brightness
    nr = red * brightness + OBSIDIAN_BASE[0] * base_mix
    ng = green * brightness + OBSIDIAN_BASE[1] * base_mix
    nb = blue * brightness + OBSIDIAN_BASE[2] * base_mix

    nr = nr * (1 - shadow_weight * 0.2) + NEON_VIOLET[0] * shadow_weight * 0.2
    ng = ng * (1 - shadow_weight * 0.2) + NEON_VIOLET[1] * shadow_weight * 0.2
    nb = nb * (1 - shadow_weight * 0.14) + NEON_VIOLET[2] * shadow_weight * 0.24

    nr = nr * (1 - highlight_weight * 0.07) + NEON_GLOW[0] * highlight_weight * 0.07
    ng = ng * (1 - highlight_weight * 0.07) + NEON_GLOW[1] * highlight_weight * 0.07
    nb = nb * (1 - highlight_weight * 0.07) + NEON_GLOW[2] * highlight_weight * 0.07

    return _clamp(nr), _clamp(ng), _clamp(nb)


def _grade_crystal_pixel(red: int, green: int, blue: int, alpha: int) -> tuple[int, int, int, int]:
    if alpha < 8:
        return 0, 0, 0, 0

    hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
    luminance = (red + green + blue) / 3

    if _is_purple_family(hue, saturation, value):
        new_saturation = min(1.0, saturation * 1.48 + 0.15)
        if value > 0.72:
            new_value = min(0.9, 0.3 + value * 0.6)
        elif value > 0.38:
            new_value = max(0.14, value * 0.5)
        else:
            new_value = max(0.08, value * 0.42)

        nr, ng, nb = colorsys.hsv_to_rgb(hue, new_saturation, new_value)
        nr = nr * 255 * 0.76 + NEON_VIOLET[0] * 0.24
        ng = ng * 255 * 0.76 + NEON_VIOLET[1] * 0.24
        nb = nb * 255 * 0.7 + NEON_GLOW[2] * 0.3
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    if luminance > 185:
        mist = (luminance - 185) / 70
        nr = OBSIDIAN_BG[0] * (1 - mist) + OBSIDIAN_MID[0] * mist
        ng = OBSIDIAN_BG[1] * (1 - mist) + OBSIDIAN_MID[1] * mist
        nb = OBSIDIAN_BG[2] * (1 - mist) + OBSIDIAN_MID[2] * mist
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    if luminance > 95:
        mix = (luminance - 95) / 90
        nr = OBSIDIAN_BG[0] * (1 - mix) + DEEP_VIOLET[0] * mix * 0.38
        ng = OBSIDIAN_BG[1] * (1 - mix) + DEEP_VIOLET[1] * mix * 0.38
        nb = OBSIDIAN_BG[2] * (1 - mix) + DEEP_VIOLET[2] * mix * 0.48
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    return OBSIDIAN_BG[0], OBSIDIAN_BG[1], OBSIDIAN_BG[2], alpha


def _grade_achieve_pixel(red: int, green: int, blue: int, alpha: int) -> tuple[int, int, int, int]:
    """Workout completion poster: obsidian atmosphere, readable type, glowing violet accents."""
    if alpha < 8:
        return 0, 0, 0, 0

    hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
    luminance = _luminance(red, green, blue)

    if _is_purple_family(hue, saturation, value):
        new_saturation = min(1.0, saturation * 1.42 + 0.12)
        new_value = min(0.98, value * 1.18 + 0.12)
        nr, ng, nb = colorsys.hsv_to_rgb(hue, new_saturation, new_value)
        nr = nr * 255 * 0.68 + NEON_GLOW[0] * 0.32
        ng = ng * 255 * 0.68 + NEON_GLOW[1] * 0.32
        nb = nb * 255 * 0.64 + NEON_GLOW[2] * 0.36
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    if luminance > 198 and saturation < 0.16:
        mist = min(1.0, (luminance - 185) / 70)
        nr = OBSIDIAN_BASE[0] * (1 - mist) + OBSIDIAN_MID[0] * mist * 0.55 + DEEP_VIOLET[0] * mist * 0.18
        ng = OBSIDIAN_BASE[1] * (1 - mist) + OBSIDIAN_MID[1] * mist * 0.55 + DEEP_VIOLET[1] * mist * 0.18
        nb = OBSIDIAN_BASE[2] * (1 - mist) + OBSIDIAN_MID[2] * mist * 0.55 + DEEP_VIOLET[2] * mist * 0.28
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    if luminance < 44 and saturation < 0.24:
        ink_strength = 1.0 - (luminance / 44)
        nr = 188 + ink_strength * 52 + NEON_GLOW[0] * 0.06
        ng = 190 + ink_strength * 54 + NEON_GLOW[1] * 0.06
        nb = 206 + ink_strength * 42 + NEON_GLOW[2] * 0.12
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    if luminance > 118 and saturation < 0.3:
        target = 24 + (luminance - 118) * 0.34
        scale = (target * 255 / 100) / max(luminance, 1)
        rim = min(1.0, (luminance - 118) / 120)
        nr = red * scale + NEON_GLOW[0] * (0.1 + rim * 0.08)
        ng = green * scale + NEON_GLOW[1] * (0.1 + rim * 0.08)
        nb = blue * scale + NEON_GLOW[2] * (0.14 + rim * 0.1)
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    if luminance < 68:
        lift = 24
        nr = red + lift + NEON_VIOLET[0] * 0.1
        ng = green + lift + NEON_VIOLET[1] * 0.1
        nb = blue + lift * 1.08 + NEON_VIOLET[2] * 0.14
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    nr, ng, nb = _grade_cinematic_pixel(red, green, blue)
    return _clamp(nr + 14), _clamp(ng + 14), _clamp(nb + 16), alpha


def _grade_portrait_pixel(red: int, green: int, blue: int, alpha: int) -> tuple[int, int, int, int]:
    if alpha < 8:
        return 0, 0, 0, 0

    hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
    luminance = _luminance(red, green, blue)

    # Near-pure white canvas → obsidian backdrop.
    if luminance > 238 and saturation < 0.08:
        return OBSIDIAN_BG[0], OBSIDIAN_BG[1], OBSIDIAN_BG[2], alpha

    # Bright highlights (eyes, hair sheen, jacket trim) — keep readable on dark UI.
    if luminance > 210 and saturation < 0.14:
        nr = red * 0.42 + 205 * 0.58
        ng = green * 0.42 + 208 * 0.58
        nb = blue * 0.42 + 228 * 0.58
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    # Light subject surfaces (white hair, pale gear) → silver-violet, not crushed black.
    if luminance > 130 and saturation < 0.2:
        target = 118 + (luminance - 130) * 0.62
        scale = target / max(luminance, 1)
        nr = red * scale + NEON_GLOW[0] * 0.08
        ng = green * scale + NEON_GLOW[1] * 0.08
        nb = blue * scale + NEON_GLOW[2] * 0.14
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    if _is_skin_tone(hue, saturation, value):
        new_value = max(0.34, min(0.8, value * 0.74))
        new_saturation = min(1.0, saturation * 1.1)
        nr, ng, nb = colorsys.hsv_to_rgb(hue, new_saturation, new_value)
        nr = nr * 255 * 0.88 + OBSIDIAN_MID[0] * 0.12
        ng = ng * 255 * 0.88 + OBSIDIAN_MID[1] * 0.12
        nb = nb * 255 * 0.9 + NEON_VIOLET[2] * 0.1
        return _clamp(nr), _clamp(ng), _clamp(nb), alpha

    # Deep shadows (mask, weapon) — lift so they don't disappear on obsidian.
    if luminance < 62:
        lift = 34
        return _clamp(red + lift), _clamp(green + lift), _clamp(blue + lift * 1.12), alpha

    nr, ng, nb = _grade_cinematic_pixel(red, green, blue)
    boost = 22
    return _clamp(nr + boost), _clamp(ng + boost), _clamp(nb + boost), alpha


def _apply_pixel_grade(image: Image.Image, preset: Preset) -> Image.Image:
    rgba = image.convert('RGBA')
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if preset == 'crystal':
                pixels[x, y] = _grade_crystal_pixel(red, green, blue, alpha)
            elif preset == 'achieve':
                pixels[x, y] = _grade_achieve_pixel(red, green, blue, alpha)
            elif preset == 'portrait':
                pixels[x, y] = _grade_portrait_pixel(red, green, blue, alpha)
            else:
                if alpha < 8:
                    pixels[x, y] = (0, 0, 0, 0)
                else:
                    nr, ng, nb = _grade_cinematic_pixel(red, green, blue)
                    pixels[x, y] = (nr, ng, nb, alpha)

    return rgba


def _vignette(image: Image.Image, strength: float) -> Image.Image:
    width, height = image.size
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse(
        (-width * 0.18, -height * 0.12, width * 1.18, height * 1.12),
        fill=int(255 * (1 - strength * 0.32)),
    )

    radial = Image.new('L', (width, height), 0)
    cx, cy = width / 2, height / 2
    max_dist = math.hypot(cx, cy)
    radial_pixels = radial.load()
    for y in range(height):
        for x in range(width):
            dist = math.hypot(x - cx, y - cy) / max_dist
            radial_pixels[x, y] = int(max(0, min(255, 255 * (1 - dist * strength))))

    combined = ImageChops.lighter(mask, radial)
    dark_layer = Image.new('RGB', (width, height), OBSIDIAN_MID)
    rgb = image.convert('RGB')
    return Image.composite(rgb, dark_layer, combined)


def _achieve_atmosphere(image: Image.Image) -> Image.Image:
    """Bottom violet mist + subtle top glow for the workout completion poster."""
    width, height = image.size
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    pixels = overlay.load()

    for y in range(height):
        vertical = y / max(height - 1, 1)
        for x in range(width):
            bottom_fog = max(0.0, (vertical - 0.58) / 0.42) ** 1.35
            top_glow = max(0.0, (0.22 - vertical) / 0.22) * 0.18
            alpha = int(min(255, bottom_fog * 92 + top_glow * 28))
            if alpha < 2:
                continue
            red = _clamp(OBSIDIAN_MID[0] * 0.35 + DEEP_VIOLET[0] * 0.65)
            green = _clamp(OBSIDIAN_MID[1] * 0.35 + DEEP_VIOLET[1] * 0.65)
            blue = _clamp(OBSIDIAN_MID[2] * 0.35 + DEEP_VIOLET[2] * 0.75)
            pixels[x, y] = (red, green, blue, alpha)

    return Image.alpha_composite(image.convert('RGBA'), overlay)


def _finish(image: Image.Image, preset: Preset) -> Image.Image:
    if preset == 'cinematic':
        image = ImageEnhance.Contrast(image.convert('RGB')).enhance(1.08)
        image = ImageEnhance.Color(image).enhance(0.88)
        image = _vignette(image.convert('RGBA'), 0.14).convert('RGBA')
    elif preset == 'achieve':
        image = ImageEnhance.Contrast(image.convert('RGB')).enhance(1.12)
        image = ImageEnhance.Color(image).enhance(1.06)
        image = _vignette(image.convert('RGBA'), 0.2).convert('RGBA')
        image = _achieve_atmosphere(image)
    elif preset == 'crystal':
        image = image.filter(ImageFilter.GaussianBlur(radius=0.35))
        image = ImageEnhance.Sharpness(image).enhance(1.14)
        image = ImageEnhance.Contrast(image).enhance(1.08)
    elif preset == 'portrait':
        image = ImageEnhance.Brightness(image).enhance(1.1)
        image = ImageEnhance.Contrast(image).enhance(1.14)
        image = ImageEnhance.Color(image).enhance(1.04)

    image = image.filter(ImageFilter.GaussianBlur(radius=0.25))
    image = ImageEnhance.Sharpness(image).enhance(1.06)
    return image


def generate_dark_variant(job: ImageJob) -> None:
    if not job.source.exists():
        print(f'⊘ skip missing {job.source.relative_to(ROOT)}')
        return

    image = Image.open(job.source)
    graded = _apply_pixel_grade(image, job.preset)
    finished = _finish(graded, job.preset)

    job.destination.parent.mkdir(parents=True, exist_ok=True)
    finished.save(job.destination, 'PNG', optimize=True)
    print(
        f'✓ {job.destination.relative_to(ROOT)}'
        f'  ←  {job.source.relative_to(ROOT)} [{job.preset}]'
    )


def main() -> None:
    completed = 0
    for job in JOBS:
        if job.source.exists():
            generate_dark_variant(job)
            completed += 1

    print(f'\nDone — regenerated {completed} dark image variant(s).')


if __name__ == '__main__':
    main()
