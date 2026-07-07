import imgLogo from '../../assets/img/Kinal_bank.png';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const Navbar = ({ onMenuClick }) => {
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Izquierda: hamburguesa + logo */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="p-2 mr-2 rounded-lg hover:bg-gray-100 md:hidden">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src={imgLogo} alt="Logo" className="h-10 md:h-14 w-auto object-contain" />
          <h1 className="font-bold text-emerald-900 text-base md:text-lg tracking-tight">
            Kinal Bank <span className="font-normal text-emerald-600 hidden sm:inline">— Mi Cuenta</span>
          </h1>
        </div>

        {/* Derecha: saludo al usuario */}
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">{user.UserName}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export { Navbar };