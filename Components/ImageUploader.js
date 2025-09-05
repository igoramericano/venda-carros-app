import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";

export default function ImageUploader({ onImageUpload, uploadedImages, removeImage, isUploading }) {
  const fileInputRef = useRef();
  
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Adicionar Fotos
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Clique aqui ou arraste as imagens para fazer upload
          </p>
          <Button type="button" variant="outline" disabled={isUploading}>
            {isUploading ? "Enviando..." : "Selecionar Arquivos"}
          </Button>
        </div>
      </div>

      {/* Uploaded Images Grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length === 0 && (
        <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg bg-slate-50">
          <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">
            Nenhuma foto adicionada ainda
          </p>
        </div>
      )}
    </div>
  );
}