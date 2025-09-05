import React from 'react';
import React, { useState } from "react";
import { Car } from "@/entities/Car";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CarForm from "../components/CarForm";
import ImageUploader from "../components/ImageUploader";

export default function CadastrarCarro() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (files) => {
    setIsUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const { file_url } = await UploadFile({ file });
        return file_url;
      });
      
      const imageUrls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...imageUrls]);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setIsUploadingImage(false);
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (carData) => {
    setIsSubmitting(true);
    try {
      await Car.create({
        ...carData,
        fotos: uploadedImages
      });
      navigate(createPageUrl("MeusAnuncios"));
    } catch (error) {
      console.error("Erro ao cadastrar carro:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Home"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cadastrar Novo Carro</h1>
            <p className="text-slate-600 mt-1">Preencha as informações do seu veículo</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                Informações do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CarForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </CardContent>
          </Card>

          {/* Upload de Imagens */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="w-5 h-5" />
                Fotos do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                onImageUpload={handleImageUpload}
                uploadedImages={uploadedImages}
                removeImage={removeImage}
                isUploading={isUploadingImage}
              />
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Dica:</strong> Adicione pelo menos 3 fotos para atrair mais compradores. 
                  Inclua fotos da frente, traseira, interior e detalhes importantes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}