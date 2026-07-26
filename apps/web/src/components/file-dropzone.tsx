"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({ onFile, accept = ".pdf,.docx,.txt" }: { onFile: (file: File) => void; accept?: string }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setFileName(file.name);
      onFile(file);
    },
    [onFile]
  );

  return (
    <div
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-10 text-center transition-colors",
        dragging && "border-primary bg-accent"
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <UploadCloud className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">{fileName ?? "Drag & drop your resume, or click to browse"}</p>
      <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT — up to 10MB</p>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
