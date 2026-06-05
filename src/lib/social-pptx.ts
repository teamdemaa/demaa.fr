import type { SocialCarousel, SocialCarouselSlide, SocialStudioSector, SocialTool } from "@/lib/social-carousels";

type ZipFile = {
  path: string;
  data: Uint8Array;
};

type TextOptions = {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  size: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  font?: string;
  align?: "l" | "ctr" | "r";
};

type RectOptions = {
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  stroke?: string;
  radius?: boolean;
};

const SLIDE = 9144000;
const WHITE = "FFFFFF";
const BLACK = "000000";
const FOREST = "315F46";
const MUTED = "6F756E";
const SAGE = "F1F3F0";
const LINE = "ECEEED";
const FOOTER = "A9A9A9";

export function createSocialCarouselPptx(carousel: SocialCarousel): Uint8Array {
  const slideFiles = carousel.slides.map((slide, index) => ({
    path: `ppt/slides/slide${index + 1}.xml`,
    data: encodeXml(renderSlide(slide, index + 1)),
  }));

  const slideRelFiles = carousel.slides.map((_, index) => ({
    path: `ppt/slides/_rels/slide${index + 1}.xml.rels`,
    data: encodeXml(slideRels()),
  }));

  const files: ZipFile[] = [
    { path: "[Content_Types].xml", data: encodeXml(contentTypes(carousel.slides.length)) },
    { path: "_rels/.rels", data: encodeXml(rootRels()) },
    { path: "ppt/presentation.xml", data: encodeXml(presentationXml(carousel.slides.length)) },
    { path: "ppt/_rels/presentation.xml.rels", data: encodeXml(presentationRels(carousel.slides.length)) },
    { path: "ppt/slideMasters/slideMaster1.xml", data: encodeXml(slideMaster()) },
    { path: "ppt/slideMasters/_rels/slideMaster1.xml.rels", data: encodeXml(slideMasterRels()) },
    { path: "ppt/slideLayouts/slideLayout1.xml", data: encodeXml(slideLayout()) },
    { path: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", data: encodeXml(slideLayoutRels()) },
    { path: "ppt/theme/theme1.xml", data: encodeXml(themeXml()) },
    { path: "docProps/core.xml", data: encodeXml(coreProps(carousel.sector.name)) },
    { path: "docProps/app.xml", data: encodeXml(appProps(carousel.slides.length)) },
    ...slideFiles,
    ...slideRelFiles,
  ];

  return createZip(files);
}

function renderSlide(slide: SocialCarouselSlide, slideNumber: number): string {
  const shapes: string[] = [];

  shapes.push(background());

  if (slide.kind === "intro") {
    const highlightSize = slide.highlight.length > 38 ? 37 : slide.highlight.length > 28 ? 42 : 48;
    const subtitle = getIntroSubtitleText(slide.subtitle);

    shapes.push(textBox(1, { x: 0.75, y: 2.45, w: 8.4, h: 0.75, text: slide.titleLines.join("\n"), size: 48, color: BLACK }));
    shapes.push(textBox(2, { x: 0.75, y: 3.55, w: 8.4, h: 1.4, text: `${slide.highlight} ?`, size: highlightSize, color: FOREST, bold: true }));
    shapes.push(textBox(3, { x: 0.75, y: 6.15, w: 8.1, h: 0.95, text: subtitle, size: 30, color: "8DA596", italic: true, font: "Georgia" }));
    shapes.push(footer(4, slide.footer));
  } else if (slide.kind === "process-snapshot") {
    shapes.push(textBox(1, { x: 0.5, y: 0.65, w: 8.7, h: 1.5, text: slide.title, size: 39, color: BLACK }));
    shapes.push(textBox(2, { x: 0.5, y: 2.65, w: 8.2, h: 0.75, text: slide.subtitle, size: 22, color: MUTED }));
    shapes.push(processSnapshot(slide.sector, 3, 0.15, 4.3, 9.7, 4.0, slide.openProcessTitle));
    shapes.push(footer(80, slide.footer));
  } else if (slide.kind === "tools-snapshot") {
    shapes.push(textBox(1, { x: 0.5, y: 0.75, w: 8.6, h: 1.3, text: slide.title, size: 35, color: BLACK }));
    shapes.push(textBox(2, { x: 0.5, y: 2.55, w: 7.5, h: 0.5, text: slide.subtitle, size: 22, color: MUTED }));
    shapes.push(toolsSnapshot(slide.tools, 3, 0.3, 3.45, 9.4, 4.35));
    shapes.push(footer(70, slide.footer));
  } else if (slide.kind === "checklist") {
    shapes.push(textBox(1, { x: 0.45, y: 0.75, w: 8.3, h: 2.25, text: slide.title, size: 38, color: BLACK }));
    shapes.push(textBox(2, { x: 0.55, y: 3.75, w: 8.4, h: 0.45, text: slide.subtitle, size: 23, color: MUTED }));
    slide.steps.slice(0, 6).forEach((step, index) => {
      const y = 4.6 + index * 0.62;
      shapes.push(rect(10 + index, { x: 1.15, y, w: 0.45, h: 0.45, fill: WHITE, stroke: FOREST }));
      shapes.push(textBox(20 + index, { x: 1.19, y: y - 0.08, w: 0.45, h: 0.45, text: "✓", size: 28, color: BLACK, bold: true, align: "ctr" }));
      shapes.push(rect(30 + index, { x: 1.9, y: y + 0.02, w: 5.8, h: 0.42, fill: WHITE, stroke: FOREST, radius: true }));
      shapes.push(textBox(40 + index, { x: 2.2, y: y + 0.08, w: 5.1, h: 0.25, text: `${index + 1}. ${step}`, size: 14, color: BLACK, bold: true }));
    });
    shapes.push(footer(90, slide.footer));
  } else if (slide.kind === "cta-snapshot") {
    shapes.push(textBox(1, { x: 0.7, y: 1.95, w: 8.5, h: 2.0, text: slide.title, size: 31, color: MUTED, italic: true, font: "Georgia" }));
    shapes.push(processSnapshot(slide.sector, 3, -0.55, 5.35, 10.2, 3.25, slide.openProcessTitle, true));
    shapes.push(footer(80, slide.footer));
  } else {
    shapes.push(textBox(1, { x: 0.45, y: 2.4, w: 4.5, h: 0.75, text: slide.title, size: 42, color: BLACK }));
    shapes.push(landingSnapshot(slide.sector, 2, 0.45, 4.9, 9.4, 3.55));
    shapes.push(footer(60, slide.footer));
  }

  return slideXml(slideNumber, shapes.join(""));
}

function getIntroSubtitleText(subtitle: string): string {
  if (subtitle === "Pour que tout ne repose pas que sur vous") {
    return "Pour que tout ne repose pas\nque sur vous";
  }

  return subtitle;
}

function processSnapshot(
  sector: SocialStudioSector,
  startId: number,
  x: number,
  y: number,
  w: number,
  h: number,
  openProcessTitle?: string,
  showCta = false,
): string {
  const shapes: string[] = [];

  shapes.push(rect(startId, { x, y, w, h, fill: WHITE, stroke: FOREST }));
  shapes.push(textBox(startId + 1, { x: x + 0.25, y: y + 0.25, w: 5.2, h: 0.25, text: sector.sectorLabel, size: 7, color: FOREST, bold: true }));
  shapes.push(textBox(startId + 2, { x: x + 0.25, y: y + 0.62, w: 4.4, h: 0.35, text: sector.name, size: 18, color: "17231D", bold: true }));
  shapes.push(textBox(startId + 3, { x: x + 0.25, y: y + 1.05, w: 7.4, h: 0.3, text: sector.description, size: 9, color: MUTED }));

  if (showCta) {
    shapes.push(rect(startId + 4, { x: x + w - 2.6, y: y + 0.35, w: 2.2, h: 0.45, fill: FOREST, stroke: FOREST, radius: true }));
    shapes.push(textBox(startId + 5, { x: x + w - 2.5, y: y + 0.49, w: 2.0, h: 0.18, text: "Demander un audit de mes process", size: 8, color: WHITE, align: "ctr" }));
  }

  shapes.push(textBox(startId + 6, { x: x + 0.35, y: y + 1.72, w: 0.8, h: 0.25, text: "Processus", size: 9, color: BLACK, bold: true }));
  shapes.push(textBox(startId + 7, { x: x + 1.55, y: y + 1.72, w: 0.8, h: 0.25, text: "Outils", size: 9, color: MUTED }));

  const pillars = ["Stratégie", "Marketing & Vente", "Opérations", "Finance & administration", "Équipe"];
  const colW = (w - 0.7) / 5;

  pillars.forEach((pillar, columnIndex) => {
    const colX = x + 0.25 + columnIndex * colW;
    const colY = y + 2.15;
    const processes = sector.processes.filter((process) => process.pillar === pillar).slice(0, 3);

    shapes.push(rect(startId + 10 + columnIndex, { x: colX, y: colY, w: colW - 0.12, h: h - 2.45, fill: WHITE, stroke: LINE }));
    shapes.push(textBox(startId + 20 + columnIndex, { x: colX + 0.1, y: colY + 0.15, w: colW - 0.32, h: 0.25, text: pillar, size: 8, color: MUTED, italic: true, font: "Georgia", align: "ctr" }));

    processes.forEach((process, processIndex) => {
      const pillY = colY + 0.62 + processIndex * 0.5;
      const isOpen = process.title === openProcessTitle;
      shapes.push(rect(startId + 40 + columnIndex * 10 + processIndex, {
        x: colX + 0.12,
        y: pillY,
        w: colW - 0.36,
        h: isOpen ? 0.85 : 0.34,
        fill: isOpen ? WHITE : SAGE,
        stroke: isOpen ? LINE : SAGE,
        radius: true,
      }));
      shapes.push(textBox(startId + 90 + columnIndex * 10 + processIndex, {
        x: colX + 0.22,
        y: pillY + 0.09,
        w: colW - 0.56,
        h: 0.18,
        text: process.title,
        size: 7,
        color: BLACK,
        bold: true,
      }));
      if (isOpen) {
        shapes.push(textBox(startId + 140 + columnIndex * 10 + processIndex, {
          x: colX + 0.22,
          y: pillY + 0.34,
          w: colW - 0.56,
          h: 0.45,
          text: process.description,
          size: 6,
          color: MUTED,
        }));
      }
    });
  });

  return shapes.join("");
}

function toolsSnapshot(tools: SocialTool[], startId: number, x: number, y: number, w: number, h: number): string {
  const shapes: string[] = [];

  shapes.push(rect(startId, { x, y, w, h, fill: WHITE, stroke: FOREST }));
  tools.slice(0, 4).forEach((tool, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cardX = x + 0.42 + col * ((w - 1.05) / 2);
    const cardY = y + 0.36 + row * 1.55;
    const cardW = (w - 1.25) / 2;

    shapes.push(rect(startId + 1 + index, { x: cardX, y: cardY, w: cardW, h: 1.2, fill: WHITE, stroke: LINE, radius: true }));
    shapes.push(textBox(startId + 20 + index, { x: cardX + 0.2, y: cardY + 0.18, w: cardW - 0.4, h: 0.18, text: tool.type, size: 7, color: MUTED, bold: true }));
    shapes.push(textBox(startId + 40 + index, { x: cardX + 0.2, y: cardY + 0.45, w: cardW - 0.4, h: 0.24, text: tool.name, size: 15, color: BLACK, bold: true }));
    shapes.push(textBox(startId + 60 + index, { x: cardX + 0.2, y: cardY + 0.78, w: cardW - 0.4, h: 0.34, text: tool.usage, size: 8, color: MUTED }));
  });

  return shapes.join("");
}

function landingSnapshot(sector: SocialStudioSector, startId: number, x: number, y: number, w: number, h: number): string {
  const shapes: string[] = [];

  shapes.push(rect(startId, { x, y, w, h, fill: WHITE, stroke: LINE }));
  shapes.push(textBox(startId + 1, { x: x + 0.35, y: y + 0.3, w: 1.3, h: 0.25, text: "Demaa", size: 11, color: "BFC5BF", italic: true, font: "Georgia" }));
  shapes.push(rect(startId + 2, { x: x + 5.9, y: y + 0.32, w: 1.05, h: 0.28, fill: "B7CDBF", stroke: "B7CDBF", radius: true }));
  shapes.push(textBox(startId + 3, { x: x + 6.03, y: y + 0.39, w: 0.8, h: 0.12, text: "Structurer", size: 6, color: WHITE, align: "ctr" }));
  shapes.push(textBox(startId + 4, { x: x + 2.0, y: y + 1.35, w: 5.6, h: 0.45, text: "Pour que votre entreprise", size: 24, color: "E2E2E2", align: "ctr" }));
  shapes.push(textBox(startId + 5, { x: x + 2.1, y: y + 1.82, w: 5.4, h: 0.45, text: "ne repose pas que sur vous", size: 22, color: "D3D3D3", italic: true, font: "Georgia", align: "ctr" }));
  shapes.push(textBox(startId + 6, { x: x + 0.55, y: y + 2.85, w: 4.2, h: 0.3, text: sector.sectorLabel, size: 13, color: "C7CDC7", italic: true, font: "Georgia" }));

  return shapes.join("");
}

function footer(id: number, text: string): string {
  return textBox(id, { x: 0, y: 9.5, w: 10, h: 0.3, text, size: 18, color: FOOTER, align: "ctr" });
}

function background(): string {
  return rect(999, { x: 0, y: 0, w: 10, h: 10, fill: WHITE, stroke: WHITE });
}

function rect(id: number, options: RectOptions): string {
  const preset = options.radius ? "roundRect" : "rect";

  return `
    <p:sp>
      <p:nvSpPr><p:cNvPr id="${id}" name="Shape ${id}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
      <p:spPr>
        <a:xfrm><a:off x="${emu(options.x)}" y="${emu(options.y)}"/><a:ext cx="${emu(options.w)}" cy="${emu(options.h)}"/></a:xfrm>
        <a:prstGeom prst="${preset}"><a:avLst/></a:prstGeom>
        <a:solidFill><a:srgbClr val="${options.fill ?? WHITE}"/></a:solidFill>
        <a:ln w="12000"><a:solidFill><a:srgbClr val="${options.stroke ?? options.fill ?? LINE}"/></a:solidFill></a:ln>
      </p:spPr>
    </p:sp>`;
}

function textBox(id: number, options: TextOptions): string {
  const paragraphs = options.text.split("\n").map((line) => `
    <a:p>
      <a:pPr algn="${options.align ?? "l"}"/>
      <a:r>
        <a:rPr lang="fr-FR" sz="${Math.round(options.size * 100)}"${options.bold ? ' b="1"' : ""}${options.italic ? ' i="1"' : ""}>
          <a:solidFill><a:srgbClr val="${options.color ?? BLACK}"/></a:solidFill>
          <a:latin typeface="${escapeXml(options.font ?? "Avenir Next")}"/>
        </a:rPr>
        <a:t>${escapeXml(line)}</a:t>
      </a:r>
    </a:p>`).join("");

  return `
    <p:sp>
      <p:nvSpPr><p:cNvPr id="${id}" name="Text ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
      <p:spPr>
        <a:xfrm><a:off x="${emu(options.x)}" y="${emu(options.y)}"/><a:ext cx="${emu(options.w)}" cy="${emu(options.h)}"/></a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        <a:noFill/>
        <a:ln><a:noFill/></a:ln>
      </p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"/>
        <a:lstStyle/>
        ${paragraphs}
      </p:txBody>
    </p:sp>`;
}

function slideXml(slideNumber: number, shapes: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name="Slide ${slideNumber}"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      ${shapes}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
}

function contentTypes(slideCount: number): string {
  const slides = Array.from({ length: slideCount }, (_, index) =>
    `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  ${slides}
</Types>`;
}

function rootRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function presentationXml(slideCount: number): string {
  const slideIds = Array.from({ length: slideCount }, (_, index) =>
    `<p:sldId id="${256 + index}" r:id="rId${index + 2}"/>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>${slideIds}</p:sldIdLst>
  <p:sldSz cx="${SLIDE}" cy="${SLIDE}" type="custom"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;
}

function presentationRels(slideCount: number): string {
  const slides = Array.from({ length: slideCount }, (_, index) =>
    `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  ${slides}
</Relationships>`;
}

function slideRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;
}

function slideMaster(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Master"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`;
}

function slideMasterRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`;
}

function slideLayout(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name="Layout"/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
</p:sldLayout>`;
}

function slideLayoutRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;
}

function themeXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Demaa">
  <a:themeElements>
    <a:clrScheme name="Demaa"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="17231D"/></a:dk2><a:lt2><a:srgbClr val="FAFAFA"/></a:lt2><a:accent1><a:srgbClr val="${FOREST}"/></a:accent1><a:accent2><a:srgbClr val="${SAGE}"/></a:accent2><a:accent3><a:srgbClr val="${MUTED}"/></a:accent3><a:accent4><a:srgbClr val="${LINE}"/></a:accent4><a:accent5><a:srgbClr val="A9A9A9"/></a:accent5><a:accent6><a:srgbClr val="17231D"/></a:accent6><a:hlink><a:srgbClr val="${FOREST}"/></a:hlink><a:folHlink><a:srgbClr val="${MUTED}"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Demaa"><a:majorFont><a:latin typeface="Avenir Next"/></a:majorFont><a:minorFont><a:latin typeface="Avenir Next"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Demaa"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="12000"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>`;
}

function coreProps(sectorName: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Carrousel Demaa - ${escapeXml(sectorName)}</dc:title>
  <dc:creator>Demaa</dc:creator>
</cp:coreProperties>`;
}

function appProps(slideCount: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Demaa</Application>
  <PresentationFormat>Custom</PresentationFormat>
  <Slides>${slideCount}</Slides>
</Properties>`;
}

function createZip(files: ZipFile[]): Uint8Array {
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const name = encodeText(file.path);
    const crc = crc32(file.data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(name.length),
      u16(0),
      name,
      file.data,
    ]);

    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(file.data.length),
      u32(file.data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);

    localParts.push(local);
    centralParts.push(central);
    offset += local.length;
  });

  const centralOffset = offset;
  const central = concat(centralParts);
  const end = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(central.length),
    u32(centralOffset),
    u16(0),
  ]);

  return concat([...localParts, central, end]);
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function encodeXml(xml: string): Uint8Array {
  return encodeText(xml.trim());
}

function encodeText(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function u16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff]);
}

function u32(value: number): Uint8Array {
  return new Uint8Array([
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff,
  ]);
}

function emu(value: number): number {
  return Math.round(value * 914400);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
