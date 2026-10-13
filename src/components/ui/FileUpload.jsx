import React, { useState } from "react";
import { UploadCloud, File, X, CheckCircle2, Image as ImageIcon } from "lucide-react";

export const FileUpload = ({ onFilesChange, label = "Upload Medical Scans & Documents" }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    const formatted = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      progress: 100,
    }));
    const updated = [...files, ...formatted];
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
  };

  const removeFile = (id) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    if (onFilesChange) onFilesChange(updated);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {label && <label className="text-xs font-semibold text-slate-700">{label}</label>}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 ${
          isDragging ? "border-sky-600 bg-sky-50/50" : "border-slate-300"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to upload or drag & drop medical records
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports DICOM scans, Radiology X-Rays, Histopathology PDFs & Pathology Reports (Max 25MB)
          </p>
        </label>
      </div>

      {/* Uploaded File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-10 h-10 rounded-md object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
                    <File className="w-5 h-5" />
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">{file.name}</p>
                  <span className="text-[11px] text-slate-500">{file.size}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
