#!/usr/bin/env python3
"""Export the reviewed PowerPoint slide images without rewriting their content."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public" / "downloads" / "presentations"
SLIDE_WIDTH = 960
SLIDE_HEIGHT = 540
EXPECTED_SOURCE_SIZE = (3120, 1755)


def build_presentation(*, filename: str, title: str, slide_directory: Path) -> None:
    slides = sorted(slide_directory.glob("*.png"))
    if not slides:
        raise ValueError(f"No slides found in {slide_directory}")

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    public_path = PUBLIC_DIR / filename

    pdf = canvas.Canvas(
        str(public_path),
        pagesize=(SLIDE_WIDTH, SLIDE_HEIGHT),
        pageCompression=1,
    )
    pdf.setTitle(title)
    pdf.setAuthor("Demaa")
    pdf.setSubject("Présentation Demaa exportée sans modification depuis les diapositives d’origine.")

    for slide_path in slides:
        slide = ImageReader(str(slide_path))
        if slide.getSize() != EXPECTED_SOURCE_SIZE:
            raise ValueError(
                f"Unexpected slide dimensions for {slide_path}: "
                f"{slide.getSize()} instead of {EXPECTED_SOURCE_SIZE}"
            )
        pdf.drawImage(
            slide,
            0,
            0,
            width=SLIDE_WIDTH,
            height=SLIDE_HEIGHT,
            preserveAspectRatio=True,
            mask="auto",
        )
        pdf.showPage()

    pdf.save()


def main() -> None:
    build_presentation(
        filename="presentation-facturation-electronique-demaa.pdf",
        title="La facturation électronique",
        slide_directory=ROOT / "public" / "images" / "courses" / "facturation-electronique",
    )
    build_presentation(
        filename="presentation-obligations-finances-demaa.pdf",
        title="Maîtriser les obligations et les finances de son entreprise",
        slide_directory=ROOT / "public" / "images" / "courses" / "obligations-finances",
    )


if __name__ == "__main__":
    main()
