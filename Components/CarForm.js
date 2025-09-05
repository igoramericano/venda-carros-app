import React from 'react';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const MARCAS = [
  "Volkswagen", "Chevrolet", "Fiat", "Ford", "Honda", "Toyota", "Nissan", 
  "Hyundai", "Peugeot", "Renault", "Kia", "BMW", "Mercedes-Benz", "Audi", "Volvo"
];

const COMBUSTIVEL_OPTIONS = ["Gasolina", "Etanol", "Diesel", "Flex", "Elétrico"];
const TRANSMISSAO_OPTIONS = ["Manual", "Automática"];

export default function CarForm({ onSubmit, isSubmitting, initialData = {} }) {
  const [formData, setFormData] = useState({
    marca: initialData.marca || "",
    modelo: initialData.modelo || "",
    ano: initialData.ano || "",
    preco: initialData.preco || "",
    quilometragem: initialData.quilometragem || "",
    cor: initialData.cor || "",
    combustivel: initialData.combustivel || "",
    transmissao: initialData.transmissao || "",
    descricao: initialData.descricao || ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      ano: parseInt(formData.ano),
      preco: parseFloat(formData.preco),
      quilometragem: parseInt(formData.quilometragem)
    };

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Marca */}
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Select value={formData.marca} onValueChange={(value) => handleChange("marca", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a marca" />
            </SelectTrigger>
            <SelectContent>
              {MARCAS.map((marca) => (
                <SelectItem key={marca} value={marca}>
                  {marca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Modelo */}
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input
            id="modelo"
            placeholder="Ex: Civic, Corolla, Golf"
            value={formData.modelo}
            onChange={(e) => handleChange("modelo", e.target.value)}
            required
          />
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <Label htmlFor="ano">Ano *</Label>
          <Input
            id="ano"
            type="number"
            min="1980"
            max={new Date().getFullYear() + 1}
            placeholder="Ex: 2020"
            value={formData.ano}
            onChange={(e) => handleChange("ano", e.target.value)}
            required
          />
        </div>

        {/* Preço */}
        <div className="space-y-2">
          <Label htmlFor="preco">Preço (R$) *</Label>
          <Input
            id="preco"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 45000"
            value={formData.preco}
            onChange={(e) => handleChange("preco", e.target.value)}
            required
          />
        </div>

        {/* Quilometragem */}
        <div className="space-y-2">
          <Label htmlFor="quilometragem">Quilometragem (km) *</Label>
          <Input
            id="quilometragem"
            type="number"
            min="0"
            placeholder="Ex: 50000"
            value={formData.quilometragem}
            onChange={(e) => handleChange("quilometragem", e.target.value)}
            required
          />
        </div>

        {/* Cor */}
        <div className="space-y-2">
          <Label htmlFor="cor">Cor</Label>
          <Input
            id="cor"
            placeholder="Ex: Branco, Preto, Prata"
            value={formData.cor}
            onChange={(e) => handleChange("cor", e.target.value)}
          />
        </div>

        {/* Combustível */}
        <div className="space-y-2">
          <Label htmlFor="combustivel">Combustível</Label>
          <Select value={formData.combustivel} onValueChange={(value) => handleChange("combustivel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o combustível" />
            </SelectTrigger>
            <SelectContent>
              {COMBUSTIVEL_OPTIONS.map((combustivel) => (
                <SelectItem key={combustivel} value={combustivel}>
                  {combustivel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transmissão */}
        <div className="space-y-2">
          <Label htmlFor="transmissao">Transmissão</Label>
          <Select value={formData.transmissao} onValueChange={(value) => handleChange("transmissao", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a transmissão" />
            </SelectTrigger>
            <SelectContent>
              {TRANSMISSAO_OPTIONS.map((transmissao) => (
                <SelectItem key={transmissao} value={transmissao}>
                  {transmissao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          placeholder="Descreva os detalhes do veículo, estado de conservação, opcionais, etc."
          rows={4}
          value={formData.descricao}
          onChange={(e) => handleChange("descricao", e.target.value)}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? "Cadastrando..." : "Cadastrar Carro"}
      </Button>
    </form>
  );
}