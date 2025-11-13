# 🕵️ BalanceTonPote - Application d'Inquisition Moderne

Une application React Native permettant de "balancer" ses potes en enregistrant leurs méfaits dans une base de données SQLite locale avec un thème "inquisition" criminalistique.

## 📱 Fonctionnalités

- **Interface unique** avec thème sombre "inquisition"
- **Saisie du suspect** : nom du pote à balancer
- **Identification du dénonciateur** : nom de celui qui balance
- **Classification des crimes** :
  - Crime
  - Détournement  
  - Adultère
  - Mauvaise action
- **Autorités compétentes** selon le type de crime :
  - **Crime** : Police, FBI, CIA, GIGN, Gendarme de St Tropez
  - **Détournement** : Impôts, URSSAF, CAF
  - **Adultère** : Femme, Conjointe, Belle mère
  - **Mauvaise action** : Père Noël, Lapin de Pâques
- **Description détaillée** de l'action répréhensible
- **Sauvegarde automatique** en base SQLite locale

## 🚀 Installation et Lancement

### Prérequis
- Node.js (version 20.11.1 minimum)
- npm ou yarn
- Expo CLI

### Installation des dépendances
```bash
npm install
```

### Lancement de l'application

#### Option 1: Sur le web (navigateur)
```bash
npx expo start --web
```

#### Option 2: Développement mobile
```bash
npx expo start
```
Puis scannez le QR code avec l'app Expo Go sur votre téléphone.

#### Option 3: Via les tâches VS Code
- Ouvrir la palette de commandes (`Ctrl+Shift+P`)
- Rechercher "Tasks: Run Task"
- Sélectionner "Start Expo Web" ou "Start Expo Development"

## 🛠️ Technologies Utilisées

- **React Native** avec Expo
- **Base de données hybride** :
  - **SQLite** (expo-sqlite) pour mobile (local)
  - **Supabase** (PostgreSQL) pour web (cloud)
- **React Native Picker** pour les listes déroulantes
- **StatusBar** pour l'interface
- **VS Code Extensions** :
  - React Native Tools
  - Expo Tools
  - ES7+ React/Redux/React-Native snippets

## 🎨 Style et Thème

L'application utilise un thème "inquisition" avec :
- **Couleurs principales** : Noir (#0A0A0A), Rouge sang (#8B0000), Or antique (#D4AF37)
- **Interface sombre** inspirée des applications criminalistiques
- **Effets d'ombres** et typographie dramatique
- **Icônes thématiques** (🕵️, ⚖️)

## 📂 Structure du Projet

```
BalanceTonPote/
├── App.js              # Application principale
├── package.json        # Dépendances et scripts
├── app.json           # Configuration Expo
├── .vscode/           # Configuration VS Code
│   └── tasks.json     # Tâches automatisées
├── .github/
│   └── copilot-instructions.md
└── README.md          # Documentation
```

## 💾 Base de Données

### 🔄 Système Multi-Utilisateurs Cloud
L'application utilise maintenant **Supabase par défaut** sur toutes les plateformes :
- **Base partagée en ligne** - Tous les utilisateurs voient les mêmes données
- **Fallback SQLite automatique** si connexion impossible
- **Reconnexion automatique** quand le réseau revient

### 📊 Données stockées
Chaque balançage contient :
- ID unique du balançage
- Nom du suspect
- Nom du dénonciateur
- Type d'action
- Autorité destinataire
- Description détaillée
- Date et heure de création

### 🌐 Configuration Cloud (Obligatoire pour le partage)
Pour permettre à plusieurs utilisateurs de partager les balançages :
1. **OBLIGATOIRE** : Voir le fichier `SUPABASE_SETUP.md` pour les instructions complètes
2. Créer un compte gratuit sur [supabase.com](https://supabase.com)  
3. Configurer les clés API dans `lib/supabase.js`
4. **L'application fonctionne en mode offline** si Supabase n'est pas configuré

### 👥 Mode Multi-Utilisateurs
- **Base partagée** : Tous les balançages sont visibles par tous
- **Temps réel** : Les nouveaux balançages apparaissent instantanément
- **Indicateur de connexion** : Savoir si vous êtes online ou offline
- **Reconnexion automatique** : Bouton pour se reconnecter

## 🔧 Développement

### Scripts disponibles
- `npm start` : Lance Expo
- `npm run android` : Lance sur Android (nécessite émulateur)
- `npm run ios` : Lance sur iOS (macOS uniquement)
- `npm run web` : Lance sur navigateur web

### Extensions VS Code recommandées
Les extensions suivantes sont automatiquement installées :
- React Native Tools (msjsdiag.vscode-react-native)
- Expo Tools (expo.vscode-expo-tools)
- ES7+ React/Redux/React-Native snippets (dsznajder.es7-react-js-snippets)

## 📝 Utilisation

1. **Remplir le nom du suspect** à balancer
2. **Indiquer votre identité** de dénonciateur
3. **Sélectionner le type de crime** dans la liste
4. **Choisir l'autorité compétente** qui apparaît selon le crime
5. **Détailler l'accusation** dans le champ texte
6. **Appuyer sur "PROCÉDER AU BALANÇAGE"** pour sauvegarder

L'application confirme alors que le balançage a été effectué et réinitialise le formulaire pour un nouveau signalement.

## 🎯 Objectif

Cette application humoristique permet de "dénoncer" ses amis pour leurs petites bêtises dans une interface dramatique digne d'un tribunal d'inquisition, tout en apprenant le développement React Native et l'utilisation de SQLite embarqué.