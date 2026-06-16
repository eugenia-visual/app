import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const adminNav = [
  { to: '/panel', label: 'Panel' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/calendario', label: 'Calendario' },
  { to: '/piezas', label: 'Piezas' },
  { to: '/efemerides', label: 'Efemérides' },
  { to: '/recibos', label: 'Recibos' },
]

const clientNav = [
  { to: '/mi-calendario', label: 'Mi calendario' },
  { to: '/mis-piezas', label: 'Mis piezas' },
  { to: '/ideas', label: 'Ideas' },
]

export default function Sidebar() {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const nav = isAdmin ? adminNav : clientNav

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-brand-black text-brand-cream flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="font-display text-lg tracking-widest">EUGENIA.visual</h1>
        <p className="text-xs text-white/40 mt-1 truncate">{user?.email}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-brand-rose text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
