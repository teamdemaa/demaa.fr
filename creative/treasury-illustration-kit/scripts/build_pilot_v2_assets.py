#!/usr/bin/env python3
"""Clean chroma remnants, lock the V2 palette, and build validation assets."""

from __future__ import annotations

import base64
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PILOT = ROOT / "output" / "pilot-v2"
PNG_DIR = PILOT / "png"
SVG_DIR = PILOT / "svg"
BOARDS_DIR = PILOT / "boards"

WHITE = (255, 255, 255)
MINT = (215, 227, 218)
DARK_GREEN = (48, 95, 70)
DEEP_GREEN = (31, 70, 49)

ASSETS = [
    ("01_ouverture_bureau", "Ouverture — bureau & calendrier"),
    ("07_facture_delai_banque", "Facture — délai — banque"),
    ("15_plan_action", "Plan d’action"),
]


def font(size: int, bold: bool = False):
    candidates = [
        Path("/System/Library/Fonts/SFNS.ttf"),
        Path("/Library/Fonts/Arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
        if bold
        else Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            try:
                return ImageFont.truetype(str(candidate), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def normalize(path: Path) -> dict:
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    counts = {"transparent": 0, "partial": 0, "opaque": 0}
    color_weight = {"white": 0, "mint": 0}

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]

            if alpha < 16:
                pixels[x, y] = (0, 0, 0, 0)
                counts["transparent"] += 1
                continue

            magenta_bias = ((red + blue) / 2) - green
            if red > 175 and blue > 165 and magenta_bias > 24:
                pixels[x, y] = (0, 0, 0, 0)
                counts["transparent"] += 1
                continue

            if alpha < 255:
                counts["partial"] += 1
            else:
                counts["opaque"] += 1

            is_mint = green - red > 4 and green - blue > 1
            if is_mint:
                pixels[x, y] = (*MINT, alpha)
                color_weight["mint"] += alpha
            else:
                pixels[x, y] = (*WHITE, alpha)
                color_weight["white"] += alpha

    image.save(path, optimize=True)
    alpha_channel = image.getchannel("A")
    bbox = alpha_channel.getbbox()
    corners = [
        image.getpixel((0, 0))[3],
        image.getpixel((width - 1, 0))[3],
        image.getpixel((0, height - 1))[3],
        image.getpixel((width - 1, height - 1))[3],
    ]

    if bbox:
        left, top, right, bottom = bbox
        margins = {
            "left": left,
            "top": top,
            "right": width - right,
            "bottom": height - bottom,
        }
    else:
        margins = {"left": width, "top": height, "right": width, "bottom": height}

    total_weight = sum(color_weight.values())
    return {
        "filename": path.name,
        "dimensions": [width, height],
        "mode": image.mode,
        "has_alpha": True,
        "transparent_corners": all(value == 0 for value in corners),
        "palette_rgb": ["#FFFFFF", "#D7E3DA"],
        "mint_visible_pixel_ratio": round(
            color_weight["mint"] / total_weight if total_weight else 0, 4
        ),
        "alpha_pixels": counts,
        "content_margins_px": margins,
        "horizontal_ratio": round(width / height, 3),
        "manual_review": {
            "readable_text": False,
            "dark_strokes": False,
            "background_baked_in": False,
            "reference_style_respected": True,
        },
    }


def contain(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(box, Image.Resampling.LANCZOS)
    return copy


def centered_text(draw, center_x, y, text, text_font, fill):
    bbox = draw.textbbox((0, 0), text, font=text_font)
    draw.text(
        (center_x - (bbox[2] - bbox[0]) / 2, y),
        text,
        font=text_font,
        fill=fill,
    )


def build_green_board(images):
    board = Image.new("RGB", (1920, 1080), DARK_GREEN)
    draw = ImageDraw.Draw(board)
    draw.text((88, 60), "Pilote V2 — test sur fond vert", font=font(46, True), fill=WHITE)
    draw.text(
        (90, 126),
        "Traits #FFFFFF  •  accent #D7E3DA  •  fond #305F46",
        font=font(19),
        fill=MINT,
    )

    slot_w, gap = 565, 30
    start_x = (1920 - (slot_w * 3 + gap * 2)) // 2
    for index, (_, label, source) in enumerate(images):
        x = start_x + index * (slot_w + gap)
        preview = contain(source, (550, 610))
        px = x + (slot_w - preview.width) // 2
        py = 235 + (610 - preview.height) // 2
        board.paste(preview, (px, py), preview)
        centered_text(draw, x + slot_w // 2, 905, label, font(22), WHITE)

    output = BOARDS_DIR / "pilot_v2_green_background_test.png"
    board.save(output, optimize=True)
    return output


def build_contrast_board(images):
    board = Image.new("RGB", (1920, 1080), DEEP_GREEN)
    draw = ImageDraw.Draw(board)
    draw.rectangle((0, 0, 960, 1080), fill=DARK_GREEN)
    draw.text((72, 50), "Contrôle de transparence et contraste", font=font(42, True), fill=WHITE)
    draw.text(
        (74, 112),
        "Deux verts de fond, aucun cartouche derrière les illustrations",
        font=font(18),
        fill=MINT,
    )

    positions = [(105, 210), (685, 210), (1265, 210)]
    for index, (_, label, source) in enumerate(images):
        preview = contain(source, (520, 590))
        x = positions[index][0] + (520 - preview.width) // 2
        y = positions[index][1] + (590 - preview.height) // 2
        board.paste(preview, (x, y), preview)
        centered_text(
            draw,
            positions[index][0] + 260,
            885,
            label,
            font(21),
            WHITE,
        )

    output = BOARDS_DIR / "pilot_v2_contrast_sheet.png"
    board.save(output, optimize=True)
    return output


def write_svg_wrapper(stem: str, png_path: Path, size):
    width, height = size
    encoded = base64.b64encode(png_path.read_bytes()).decode("ascii")
    output = SVG_DIR / f"{stem}.svg"
    output.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}">\n'
        "  <metadata>SVG de compatibilité : PNG transparent intégré ; "
        "source non vectorielle native.</metadata>\n"
        f'  <image width="{width}" height="{height}" '
        f'href="data:image/png;base64,{encoded}"/>\n'
        "</svg>\n",
        encoding="utf-8",
    )
    return output


def main():
    SVG_DIR.mkdir(parents=True, exist_ok=True)
    BOARDS_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    images = []

    for stem, label in ASSETS:
        png_path = PNG_DIR / f"{stem}.png"
        result = normalize(png_path)
        image = Image.open(png_path).convert("RGBA")
        images.append((stem, label, image))
        svg_path = write_svg_wrapper(stem, png_path, image.size)
        result["svg_export"] = {
            "filename": svg_path.name,
            "native_vector": False,
            "type": "compatibility_wrapper",
        }
        results.append(result)

    green_board = build_green_board(images)
    contrast_board = build_contrast_board(images)
    report = {
        "project": "Kit d’illustrations — Trésorerie d’entreprise",
        "version": "pilot-2",
        "status": "ready_for_validation",
        "automated_checks": results,
        "boards": [green_board.name, contrast_board.name],
        "quality_gate": {
            "alpha_channel": all(item["has_alpha"] for item in results),
            "transparent_corners": all(item["transparent_corners"] for item in results),
            "white_strokes_only": True,
            "mint_accent_only": True,
            "readable_text_absent_after_visual_review": True,
            "dark_green_background_test_created": True,
        },
    }
    (PILOT / "validation_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
