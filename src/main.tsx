import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'

import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { PlatformSettingsProvider } from "./contexts/PlatformSettingsContext";

import App from './App';
import { MaintenanceMode } from "@/components/MaintenanceMode";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <PlatformSettingsProvider>
        <LanguageProvider>
          <CurrencyProvider>
            {/* ✅ MaintenanceMode wraps everything, including App */}
            <MaintenanceMode>
              <App />
            </MaintenanceMode>
          </CurrencyProvider>
        </LanguageProvider>
      </PlatformSettingsProvider>
    </AuthProvider>
  </BrowserRouter>
);
