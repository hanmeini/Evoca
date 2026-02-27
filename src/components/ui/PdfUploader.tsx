"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function PdfUploader() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        handleFileSelect(droppedFile);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process PDF");
      }

      setUploadComplete(true);

      // Navigate to the newly created document reader page
      if (data.document && data.document.id) {
        setTimeout(() => {
          router.push(`/ai-reader/${data.document.id}`);
        }, 1500); // short delay to show success icon
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during upload",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 mb-20">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-900 mb-3 text-balance">
          Transform your reading material
        </h2>
        <p className="font-sans text-stone-600 text-lg text-balance">
          Upload any PDF document. Our AI will analyze the contents and create
          interactive quizzes, engaging podcasts, or let you chat directly with
          the text.
        </p>
      </div>

      <div
        className={cn(
          "relative group rounded-xl border-2 border-dashed p-12 transition-all duration-200 ease-in-out bg-white overflow-hidden",
          isDragging
            ? "border-stone-900 bg-stone-50"
            : "border-stone-300 hover:border-stone-400 hover:bg-stone-50/50",
          (file || uploadComplete) && "border-stone-200",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file && !uploadComplete && (
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-stone-100 rounded-full group-hover:bg-stone-200 transition-colors">
              <UploadCloud className="w-8 h-8 text-stone-600" />
            </div>
            <div>
              <p className="font-medium outline-none text-stone-900 text-lg mb-1">
                Drag and drop your PDF here
              </p>
              <p className="text-sm text-stone-500">
                or click to browse your files
              </p>
            </div>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        )}

        {file && !uploadComplete && (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="flex items-center space-x-4 p-4 bg-stone-50 rounded-lg border border-stone-200 w-full max-w-md">
              <FileText className="w-8 h-8 text-stone-900 shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-stone-900 truncate">
                  {file.name}
                </p>
                <p className="text-sm text-stone-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-medium px-2 py-1"
                disabled={isUploading}
              >
                Remove
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={cn(
                "inline-flex items-center justify-center rounded-sm bg-stone-900 px-8 py-3 text-sm font-medium text-stone-50 shadow transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:pointer-events-none disabled:opacity-50 w-full max-w-md",
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Document...
                </>
              ) : (
                "Start Analyzing"
              )}
            </button>

            {error && (
              <p className="text-sm text-rose-600 font-medium">{error}</p>
            )}
          </div>
        )}

        {uploadComplete && (
          <div className="flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-green-50 rounded-full">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-stone-900 text-xl mb-2">
                Document processed successfully
              </p>
              <p className="text-sm text-stone-600 mb-6 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Redirecting to AI Reader...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
