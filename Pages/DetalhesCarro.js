import React from 'react';
import React, { useState, useEffect, useCallback } from "react";
import { Car } from "@/entities/Car";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Gauge, Palette, Fuel, Settings, Phone, Heart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ImageGallery from "../components/ImageGallery";

export default function DetalhesCarro() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const carId = searchParams.get("id");
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCar = useCallback(async () => {
    setIsLoading(true);
    try {
      const cars = await Car.list();
      const foundCar = cars.find(c => c.id === carId);
      setCar(foundCar);
    } catch (error) {
      console.error("Erro ao carregar carro:", error);
    }
    setIsLoading(false);
  }, [carId]);

  useEffect(() => {
    if (carId) {
      loadCar();
    }
  }, [carId, loadCar]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-slate-200 rounded-xl h-96"></div>
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-12 bg-slate-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Carro não encontrado</h1>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à listagem
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // ... keep existing code (return statement)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Galeria de Imagens */}
          <div className="lg:col-span-2">
            <ImageGallery 
              images={car.fotos || []} 
              carTitle={`${car.marca} ${car.modelo}`}
            />
          </div>

          {/* Informações do Carro */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {car.marca} {car.modelo}
                </h1>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-slate-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    {car.ano}
                  </Badge>
                  <Badge variant="outline" className="text-slate-600">
                    <Palette className="w-3 h-3 mr-1" />
                    {car.cor}
                  </Badge>
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-600 mb-6">
                {formatPrice(car.preco)}
              </div>

              {/* Especificações */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <Gauge className="w-4 h-4" />
                  <span className="text-sm">{formatNumber(car.quilometragem)} km</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Fuel className="w-4 h-4" />
                  <span className="text-sm">{car.combustivel}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">{car.transmissao}</span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  Entrar em Contato
                </Button>
                <Button variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Favoritar
                </Button>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Características
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Marca:</span>
                  <span className="font-medium">{car.marca}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Modelo:</span>
                  <span className="font-medium">{car.modelo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ano:</span>
                  <span className="font-medium">{car.ano}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cor:</span>
                  <span className="font-medium">{car.cor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Combustível:</span>
                  <span className="font-medium">{car.combustivel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transmissão:</span>
                  <span className="font-medium">{car.transmissao}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        {car.descricao && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Descrição
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {car.descricao}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}