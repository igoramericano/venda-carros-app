import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COMBUSTIVEL_OPTIONS = ["Gasolina", "Etanol", "Diesel", "Flex", "Elétrico"];
const TRANSMISSAO_OPTIONS = ["Manual", "Automática"];

export default function CarFilters({ filters, setFilters, brands }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="min-w-[150px]">
        <Select 
          value={filters.marca} 
          onValueChange={(value) => handleFilterChange("marca", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px]">
        <Select 
          value={filters.combustivel} 
          onValueChange={(value) => handleFilterChange("combustivel", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Combustível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {COMBUSTIVEL_OPTIONS.map((combustivel) => (
              <SelectItem key={combustivel} value={combustivel}>
                {combustivel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[150px]">
        <Select 
          value={filters.transmissao} 
          onValueChange={(value) => handleFilterChange("transmissao", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Transmissão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {TRANSMISSAO_OPTIONS.map((transmissao) => (
              <SelectItem key={transmissao} value={transmissao}>
                {transmissao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Preço mín."
          type="number"
          value={filters.precoMin}
          onChange={(e) => handleFilterChange("precoMin", e.target.value)}
          className="w-24"
        />
        <Input
          placeholder="Preço máx."
          type="number"
          value={filters.precoMax}
          onChange={(e) => handleFilterChange("precoMax", e.target.value)}
          className="w-24"
        />
      </div>
    </div>
  );
}