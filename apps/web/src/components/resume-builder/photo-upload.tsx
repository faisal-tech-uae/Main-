"use client";

import { useEffect, useRef, useState } from "react";
import { User, Upload } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";

/**
 * The photo route requires a Bearer token, so a plain <img src> can't load
 * it directly — fetch it as a blob with the authenticated client and turn it
 * into an object URL instead.
 */
interface ResumeWithPhoto {
  currentVersion?: { data?: { personalInfo?: { photoUrl?: string } } };
}

export function PhotoUpload({
  resumeId,
  photoUrl,
  onUploaded,
}: {
  resumeId: string;
  photoUrl?: string;
  /** Called with the newly uploaded photo's URL — apply it to local form state rather than refetching, so unsaved edits elsewhere in the form aren't discarded. */
  onUploaded: (newPhotoUrl: string) => void;
}) {
  const api = useApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;
    let currentUrl: string | null = null;

    if (photoUrl) {
      api.getBlob(photoUrl).then(
        (blob) => {
          if (revoked) return;
          currentUrl = URL.createObjectURL(blob);
          setObjectUrl(currentUrl);
        },
        () => setObjectUrl(null)
      );
    } else {
      setObjectUrl(null);
    }

    return () => {
      revoked = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl]);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const updated = await api.postForm<ResumeWithPhoto>(`/api/resumes/${resumeId}/photo`, formData);
      const newPhotoUrl = updated.currentVersion?.data?.personalInfo?.photoUrl;
      if (newPhotoUrl) onUploaded(newPhotoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        {objectUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={objectUrl} alt="Profile headshot" className="h-full w-full object-cover" />
        ) : (
          <User className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload photo"}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">Used for the visual (non-ATS) CV. Auto-cropped to a professional headshot.</p>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
