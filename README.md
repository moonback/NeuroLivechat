# NEURO-LIVE AI Assistant

Une interface d'intelligence artificielle de pointe, sophistiquée et extrêmement réactive, utilisant l'API **Gemini Live** (`gemini-3.1-flash-live-preview`). Développée avec React 19 et une architecture modulaire, l'application propose une expérience immersive "Glassmorphism" haut de gamme.

## ✨ Caractéristiques Uniques

- **🌀 Fusion Multimodale** : Interaction fluide combinant la voix (PCM 16k/24k) et la vision (Webcam) pour une perception temps réel de l'environnement.
- **🧠 Mémoire Sémantique Locale** : Système de persistance à long terme utilisant le modèle `gemini-embedding-2-preview` pour se souvenir de l'utilisateur et du contexte entre les sessions.
- **🛠️ Système de Skills (Markdown)** : Architecture extensible permettant d'ajouter des compétences complexes via de simples fichiers `.md`.
- **🎨 Design Premium** : Interface ultra-moderne utilisant des effets de flou (glassmorphism), des dégradés néon et des micro-animations fluides.
- **⚡ Latence Ultra-Faible** : Optimisation des WebSockets pour des réponses quasi-instantanées et une gestion naturelle des interruptions.
- **🔬 Télémétrie Avancée** : Analyseur de fréquences (FFT) intégré, logs système détaillés et monitoring de l'état de la connexion.

## 🏗️ Architecture Technique

- **Hooks Personnalisés** : Logique métier isolée (`useLiveAPI`, `useCamera`, `useWaveform`) pour une maintenance facilitée.
- **Composants Scalables** : Interface décomposée en briques fonctionnelles (`Sidebar`, `MainVisualizer`, `ChatTranscript`).
- **Skill Engine** : Chargeur dynamique de compétences utilisant le glob import de Vite pour une extensibilité infinie.

## 🚀 Stack Technologique

- **Frontend** : [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/)
- **IA** : [Google GenAI SDK](https://github.com/google-gemini/generative-ai-js)
- **Audio/Vidé** : Web Audio API (AnalyserNode), MediaDevices API

## 🔧 Installation et Lancement

1. **Clonage** :
   ```bash
   git clone <repository-url>
   ```
2. **Dépendances** :
   ```bash
   npm install
   ```
3. **Configuration** :
   Créez un fichier `.env` à la racine :
   ```env
   VITE_GEMINI_API_KEY=votre_clé_api
   ```
4. **Exécution** :
   ```bash
   npm run dev
   ```

## 📖 Extension des Compétences (Skills)

Pour ajouter une nouvelle compétence à l'assistant :
1. Créez un fichier `.md` dans `src/skills/`.
2. Définissez les règles, le style et les comportements attendus.
3. L'IA l'intégrera automatiquement lors de sa prochaine initialisation.

---
*Développé pour une interaction symbiotique homme-machine.*
