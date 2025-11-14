interface SidebarProps {
  selectedOption: string;
  onSelectOption: (option: string) => void;
}

export default function Sidebar({ selectedOption, onSelectOption }: SidebarProps) {
  const menuItems = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'registrar', label: 'Registrar Parking' },
    { id: 'gestionar', label: 'Gestionar Parking' },
    { id: 'reservas', label: 'Mis Reservas' },
    { id: 'cerrar', label: 'Cerrar sesión' },
  ];

  return (
    <aside className="h-[calc(100vh-2rem)] w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5 bg-white">
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li
            key={item.id}
            onClick={() => onSelectOption(item.id)}
            className={`p-2 rounded cursor-pointer transition-colors  ${
              selectedOption === item.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
