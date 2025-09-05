import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importações com caminhos corrigidos
import Layout from './Layout';
import Home from './Home';
import CadastrarCarro from './pages/CadastrarCarro';
import MeusAnuncios from './pages/MeusAnuncios';
import DetalhesCarro from './pages/DetalhesCarro';

// Configuração das rotas
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="cadastrar-carro" element={<CadastrarCarro />} />
          <Route path="meus-anuncios" element={<MeusAnuncios />} />
          <Route path="detalhes-carro/:id" element={<DetalhesCarro />} />
          <Route path="*" element={<div>Página não encontrada</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Renderiza o aplicativo no HTML
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);