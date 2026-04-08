import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ptBR from "./locales/pt-BR.json";
import enUS from "./locales/en-US.json";
import { detectLanguage } from "./language-detector";

const resources = {
  "pt-BR": { translation: ptBR },
  "en-US": { translation: enUS },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pt-BR", // default, will be overridden by detectLanguage
  fallbackLng: "pt-BR",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Async language detection — call once on app start
export async function initLanguage(): Promise<void> {
  const lang = await detectLanguage();
  if (lang !== i18n.language) {
    await i18n.changeLanguage(lang);
  }
}

export default i18n;
