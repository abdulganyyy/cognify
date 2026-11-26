"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_PDF_SIZE_BYTES, MAX_PDF_SIZE_MB } from "@/lib/constants/app";
import { useUploadDocumentMutation } from "@/lib/query/hooks";
import { formatFileSize } from "@/lib/utils/dates";
import { deriveDocumentTitle } from "@/lib/utils/text";
import { cn } from "@/lib/utils/cn";

interface UploadModalContextValue {
  openUploadModal: () => void;
}

const UploadModalContext = createContext<UploadModalContextValue>({
  openUploadModal: () => undefined,
});

export function useUploadModal() {
  return useContext(UploadModalContext);
}

export function UploadModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocumentMutation();

  const openUploadModal = useCallback(() => {
    setOpen(true);
  }, []);

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setDragActive(false);
  };

  const handleSelectFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Hanya file berformat PDF yang didukung.");
      return;
    }
    if (file.size > MAX_PDF_SIZE_BYTES) {
      toast.error(`Ukuran file maksimal ${MAX_PDF_SIZE_MB} MB.`);
      return;
    }
    setSelectedFile(file);
    setTitle(deriveDocumentTitle(file.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const documentId = await uploadMutation.mutateAsync({
        file: selectedFile,
        title,
      });
      setOpen(false);
      resetForm();
      router.push(`/documents/${documentId}`);
    } catch {
      // Error sudah ditangani oleh toast di mutasi
    }
  };

  return (
    <UploadModalContext.Provider value={{ openUploadModal }}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (uploadMutation.isPending) return;
          setOpen(nextOpen);
          if (!nextOpen) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unggah Dokumen PDF</DialogTitle>
            <DialogDescription>
              Pilih file PDF (maks. {MAX_PDF_SIZE_MB} MB). AI akan membuat ringkasan,
              topik utama, flashcard, dan tutor tanya jawab secara otomatis.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={(e) => {
                handleSelectFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {!selectedFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleSelectFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                  dragActive
                    ? "border-blue-500 bg-blue-50/70"
                    : "border-neutral-200 bg-neutral-50/60 hover:border-blue-300 hover:bg-blue-50/30"
                )}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-neutral-800">
                  Klik untuk pilih atau seret file PDF ke sini
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Format PDF · Maksimal {MAX_PDF_SIZE_MB} MB
                </p>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={uploadMutation.isPending}
                  onClick={() => setSelectedFile(null)}
                  aria-label="Hapus file terpilih"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="doc-title">Judul Dokumen</Label>
              <Input
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pengantar Machine Learning"
                disabled={uploadMutation.isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={uploadMutation.isPending}
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || uploadMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  "Unggah & Proses"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </UploadModalContext.Provider>
  );
}
