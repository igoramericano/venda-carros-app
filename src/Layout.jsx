import React from 'react';
import { Link, Outlet } from "react-router-dom";
import { createPageUrl } from "@/utils.jsx";
import { Button } from "@/components/ui/button";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-slate-900 text-white p-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold text-orange-400">
            VendaCarros
          </Link>
          <div className="flex items-center space-x-4">
            <Link to={createPageUrl("Home")}>
              <Button variant="ghost" className="text-white hover:bg-slate-800">Início</Button>
            </Link>
            <Link to={createPageUrl("MeusAnuncios")}>
              <Button variant="ghost" className="text-white hover:bg-slate-800">Meus Anúncios</Button>
            </Link>
            <Link to={createPageUrl("CadastrarCarro")}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">Anunciar Carro</Button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-800 text-slate-400 py-6 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} VendaCarros. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}