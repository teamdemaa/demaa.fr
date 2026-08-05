#!/usr/bin/env python3
"""Build the two public Demaa resource guides from reviewed slide assets."""

from __future__ import annotations

import csv
import shutil
from pathlib import Path
from typing import Iterable

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PUBLIC_DIR = ROOT / "public" / "downloads" / "guides"
PAGE_WIDTH, PAGE_HEIGHT = landscape(A4)

FOREST = colors.HexColor("#315F46")
BLUE = colors.HexColor("#17231D")
MUTED = colors.HexColor("#617067")
SAGE = colors.HexColor("#E7EEE8")
CREAM = colors.HexColor("#FAFAF7")
LINE = colors.HexColor("#DCE5DF")


def draw_wrapped_text(
    pdf: canvas.Canvas,
    text: str,
    *,
    x: float,
    y: float,
    max_width: float,
    font: str,
    size: float,
    leading: float,
    color: colors.Color,
) -> float:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    pdf.setFont(font, size)
    pdf.setFillColor(color)
    cursor = y
    for line in lines:
        pdf.drawString(x, cursor, line)
        cursor -= leading
    return cursor


def draw_footer(pdf: canvas.Canvas, page_number: int, label: str) -> None:
    pdf.setStrokeColor(LINE)
    pdf.line(18 * mm, 11 * mm, PAGE_WIDTH - 18 * mm, 11 * mm)
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 7.5)
    pdf.drawString(18 * mm, 6.5 * mm, f"Demaa - {label}")
    pdf.drawRightString(PAGE_WIDTH - 18 * mm, 6.5 * mm, str(page_number))


def draw_cover(pdf: canvas.Canvas, title: str, subtitle: str, label: str) -> None:
    pdf.setFillColor(CREAM)
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    pdf.setFillColor(SAGE)
    pdf.roundRect(18 * mm, 18 * mm, PAGE_WIDTH - 36 * mm, PAGE_HEIGHT - 36 * mm, 8 * mm, fill=1, stroke=0)

    pdf.setFillColor(FOREST)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(32 * mm, PAGE_HEIGHT - 39 * mm, "RESSOURCE DEMAA")

    cursor = draw_wrapped_text(
        pdf,
        title,
        x=32 * mm,
        y=PAGE_HEIGHT - 67 * mm,
        max_width=PAGE_WIDTH - 64 * mm,
        font="Helvetica-Bold",
        size=29,
        leading=32,
        color=BLUE,
    )
    draw_wrapped_text(
        pdf,
        subtitle,
        x=32 * mm,
        y=cursor - 8 * mm,
        max_width=PAGE_WIDTH - 80 * mm,
        font="Helvetica",
        size=13,
        leading=18,
        color=MUTED,
    )

    pdf.setFillColor(FOREST)
    pdf.roundRect(32 * mm, 29 * mm, 52 * mm, 12 * mm, 6 * mm, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 8.5)
    pdf.drawCentredString(58 * mm, 33.2 * mm, label.upper())
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 8)
    pdf.drawRightString(PAGE_WIDTH - 32 * mm, 33.2 * mm, "Version vérifiée le 5 août 2026")
    pdf.showPage()


def draw_slide_page(pdf: canvas.Canvas, image_path: Path, page_number: int, label: str) -> None:
    pdf.setFillColor(colors.white)
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    margin_x = 15 * mm
    margin_top = 10 * mm
    footer_space = 17 * mm
    available_width = PAGE_WIDTH - 2 * margin_x
    available_height = PAGE_HEIGHT - margin_top - footer_space
    image_ratio = 3120 / 1755
    box_ratio = available_width / available_height
    if image_ratio > box_ratio:
        draw_width = available_width
        draw_height = draw_width / image_ratio
    else:
        draw_height = available_height
        draw_width = draw_height * image_ratio
    x = (PAGE_WIDTH - draw_width) / 2
    y = footer_space + (available_height - draw_height) / 2
    pdf.drawImage(str(image_path), x, y, width=draw_width, height=draw_height, preserveAspectRatio=True, mask="auto")
    draw_footer(pdf, page_number, label)
    pdf.showPage()


