import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { PlatformSettingsProvider } from "./contexts/PlatformSettingsContext";
import { MaintenanceMode } from "./components/MaintenanceMode";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <PlatformSettingsProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <MaintenanceMode>
              <App />
            </MaintenanceMode>
          </CurrencyProvider>
        </LanguageProvider>
      </PlatformSettingsProvider>
    </AuthProvider>
  </BrowserRouter>
);
