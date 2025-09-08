import React, { useState, useEffect } from "react";
import { Car, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Plus, Car as CarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CarCard from "../components/CarCard";

export default function MeusAnuncios() {
  const [meusCars, setMeusCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndCars();
  }, []);

  const loadUserAndCars = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const cars = await Car.filter({ created_by: currentUser.email }, "-created_date");
      setMeusCars(cars);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meus Anúncios</h1>
            <p className="text-slate-600 mt-1">
              {user?.full_name && `Olá, ${user.full_name}! `}
              Gerencie seus veículos anunciados
            </p>
          </div>
          <Link to={createPageUrl("CadastrarCarro")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Anúncio
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <CarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-900">{meusCars.length}</p>
                <p className="text-slate-600">Carros Anunciados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-900">
                  R$ {meusCars.reduce((total, car) => total + (car.preco || 0), 0).toLocaleString('pt-BR')}
                </p>
                <p className="text-slate-600">Valor Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <CarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-slate-900">
                  R$ {meusCars.length > 0 ? (meusCars.reduce((total, car) => total + (car.preco || 0), 0) / meusCars.length).toLocaleString('pt-BR', {maximumFractionDigits: 0}) : '0'}
                </p>
                <p className="text-slate-600">Preço Médio</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
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
        ) : meusCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {meusCars.map((car) => (
              <CarCard key={car.id} car={car} showActions={true} onUpdate={loadUserAndCars} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Você ainda não tem carros anunciados
            </h3>
            <p className="text-slate-500 mb-6">
              Comece cadastrando seu primeiro veículo para venda
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