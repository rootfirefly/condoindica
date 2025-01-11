import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ServicesSearchAndFilterProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filter: string) => void;
}

const ServicesSearchAndFilter: React.FC<ServicesSearchAndFilterProps> = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nome ou serviço..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      <div className="flex space-x-4">
        <select
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os serviços</option>
          <option value="Encanador">Encanador</option>
          <option value="Eletricista">Eletricista</option>
          <option value="Pintor">Pintor</option>
          <option value="Pedreiro">Pedreiro</option>
          <option value="Jardineiro">Jardineiro</option>
          <option value="Outros">Outros</option>
        </select>
        <select
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas as avaliações</option>
          <option value="5">5 estrelas</option>
          <option value="4">4 estrelas ou mais</option>
          <option value="3">3 estrelas ou mais</option>
          <option value="2">2 estrelas ou mais</option>
          <option value="1">1 estrela ou mais</option>
        </select>
      </div>
    </div>
  );
};

export default ServicesSearchAndFilter;

