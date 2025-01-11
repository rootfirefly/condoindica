import Link from 'next/link';
import { FaHome, FaUser, FaBell, FaCog } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600">
            <FaHome className="mr-2" /> Início
          </Link>
        </li>
        <li>
          <Link href="/perfil" className="flex items-center text-gray-700 hover:text-blue-600">
            <FaUser className="mr-2" /> Perfil
          </Link>
        </li>
        <li>
          <Link href="/notificacoes" className="flex items-center text-gray-700 hover:text-blue-600">
            <FaBell className="mr-2" /> Notificações
          </Link>
        </li>
        <li>
          <Link href="/configuracoes" className="flex items-center text-gray-700 hover:text-blue-600">
            <FaCog className="mr-2" /> Configurações
          </Link>
        </li>
      </ul>
    </div>
  );
}

