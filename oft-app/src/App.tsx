import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { isMiniApp, getTelegramWebApp } from './lib/telegramWebApp';
import { fetchProfile } from './lib/supabaseProfiles';

import ToastContainer from './components/ui/ToastContainer';
import SplashCursor from './components/ui/SplashCursor';
import MiniAppInit from './components/MiniAppInit';
import AuthStepLayout from './components/AuthStepLayout';
import Dashboard from './components/Dashboard';
import Spinner from './components/ui/Spinner';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const miniApp = isMiniApp();
  const { user, login, logout } = useAuthStore();

  useEffect(() => {
    if (miniApp) setShowSplash(false);
  }, [miniApp]);

  useEffect(() => {
    const checkExistingProfile = async () => {
      console.log("🔍 [AUTH DEBUG] Starting profile check...");

      try {
        // Получаем tg_id
        const wa = getTelegramWebApp();
        let tgId: string;

        if (wa?.initDataUnsafe?.user) {
          tgId = String(wa.initDataUnsafe.user.id);
          console.log("📱 [AUTH DEBUG] TG Data:", wa.initDataUnsafe);
        } else {
          // Для ПК используем тестовый ID
          tgId = '99999';
          console.log("💻 [AUTH DEBUG] Using test ID for PC development:", tgId);
        }

        console.log("🔍 [AUTH DEBUG] Supabase Querying for tg_id:", tgId);
        // Проверяем, есть ли профиль в Supabase
        const profile = await fetchProfile(tgId);

        if (profile) {
          console.log("✅ [AUTH DEBUG] Profile found:", profile);
          // Профиль найден - логиним пользователя
          const userData = {
            id: tgId,
            firstName: profile.first_name || 'User',
            username: profile.username || '',
          };
          login(userData, profile.role);
          console.log("🚀 [AUTH DEBUG] User logged in, redirecting to Dashboard");
        } else {
          console.log("❌ [AUTH DEBUG] Profile NOT found, clearing stored auth and showing registration screen");
          // Профиль не найден - очищаем сохраненное состояние и показываем регистрацию
          logout();
        }
      } catch (error) {
        console.error('❌ [AUTH DEBUG] Error checking profile:', error);
      } finally {
        console.log("🏁 [AUTH DEBUG] Profile check completed");
        setIsLoading(false);
      }
    };

    // Таймаут 3 секунды для защиты от вечной загрузки
    const timeout = setTimeout(() => {
      console.log("⏰ [AUTH DEBUG] Loading timeout reached, forcing setIsLoading(false)");
      setIsLoading(false);
    }, 3000);

    checkExistingProfile();

    return () => clearTimeout(timeout);
  }, [login, logout]);

  // Показываем загрузку
  if (isLoading) {
    console.log("⏳ [AUTH DEBUG] Showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-lg font-medium text-gray-400">
            Загрузка данных OFT...
          </p>
        </div>
      </div>
    );
  }

  console.log("🎯 [AUTH DEBUG] Rendering decision - user:", user ? "EXISTS" : "NULL");

  return (
    <>
      <MiniAppInit />
      <BrowserRouter>
        <div className="min-h-screen">
          {!user ? <AuthStepLayout /> : <Dashboard />}
          <ToastContainer />
        </div>
      </BrowserRouter>
      {showSplash && !miniApp && (
        <SplashCursor onFinish={() => setShowSplash(false)} />
      )}
    </>
  );
}

export default App;
