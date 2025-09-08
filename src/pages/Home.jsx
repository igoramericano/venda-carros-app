import React, { useState, useEffect, useCallback } from "react";
import { Car } from "@/entities/Car";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CarCard from "../components/CarCard";
import CarFilters from "../components/CarFilters";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    marca: "all",
    combustivel: "all",
    transmissao: "all",
    precoMin: "",
    precoMax: ""
  });

  const loadCars = async () => {
    setIsLoading(true);
    const data = await Car.list("-created_date");
    setCars(data);
    setIsLoading(false);
  };

  const applyFilters = useCallback(() => {
    let filtered = cars.filter(car => {
      const matchesSearch = car.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           car.modelo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMarca = filters.marca === "all" || car.marca === filters.marca;
      const matchesCombustivel = filters.combustivel === "all" || car.combustivel === filters.combustivel;
      const matchesTransmissao = filters.transmissao === "all" || car.transmissao === filters.transmissao;
      
      const matchesPrecoMin = !filters.precoMin || car.preco >= parseFloat(filters.precoMin);
      const matchesPrecoMax = !filters.precoMax || car.preco <= parseFloat(filters.precoMax);

      return matchesSearch && matchesMarca && matchesCombustivel && 
             matchesTransmissao && matchesPrecoMin && matchesPrecoMax;
    });

    setFilteredCars(filtered);
  }, [cars, searchTerm, filters]);

  useEffect(() => {
    loadCars();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const uniqueBrands = [...new Set(cars.map(car => car.marca))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encontre o Carro dos Seus
              <span className="text-orange-400 block">Sonhos</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Os melhores carros seminovos e usados estão aqui. 
              Qualidade garantida e preços imperdíveis.
            </p>
            <Link to={createPageUrl("CadastrarCarro")}>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                Anunciar Meu Carro
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 -mt-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar por marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <CarFilters
              filters={filters}
              setFilters={setFilters}
              brands={uniqueBrands}
            />
          </div>
        </div>

        <div className="flex justify-between items-center my-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {filteredCars.length} carros encontrados
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="bg-slate-200 rounded-lg h-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Nenhum carro encontrado
            </h3>
            <p className="text-slate-500 mb-6">
              Tente ajustar os filtros ou cadastre um novo veículo
            </p>
            <Link to={createPageUrl("CadastrarCarro")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Carro
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}