def draw_checklist(pdf: canvas.Canvas, rows: Iterable[dict[str, str]], page_number: int) -> None:
    pdf.setFillColor(CREAM)
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    pdf.setFillColor(FOREST)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(18 * mm, PAGE_HEIGHT - 19 * mm, "CHECKLIST OPÉRATIONNELLE")
    pdf.setFillColor(BLUE)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(18 * mm, PAGE_HEIGHT - 34 * mm, "Préparer la facturation électronique")

    y = PAGE_HEIGHT - 50 * mm
    for index, row in enumerate(rows, start=1):
        pdf.setFillColor(colors.white)
        pdf.setStrokeColor(LINE)
        pdf.roundRect(18 * mm, y - 10 * mm, PAGE_WIDTH - 36 * mm, 12 * mm, 3 * mm, fill=1, stroke=1)
        pdf.setStrokeColor(FOREST)
        pdf.rect(23 * mm, y - 6.3 * mm, 4.5 * mm, 4.5 * mm, fill=0, stroke=1)
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawString(31 * mm, y - 4.4 * mm, f"{index:02d}")
        pdf.setFillColor(BLUE)
        pdf.setFont("Helvetica", 9.5)
        pdf.drawString(42 * mm, y - 4.4 * mm, row["Action"])
        y -= 14 * mm

    draw_footer(pdf, page_number, "Guide de la facturation électronique")
    pdf.showPage()


def draw_disclaimer(pdf: canvas.Canvas, title: str, page_number: int, label: str) -> None:
    pdf.setFillColor(CREAM)
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)
    pdf.setFillColor(FOREST)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(24 * mm, PAGE_HEIGHT - 28 * mm, "AVANT DE PASSER À L'ACTION")
    pdf.setFillColor(BLUE)
    pdf.setFont("Helvetica-Bold", 23)
    pdf.drawString(24 * mm, PAGE_HEIGHT - 46 * mm, title)

    style = ParagraphStyle(
        "disclaimer",
        fontName="Helvetica",
        fontSize=12,
        leading=18,
        textColor=MUTED,
        alignment=TA_CENTER,
    )
    text = (
        "Ce guide propose une base pratique et générale. Il ne remplace pas "
        "l'avis personnalisé d'un expert-comptable, d'un avocat ou de "
        "l'administration compétente. Vérifiez toujours les règles et les "
        "échéances applicables à votre situation avant de prendre une décision."
    )
    paragraph = Paragraph(text, style)
    width = PAGE_WIDTH - 76 * mm
    _, height = paragraph.wrap(width, 70 * mm)
    pdf.setFillColor(SAGE)
    pdf.roundRect(38 * mm, 55 * mm, width, 58 * mm, 7 * mm, fill=1, stroke=0)
    paragraph.drawOn(pdf, 38 * mm, 55 * mm + (58 * mm - height) / 2)
    draw_footer(pdf, page_number, label)
    pdf.showPage()


def build_guide(
    *,
    filename: str,
    title: str,
    subtitle: str,
    label: str,
    slides: list[Path],
    checklist_rows: list[dict[str, str]] | None = None,
) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / filename
    public_path = PUBLIC_DIR / filename

    pdf = canvas.Canvas(str(output_path), pagesize=(PAGE_WIDTH, PAGE_HEIGHT), pageCompression=1)
    pdf.setTitle(title)
    pdf.setAuthor("Demaa")
    pdf.setSubject(subtitle)
    draw_cover(pdf, title, subtitle, label)
    page_number = 2
    for slide in slides:
        draw_slide_page(pdf, slide, page_number, label)
        page_number += 1
    if checklist_rows:
        draw_checklist(pdf, checklist_rows, page_number)
        page_number += 1
    draw_disclaimer(pdf, "Une base pour avancer sereinement", page_number, label)
    pdf.save()
    shutil.copyfile(output_path, public_path)


def main() -> None:
    with (ROOT / "public" / "formation-assets" / "facturation-electronique" / "checklist-preparation.csv").open(
        encoding="utf-8-sig", newline=""
    ) as handle:
        checklist_rows = list(csv.DictReader(handle))

    build_guide(
        filename="guide-facturation-electronique-demaa.pdf",
        title="Guide de la facturation électronique",
        subtitle="Comprendre les changements, vérifier son organisation et préparer les actions prioritaires.",
        label="Facturation électronique",
        slides=sorted((ROOT / "public" / "images" / "courses" / "facturation-electronique").glob("*.png")),
        checklist_rows=checklist_rows,
    )
    build_guide(
        filename="guide-obligations-fiscales-sociales-comptables-demaa.pdf",
        title="Guide des obligations fiscales, sociales et comptables",
        subtitle="Clarifier les principales obligations et les points de vigilance utiles au pilotage d'une petite entreprise.",
        label="Obligations de l'entreprise",
        slides=sorted((ROOT / "public" / "images" / "courses" / "obligations-finances").glob("*.png")),
    )


if __name__ == "__main__":
    main()
