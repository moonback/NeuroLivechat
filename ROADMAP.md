# Roadmap & Évolutions

Cette feuille de route définit les futures étapes de développement pour le **Gemini Live Assistant**.

## Phase 1 : Fondation (✅ Terminée)
- [x] Connexion WebSocket à la Live API (`gemini-3.1-flash-live-preview`).
- [x] Transmission et lecture audio bidirectionnelle via WebAudio API (PCM 16k/24k).
- [x] Interface utilisateur "Hardware / Spécialiste" avec barres d'activité visuelles.
- [x] Gestion des transcriptions vocales (Utilisateur et Gemini).
- [x] Logique d'interruption vocale de l'IA (coupure de la parole).
- [x] Isolation du prompt système dans une constante sécurisée.

## Phase 2 : Enrichissement Multimodal (Court terme)
- [ ] **Flux Vidéo en Temps Réel** : Envoyer les trames de la webcam encodées en base64 pour permettre à l'IA de voir et réagir à l'environnement.
- [ ] **Appel de Fonctions (Tool Calling)** : Connecter la Live API à des fonctions locales (ex: récupérer la météo, contrôle domotique simulé) directement déclenchables par la voix.
- [ ] **Sélecteur de Voix** : Ajouter un panneau technique caché (mot de passe ou manipulation de l'UI paramétrée) pour basculer entre les différentes voix (Puck, Charon, Kore, Fenrir, Zephyr).
- [ ] **Analyseur Audio Avancé** : Remplacer l'animation factice des `wave-bar` par une véritable analyse de fréquences (AnalyserNode FFT) de la voix.

## Phase 3 : Interface et UX Avancées (Moyen terme)
- [ ] **Contrôles Audio Fonctionnels** : Rendre les potentiomètres "Gain" et "Threshold" actifs pour ajuster la réceptivité du microphone.
- [ ] **Exportation de Session** : Bouton pour télécharger les logs (transcriptions et événements techniques) au format texte brut ou markdown.
- [ ] **Mécanisme de Reconnexion** : Gestion automatisée et silencieuse des micro-coupures du réseau WebSocket (stratégie de reconnexion avec backoff exponentiel).
- [ ] **Outils Visuels Riches** : Implémenter le retour de données formatées (Grounding Search, Maps) de la Live API lorsqu'elle s'intègrera aux outils.

## Phase 4 : Industrialisation (Long terme)
- [ ] **Wake-Word Local** : Implémenter un petit modèle On-Device pour que l'assistant soit à l'écoute d'un mot-clé d'activation (ex: "Hey Puck") avant d'ouvrir le canal WebSocket coûteux.
- [ ] **Support PWA** : Rendre l'application téléchargeable et utilisable hors navigateur classique (installable en plein écran).
- [ ] **Backend Relay Server** : Mettre en place un vrai backend NodeJS pour la sécurité de la clé API si l'application est vouée à sortir sur le web de manière publique en B2C.
