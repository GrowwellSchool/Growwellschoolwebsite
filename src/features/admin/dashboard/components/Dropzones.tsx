"use client";

import { useState } from "react";

export function SingleImageDropzone({
  disabled,
  onPick,
}: {
  disabled: boolean;
  onPick: (file: File | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <label
      className={`block border-2 border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer select-none ${
        dragOver ? "border-school-green bg-school-green/5" : "border-gray-200 hover:border-school-green/60"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onPick(e.dataTransfer.files?.[0] ?? null);
      }}
    >
      <div className="font-semibold text-gray-800">Drag & drop an image here</div>
      <div className="text-xs text-gray-500 mt-1">or click to upload</div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        className="hidden"
        disabled={disabled}
      />
    </label>
  );
}

export function MultiImageDropzone({
  disabled,
  onPickFiles,
}: {
  disabled: boolean;
  onPickFiles: (files: FileList | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <label
      className={`block border-2 border-dashed rounded-xl px-4 py-4 text-sm cursor-pointer select-none ${
        dragOver ? "border-school-green bg-school-green/5" : "border-gray-200 hover:border-school-green/60"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onPickFiles(e.dataTransfer.files ?? null);
      }}
    >
      <div className="font-semibold text-gray-800">Drag & drop images here</div>
      <div className="text-xs text-gray-500 mt-1">or click to upload multiple</div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onPickFiles(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </label>
  );
}
