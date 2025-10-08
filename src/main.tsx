import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'

import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { PlatformSettingsProvider } from "./contexts/PlatformSettingsContext";

import App from './App';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <PlatformSettingsProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </LanguageProvider>
      </PlatformSettingsProvider>
    </AuthProvider>
  </BrowserRouter>
);
