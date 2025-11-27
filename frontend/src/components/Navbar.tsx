import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Link, useNavigate } from 'react-router-dom'
import username from '../assets/username.png'
import axios from 'axios'

import logo from '../assets/logo.png'

const navigation = [
  { name: 'Sobre nosotros', href: '/about', current: false },
  { name: 'Contáctanos', href: '/contact', current: false },
  { name: 'Mis reservas', href: '/reservation', current: false },
  { name: 'Mi perfil', href: '/user', current: false },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

interface NavbarProps {
  user?: any;
  setUser?: (user: any) => void;
}

export default function Navbar({ user, setUser }: NavbarProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout')
      if (setUser) setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <nav className="bg-white-800 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
            <a href="/" className="flex items-center">
            <img
              alt="QuickPark"
              src={logo}
              className="h-8 w-auto"
            />
            </a>

          {/* Navigation links */}
          <div className="flex space-x-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-black  hover:text-blue-500',
                  'rounded-md px-3 py-2 text-sm font-medium'
                )}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Icons and user menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* Profile dropdown - Mostrar cuando hay sesión iniciada */
              <Menu as="div" className="relative">
                <MenuButton className="flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                  <img
                    alt="User"
                    src={user.imagen || username}
                    className="h-8 w-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10 object-cover"
                  />
                </MenuButton>

                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5">
                  <MenuItem>
                    <a
                      href="/user"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Configuración
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar sesión
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            ) : (
              /* Botones de Login y Register - Mostrar cuando NO hay sesión */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  Registrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}