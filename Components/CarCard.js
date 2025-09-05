import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Gauge, Fuel, Settings, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Car } from "@/entities/Car";

export default function CarCard({ car, showActions = false, onUpdate }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o ${car.marca} ${car.modelo}?`)) {
      try {
        await Car.delete(car.id);
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error("Erro ao excluir carro:", error);
      }
    }
  };

  const mainImage = car.fotos && car.fotos.length > 0 
    ? car.fotos[0] 
    : "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop";

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img
          src={mainImage}
          alt={`${car.marca} ${car.modelo}`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-blue-600 text-white">
            {car.ano}
          </Badge>
        </div>
        {car.fotos && car.fotos.length > 1 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="text-xs">
              +{car.fotos.length - 1} fotos
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {car.marca} {car.modelo}
          </h3>
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(car.preco)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            <span>{formatNumber(car.quilometragem)} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-3 h-3" />
            <span>{car.combustivel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            <span>{car.transmissao}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            <span>{car.cor}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link 
            to={createPageUrl(`DetalhesCarro?id=${car.id}`)} 
            className="flex-1"
          >
            <Button variant="outline" className="w-full" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </Link>
          
          {showActions && (
            <>
              <Button variant="outline" size="sm" className="px-3">
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="px-3 text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}