"use client";
import React from "react";
import { createPortal } from "react-dom";

type DragOverlayProps = {
  item: React.ReactNode | null;
  position: { x: number; y: number } | null;
};

export default function DragOverlay({ item, position }: DragOverlayProps) {
  if (!item || !position) return null;
  if (typeof document === "undefined") return null;

  const overlay = (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        top: position.y + "px",
        left: position.x + "px",
        transform: "translate(-50%, -50%)",
      }}
    >
      {item}
    </div>
  );

  return createPortal(overlay, document.body);
}
