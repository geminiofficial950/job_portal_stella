"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Download, Loader2, Mail, X } from "lucide-react";
import styles from "@/app/dashboard/seeker/seeker.module.css";

type SavedLetter = {
  id: string;
  text: string;
  jobTitle: string;
  company: string;
  usedAt: string | null;
};

function when(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function pdfSafe(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, (char) => {
      const swapped: Record<string, string> = {
        "\u2018": "'",
        "\u2019": "'",
        "\u201C": '"',
        "\u201D": '"',
        "\u2013": "-",
        "\u2014": "-",
        "\u2026": "...",
        "\u00A0": " ",
      };
      return swapped[char] || "?";
    });
}

function wrapLine(text: string, width: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function textOp(font: "F1" | "F2", size: number, x: number, y: number, text: string, color = "0.12 0.16 0.22") {
  return `${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${pdfSafe(text)}) Tj ET`;
}

async function loadBrandLogo() {
  const img = new Image();
  img.src = "/gemini-logo-on-dark.png";
  await img.decode();
  const crop = { x: 255, y: 153, w: 585, h: 98 };
  const width = 420;
  const height = Math.round(width * (crop.h / crop.w));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not draw logo");
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0, j = 0; i < pixels.length; i += 4, j += 3) {
    const dark = pixels[i] + pixels[i + 1] + pixels[i + 2] < 36;
    rgb[j] = dark ? 14 : pixels[i];
    rgb[j + 1] = dark ? 17 : pixels[i + 1];
    rgb[j + 2] = dark ? 24 : pixels[i + 2];
  }
  return { rgb, width, height };
}

function latin1(bytes: Uint8Array) {
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return text;
}

async function downloadLetterPdf(letter: SavedLetter) {
  const logo = await loadBrandLogo();
  const title = letter.jobTitle || "Cover letter";
  const meta = [letter.company, when(letter.usedAt)].filter(Boolean).join("  ·  ");
  const paragraphs = letter.text
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const pages: string[][] = [[]];
  const paintHeader = (pageIndex: number) => {
    const commands = [
      "0.055 0.067 0.094 rg",
      pageIndex === 0 ? "0 728 612 64 re f" : "0 760 612 32 re f",
      ...(pageIndex === 0
        ? ["q", `${190} 0 0 ${32} 36 744 cm`, "/Im1 Do", "Q"]
        : []),
    ];
    if (pageIndex === 0) {
      let y = 700;
      for (const line of wrapLine(title, 42)) {
        commands.push(textOp("F2", 16, 48, y, line));
        y -= 20;
      }
      if (meta) commands.push(textOp("F1", 10, 48, y - 2, meta, "0.39 0.45 0.54"));
      commands.push("0.86 0.89 0.93 rg 48 640 516 0.8 re f");
    }
    return commands;
  };

  let y = 616;
  const ensureSpace = (gap: number) => {
    if (y - gap < 64) {
      pages.push([]);
      y = 724;
    }
  };
  for (const paragraph of paragraphs) {
    const lines = wrapLine(paragraph, 92);
    for (const line of lines) {
      ensureSpace(16);
      pages[pages.length - 1].push(textOp("F1", 11, 48, y, line));
      y -= 16;
    }
    y -= 8;
  }

  const pageObjects = pages.map((body, index) => {
    const contentId = 3 + index * 2;
    const pageId = contentId + 1;
    const fontId = 3 + pages.length * 2;
    const boldId = fontId + 1;
    const stream = [
      ...paintHeader(index),
      ...body,
      "0.86 0.89 0.93 rg 48 42 516 0.6 re f",
      textOp("F1", 8, 48, 28, "Cover letter", "0.45 0.51 0.60"),
      textOp("F1", 8, 500, 28, `${index + 1} / ${pages.length}`, "0.45 0.51 0.60"),
    ].join("\n");
    return {
      contentId,
      pageId,
      content: `${contentId} 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
      page: `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldId} 0 R >> /XObject << /Im1 ${5 + pages.length * 2} 0 R >> >> >> endobj`,
    };
  });

  const kids = pageObjects.map((item) => `${item.pageId} 0 R`).join(" ");
  const bodyObjects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    `2 0 obj << /Type /Pages /Count ${pageObjects.length} /Kids [${kids}] >> endobj`,
    ...pageObjects.flatMap((item) => [item.content, item.page]),
    `${3 + pageObjects.length * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`,
    `${4 + pageObjects.length * 2} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`,
    `${5 + pageObjects.length * 2} 0 obj << /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${logo.rgb.length} >> stream\n${latin1(logo.rgb)}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of bodyObjects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xref = pdf.length;
  pdf += `xref\n0 ${bodyObjects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${bodyObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = Uint8Array.from(pdf, (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "cover-letter"}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SeekerCoverLettersList() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<SavedLetter[]>([]);
  const [error, setError] = useState("");
  const [active, setActive] = useState<SavedLetter | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/seeker/cover-letter", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.success) {
          setError(data.message || "Could not load cover letters");
          return;
        }
        setLetters(data.letters || []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load cover letters");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function openLetter(letter: SavedLetter) {
    setCopied(false);
    setActive(letter);
    queueMicrotask(() => dialog.current?.showModal());
  }

  function close() {
    dialog.current?.close();
    setActive(null);
    setCopied(false);
  }

  if (loading) {
    return (
      <div className={`${styles.loadingState} flex items-center gap-2`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your cover letters…
      </div>
    );
  }

  if (error) {
    return <p className={styles.emptyState}>{error}</p>;
  }

  if (!letters.length) {
    return (
      <div className={styles.emptyState}>
        <div>
          <Mail className="h-6 w-6" />
        </div>
        <p>No cover letters yet</p>
        <p>Letters you submit with an application will show up here.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid gap-2">
        {letters.map((letter) => (
          <li key={letter.id}>
            <button
              type="button"
              onClick={() => openLetter(letter)}
              className="w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold"
              style={{
                borderColor: "var(--seeker-line)",
                background: "var(--seeker-raised)",
                color: "var(--seeker-text)",
              }}
            >
              {letter.jobTitle}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        data-preserve-color
        className={styles.coverDialog}
        onClose={() => {
          setActive(null);
          setCopied(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        {active ? (
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="break-words text-base font-bold sm:text-lg">{active.jobTitle}</h2>
                <p className="mt-1 text-xs text-[#64748b]">
                  {[active.company, when(active.usedAt)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="shrink-0 rounded-lg p-1 text-[#64748b]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="max-h-[42vh] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 sm:max-h-[46vh]">{active.text}</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#dbe2ef] bg-white px-3 py-2.5 text-sm font-semibold sm:w-auto"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(active.text);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-3 py-2.5 text-sm font-semibold text-white sm:w-auto"
                onClick={() => void downloadLetterPdf(active)}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
