import React from 'react';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ImageGallery({ images, carTitle }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="bg-slate-200 rounded-xl h-96 flex items-center justify-center">
        <p className="text-slate-500">Nenhuma imagem disponível</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Main Image */}
        <div className="relative">
          <img
            src={images[currentIndex]}
            alt={`${carTitle} - Foto ${currentIndex + 1}`}
            className="w-full h-96 object-cover cursor-pointer"
            onClick={openModal}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Expand Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            onClick={openModal}
          >
            <Expand className="w-4 h-4" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="p-4 bg-slate-50">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-full h-full max-h-[90vh] p-0">
          <div className="relative h-full">
            <img
              src={images[currentIndex]}
              alt={`${carTitle} - Foto ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}