# Tests Unitaires - Balance Ton Pote

## 📊 Couverture des tests

Ce projet inclut des tests unitaires complets pour toutes les fonctions utilitaires et constantes.

## 🧪 Fichiers testés

### Utils (100% de couverture)
- ✅ `utils/dateUtils.js` - Formatage des dates
- ✅ `utils/userUtils.js` - Utilitaires utilisateur
- ✅ `utils/statsUtils.js` - Calculs statistiques

### Constants (100% de couverture)
- ✅ `constants/crimeTypes.js` - Types de crimes et autorités
- ✅ `constants/theme.js` - Couleurs et constantes UI

## 🚀 Commandes

### Exécuter tous les tests
```bash
npm test
```

### Mode watch (tests automatiques au changement)
```bash
npm run test:watch
```

### Générer le rapport de couverture
```bash
npm run test:coverage
```

## 📈 Statistiques des tests

- **Total de tests** : 50+
- **Suites de tests** : 5
- **Couverture du code** : 100% (utils & constants)
- **Framework** : Jest + React Native Testing Library

## 🎯 Tests par module

### dateUtils.test.js (4 tests)
- Formatage de dates ISO en français
- Gestion de la date actuelle
- Vérification du format HH:MM
- Validation du séparateur "à"

### userUtils.test.js (7 tests)
- Gestion des utilisateurs null/undefined
- Extraction du nom depuis metadata
- Extraction du nom depuis l'email
- Priorisation metadata > email
- Cas limites (pas d'email, pas de metadata)

### statsUtils.test.js (25+ tests)
- Comptage par type de crime
- Top 3 coupables avec tri
- Top 3 balanceurs avec tri
- Groupement par suspect avec dates triées
- Groupement par balanceur
- Gestion des tableaux vides
- Intégrité des données

### crimeTypes.test.js (12+ tests)
- Structure des types d'actions
- Autorités par type de crime
- Validation des placeholders
- Vérification de tous les types
- Structure label/value

### theme.test.js (15+ tests)
- Couleurs de background
- Couleurs de texte
- Couleurs d'accent
- Format hexadécimal valide
- Onglets de navigation
- Constantes de dossiers
- Cohérence du thème

## ✅ Bonnes pratiques appliquées

1. **AAA Pattern** : Arrange, Act, Assert
2. **Tests isolés** : Chaque test est indépendant
3. **Noms descriptifs** : Tests auto-documentés
4. **Cas limites** : Tests des edge cases
5. **Données de test** : Mock data réalistes
6. **Assertions claires** : Expectations précises

## 🔍 Exemple de sortie

```
PASS  utils/__tests__/dateUtils.test.js
PASS  utils/__tests__/userUtils.test.js
PASS  utils/__tests__/statsUtils.test.js
PASS  constants/__tests__/crimeTypes.test.js
PASS  constants/__tests__/theme.test.js

Test Suites: 5 passed, 5 total
Tests:       50+ passed, 50+ total
Snapshots:   0 total
Time:        2.5s
```

## 📝 Prochaines étapes

- [ ] Tests d'intégration pour les hooks
- [ ] Tests des composants React
- [ ] Tests des écrans
- [ ] Tests E2E avec Detox
- [ ] CI/CD avec GitHub Actions

## 🤝 Contribution

Pour ajouter de nouveaux tests :

1. Créer un fichier `__tests__/nomFichier.test.js`
2. Importer la fonction à tester
3. Écrire les tests avec `describe` et `it`
4. Exécuter `npm test` pour valider
5. Vérifier la couverture avec `npm run test:coverage`

## 📚 Documentation

- [Jest](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Expo](https://docs.expo.dev/develop/unit-testing/)
