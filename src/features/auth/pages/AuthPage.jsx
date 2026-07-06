import { useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';
import logo from "../../../assets/img/Kinal_bank.png";

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'

  const titles = {
    login:    { title: 'Bienvenido',           sub: 'Ingresa a tu cuenta de Kinal Bank' },
    register: { title: 'Crear cuenta',         sub: 'Regístrate en Kinal Bank' },
    forgot:   { title: 'Recuperar contraseña', sub: 'Ingresa tu correo para recuperar acceso' },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-white/60 p-8 shadow-2xl">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="KinalBank"
            className="h-32 w-auto object-contain"
          />
        </div>

        {/* TÍTULO DINÁMICO */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">
            {titles[view].title}
          </h1>
          <p className="text-gray-500 text-sm">
            {titles[view].sub}
          </p>
        </div>

        {/* FORMULARIO DINÁMICO */}
        <div className="mt-8">
          {view === 'login' && (
            <LoginForm
              onForgot={() => setView('forgot')}
              onRegister={() => setView('register')}
            />
          )}
          {view === 'register' && (
            <RegisterForm
              onSwitch={() => setView('login')}
            />
          )}
          {view === 'forgot' && (
            <ForgotPasswordForm
              onSwitch={() => setView('login')}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export { AuthPage };