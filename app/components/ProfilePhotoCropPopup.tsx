"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Loader2, ZoomIn, ZoomOut, X } from "lucide-react";
import styles from "./ProfilePhotoCropPopup.module.css";

type Props = {
  imageSrc: string;
  onCancel: () => void;
  onComplete: (file: File) => void | Promise<void>;
  /** Circle for profile photos, square for logos. */
  shape?: "circle" | "square";
};

const OUTPUT_SIZE = 640;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function ProfilePhotoCropPopup({
  imageSrc,
  onCancel,
  onComplete,
  shape = "circle",
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const cropSize = () => {
    const stage = stageRef.current;
    if (!stage) return 280;
    return Math.min(stage.clientWidth, stage.clientHeight) * 0.78;
  };

  const baseScale = () => {
    if (!natural.w || !natural.h) return 1;
    const size = cropSize();
    return Math.max(size / natural.w, size / natural.h);
  };

  const clampOffset = useCallback(
    (next: { x: number; y: number }, nextZoom = zoom) => {
      if (!natural.w || !natural.h) return next;
      const size = cropSize();
      const scale = baseScale() * nextZoom;
      const displayW = natural.w * scale;
      const displayH = natural.h * scale;
      const maxX = Math.max(0, (displayW - size) / 2);
      const maxY = Math.max(0, (displayH - size) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    // baseScale/cropSize read latest DOM + natural on each call
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [natural.w, natural.h, zoom],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, saving]);

  useEffect(() => {
    setOffset((current) => clampOffset(current));
  }, [zoom, clampOffset]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (saving) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStart.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setOffset(clampOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy }));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  }

  async function handleSave() {
    if (!natural.w || saving) return;
    setSaving(true);
    try {
      const size = cropSize();
      const scale = baseScale() * zoom;
      const displayW = natural.w * scale;
      const displayH = natural.h * scale;
      const imgLeft = -displayW / 2 + offset.x;
      const imgTop = -displayH / 2 + offset.y;
      const cropLeft = -size / 2;
      const cropTop = -size / 2;

      const sx = (cropLeft - imgLeft) / scale;
      const sy = (cropTop - imgTop) / scale;
      const sSize = size / scale;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx || !imgRef.current) throw new Error("Could not crop photo");

      if (shape === "circle") {
        // Soft teal fill — JPEG has no alpha; empty pixels would otherwise bake as black
        ctx.fillStyle = "#e8f4f5";
        ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        ctx.beginPath();
        ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const mime = shape === "square" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error("Could not export photo"))),
          mime,
          0.92,
        );
      });

      const file = new File(
        [blob],
        shape === "square" ? "company-logo.png" : "profile-photo.jpg",
        { type: mime },
      );
      await onComplete(file);
    } catch (error) {
      setSaving(false);
      throw error;
    }
  }

  const scale = baseScale() * zoom;

  return (
    <div className={styles.backdrop} role="presentation" onClick={() => !saving && onCancel()}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-crop-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <button type="button" className={styles.iconBtn} onClick={onCancel} disabled={saving} aria-label="Cancel">
            <X size={20} />
          </button>
          <h2 id="photo-crop-title">Move and scale</h2>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => void handleSave().catch(() => setSaving(false))}
            disabled={saving || !natural.w}
          >
            {saving ? <Loader2 size={16} className={styles.spin} /> : null}
            {saving ? "Saving…" : "Done"}
          </button>
        </header>

        <div
          ref={stageRef}
          className={`${styles.stage} ${dragging ? styles.dragging : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageSrc}
            alt=""
            draggable={false}
            className={styles.image}
            style={{
              width: natural.w ? natural.w * scale : "auto",
              height: natural.h ? natural.h * scale : "auto",
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
            onLoad={(event) => {
              const img = event.currentTarget;
              setNatural({ w: img.naturalWidth, h: img.naturalHeight });
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
          />
          {shape === "square" ? (
            <div className={styles.square} aria-hidden />
          ) : (
            <>
              <div className={styles.dim} aria-hidden />
              <div className={styles.circle} aria-hidden />
            </>
          )}
        </div>

        <div className={styles.controls}>
          <ZoomOut size={16} aria-hidden />
          <input
            className={styles.zoom}
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={saving}
            aria-label="Zoom"
            onChange={(event) => setZoom(Number(event.target.value))}
          />
          <ZoomIn size={16} aria-hidden />
        </div>
        <p className={styles.hint}>Drag to reposition · use the slider to zoom</p>
      </div>
    </div>
  );
}
