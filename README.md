# Gemini Live Assistant

Une application web d'assistant vocal en temps réel utilisant l'API **Gemini Live** (`gemini-3.1-flash-live-preview`), développée avec React, Vite, et Tailwind CSS. L'interface propose une esthétique soignée de type "Hardware / Outil Spécialisé" (Terminal technique).

## Fonctionnalités Principales

- **Temps Réel Bidiréctionnel** : Utilisation des WebSockets de la Live API pour un échange vocal ultra-rapide (faible latence) avec l'IA.
- **Acquisition PCM Niveaux Bas** : Capture du microphone via l'API Web Audio (16kHz), conversion en flux PCM brut et envoi continu.
- **Audio et Interruption** : Restitution native de la voix de Gemini (24kHz). L'IA s'interrompt instantanément si l'utilisateur coupe la parole.
- **Transcriptions Live** : Les flux audio d'entrée et de sortie sont transcrits en temps réel et affichés sous forme de logs système horodatés.
- **Esthétique Matériel** : Une interface utilisateur sombre au design industriel, avec tableau de bord technique, indicateurs d'état et barres de fréquence.
- **Prompt Système Protégé** : Le comportement de l'IA (nommée "Puck") est défini de manière stricte dans le code source, sans possibilité pour l'utilisateur de l'altérer.

## Technologies Utilisées

- **Framework** : React 19 + TypeScript + Vite
- **Styling** : Tailwind CSS v4, animations asynchrones avec `motion/react`, icones via `lucide-react`.
- **Intelligence Artificielle** : SDK officiel `@google/genai`. Modèle `gemini-3.1-flash-live-preview`.
- **Audio** : API Web Audio Native (`AudioContext`, `ScriptProcessorNode`).

## Configuration et Lancement

1. Clonez ce dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine (basé sur `.env.example`) et insérez votre clé API Gemini :
   ```env
   VITE_GEMINI_API_KEY=votre_clé_api_ici
   # ou GEMINI_API_KEY=votre_clé_api_ici (selon l'environnement de déploiement)
   ```
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
5. Accédez à l'application dans votre navigateur. Assurez-vous d'accorder les permissions nécessaires au microphone.

## Avertissement

L'utilisation du modèle `gemini-3.1-flash-live-preview` requiert une connexion internet stable pour maintenir un flux WebSocket ininterrompu. L'API Web Audio peut se comporter différemment selon le navigateur (basé sur Chromium fortement recommandé pour des performances optimales).
