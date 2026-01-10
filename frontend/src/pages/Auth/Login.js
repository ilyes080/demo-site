import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import LanguageSelector from '../../components/UI/LanguageSelector';

const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language Selector */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            RestaurantPro
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.welcome')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                t('auth.signIn')
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Contactez-nous pour une démonstration
              </a>
            </p>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">{t('auth.demoAccounts')} :</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>{t('auth.chainAccount')} :</strong> chain@demo.com / demo123</p>
            <p><strong>{t('auth.gastroAccount')} :</strong> gastro@demo.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;