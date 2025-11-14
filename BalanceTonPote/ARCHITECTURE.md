# Balance Ton Pote - Architecture

## 📁 Structure du projet

```
BalanceTonPote/
├── components/          # Composants UI réutilisables
│   ├── AuthScreen.js   # Écran d'authentification
│   ├── BalancageCard.js # Card pour afficher un balançage
│   ├── EmptyState.js   # Composant état vide
│   ├── ExpandableGroup.js # Groupes expandables
│   └── ScreenHeader.js # Header d'écran réutilisable
│
├── screens/            # Écrans de l'application
│   ├── BalancerScreen.js   # Écran pour balancer un pote
│   ├── DashboardScreen.js  # Écran des statistiques
│   ├── DossiersScreen.js   # Écran des dossiers
│   └── SettingsScreen.js   # Écran des paramètres
│
├── hooks/              # Hooks React personnalisés
│   └── useApp.js       # Hooks pour auth, DB et balançages
│
├── utils/              # Fonctions utilitaires
│   ├── dateUtils.js    # Utilitaires de formatage de dates
│   ├── statsUtils.js   # Calculs statistiques
│   └── userUtils.js    # Utilitaires utilisateurs
│
├── constants/          # Constantes et configuration
│   ├── crimeTypes.js   # Types de crimes et autorités
│   └── theme.js        # Couleurs et constantes UI
│
├── styles/             # Styles de l'application
│   └── appStyles.js    # StyleSheet principal
│
├── lib/                # Bibliothèques externes
│   └── supabase.js     # Configuration Supabase
│
├── assets/             # Ressources (images, icônes)
└── App.js              # Point d'entrée principal
```

## 🏗️ Architecture

### Composants (`/components`)
Composants UI réutilisables et indépendants :
- **BalancageCard** : Affiche les détails d'un balançage
- **ExpandableGroup** : Groupe expandable pour regrouper les dossiers
- **ScreenHeader** : Header personnalisable pour chaque écran
- **EmptyState** : État vide générique
- **AuthScreen** : Formulaire de connexion/inscription

### Écrans (`/screens`)
Chaque écran représente une page complète de l'application :
- **DashboardScreen** : Statistiques et métriques
- **DossiersScreen** : Liste et groupes de balançages
- **BalancerScreen** : Formulaire de dénonciation
- **SettingsScreen** : Paramètres utilisateur

### Hooks (`/hooks`)
Hooks personnalisés pour la logique métier :
- **useAuth** : Gestion de l'authentification
- **useDatabase** : Initialisation et connexion DB
- **useBalancages** : CRUD des balançages

### Utils (`/utils`)
Fonctions utilitaires pures :
- **dateUtils** : Formatage des dates
- **statsUtils** : Calculs statistiques (top 3, groupements)
- **userUtils** : Manipulation des données utilisateur

### Constants (`/constants`)
Données statiques et configuration :
- **crimeTypes** : Liste des crimes et autorités
- **theme** : Palette de couleurs et constantes UI

### Styles (`/styles`)
Tous les styles centralisés dans un seul fichier pour faciliter la maintenance

## 🔄 Flux de données

1. **App.js** : Point d'entrée
   - Initialise les hooks (auth, DB, balançages)
   - Gère la navigation entre écrans
   - Passe les props aux écrans enfants

2. **Hooks** : Logique métier
   - Récupèrent et transforment les données
   - Gèrent les états globaux
   - Communiquent avec Supabase/SQLite

3. **Screens** : Interface utilisateur
   - Reçoivent les données via props
   - Affichent les composants UI
   - Déclenchent les actions utilisateur

4. **Components** : Éléments réutilisables
   - Présentent les données
   - Émettent des événements via callbacks

## 🎨 Avantages de cette architecture

✅ **Séparation des responsabilités** : Chaque fichier a un rôle précis
✅ **Réutilisabilité** : Composants et utils réutilisables
✅ **Maintenabilité** : Code organisé et facile à retrouver
✅ **Testabilité** : Fonctions pures facilement testables
✅ **Scalabilité** : Facile d'ajouter de nouvelles features
✅ **Lisibilité** : Code plus court et compréhensible

## 🚀 Ajout de nouvelles fonctionnalités

### Ajouter un nouvel écran
1. Créer le fichier dans `/screens/MonEcran.js`
2. Utiliser `ScreenHeader` pour le header
3. Importer dans `App.js` et ajouter à la navigation

### Ajouter un nouveau composant
1. Créer le fichier dans `/components/MonComposant.js`
2. Importer les styles depuis `/styles/appStyles.js`
3. Réutiliser dans n'importe quel écran

### Ajouter une nouvelle statistique
1. Ajouter la fonction dans `/utils/statsUtils.js`
2. L'utiliser dans `DashboardScreen.js`

## 📦 Migration depuis l'ancien code

L'ancien code (App.js de 1623 lignes) a été sauvegardé dans `App.js.backup`.

La nouvelle architecture divise ce code en :
- 4 écrans (200-300 lignes chacun)
- 5 composants réutilisables (30-100 lignes)
- 3 fichiers utils (30-100 lignes)
- 1 fichier de hooks (150 lignes)
- Constantes et styles séparés

**Résultat** : Code plus modulaire, maintenable et évolutif ! 🎉
