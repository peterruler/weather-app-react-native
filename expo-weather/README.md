# Expo Weather App 🌤️

Built with OpenAI Codex

![App Screenshot](../_Project/Screenshot.png)

Eine moderne Wetter-App, entwickelt mit React Native und Expo, die aktuelle Wetterdaten für beliebige Städte weltweit anzeigt.

## Features ✨

- 🌍 Weltweite Wettersuche nach Städten
- 🌡️ Anzeige von Temperatur, Luftfeuchtigkeit und Windgeschwindigkeit
- 🎨 Dynamische Icons je nach Wetterlage (sonnig, bewölkt, regnerisch)
- 📱 Responsive Design für iOS, Android und Web
- 🇩🇪 Deutsche Benutzeroberfläche
- ⚡ TypeScript für bessere Code-Qualität
- 🧪 Jest Testing Setup mit Coverage

## Screenshots 📱

Die App zeigt verschiedene Wettericons abhängig von den aktuellen Bedingungen:
- ☀️ Sonnig
- ☁️ Bewölkt  
- 🌧️ Regnerisch

## Installation 🚀

### Voraussetzungen
- Node.js (Version 18 oder höher)
- npm oder yarn
- Expo CLI (`npm install -g @expo/cli`)

### Setup
1. Repository klonen oder Ordner herunterladen
2. In das Projektverzeichnis wechseln:
   ```bash
   cd expo-weather
   ```
3. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

## Verwendung 💻

### Entwicklung starten
```bash
# Expo Development Server starten
npm start

# Spezifische Plattformen
npm run ios      # iOS Simulator
npm run android  # Android Emulator  
npm run web      # Web Browser
```

### Tests ausführen
```bash
# Tests mit Coverage ausführen
npm test

# TypeScript Typ-Checking
npm run typecheck

# Code Linting
npm run lint
```

## API-Konfiguration 🔧

Die App verwendet die OpenWeatherMap API. Der API-Schlüssel ist bereits konfiguriert, für Produktionsumgebungen sollte dieser jedoch durch einen eigenen ersetzt werden.

## Projektstruktur 📁

```
expo-weather/
├── App.tsx                 # Haupt-App-Komponente
├── assets/                 # Bilder und Ressourcen
│   ├── bg.png             # Hintergrundbild (optional)
│   └── img/               # Wetter-Icons
│       ├── sunny.png
│       ├── cloudy.png
│       └── rainy.png
├── __tests__/             # Test-Dateien
├── package.json           # Projekt-Konfiguration
├── app.json              # Expo-Konfiguration
└── tsconfig.json         # TypeScript-Konfiguration
```

## Technologien 🛠️

- **React Native**: Cross-Platform Mobile Development
- **Expo**: Entwicklungsumgebung und Build-Tools
- **TypeScript**: Statische Typisierung
- **OpenWeatherMap API**: Wetterdaten
- **Jest**: Testing Framework
- **ESLint**: Code-Qualität

## Entwicklung 👨‍💻

### Code-Qualität
Das Projekt verwendet ESLint mit Universe-Konfiguration für konsistente Code-Standards.

### Testing
Umfassende Test-Suite mit Jest und React Native Testing Library für zuverlässige Funktionalität.

### Unterstützte Plattformen
- iOS (iPhone & iPad)
- Android
- Web (Progressive Web App)

## Lizenz 📄

Dieses Projekt ist für Bildungszwecke erstellt. Bitte beachten Sie die Nutzungsbedingungen der OpenWeatherMap API bei der Verwendung.

## Beitragen 🤝

Verbesserungen und Bugfixes sind willkommen! Bitte erstellen Sie einen Pull Request oder öffnen Sie ein Issue.
