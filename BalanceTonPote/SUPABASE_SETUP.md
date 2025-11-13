# 🌐 Configuration Supabase pour BalanceTonPote

## � **OBLIGATOIRE pour le partage multi-utilisateurs**

⚠️ **Important** : Pour que vous 3 puissiez partager les mêmes balançages, Supabase DOIT être configuré.

## �📋 Étapes pour héberger gratuitement la base de données

### 1. Créer un compte Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project" 
3. Connectez-vous avec GitHub (recommandé)

### 2. Créer un nouveau projet
1. Cliquez sur "New Project"
2. Choisissez votre organisation
3. Nom du projet : `BalanceTonPote`
4. Mot de passe base de données : **NOTEZ-LE BIEN !**
5. Région : Europe West (pour la France)
6. Plan : Free (gratuit)

### 3. Créer la table
1. Dans le dashboard Supabase, allez dans "Table Editor"
2. Cliquez sur "Create a new table"
3. Nom de la table : `balancages`
4. Cochez "Enable Row Level Security (RLS)" pour plus tard
5. Ajoutez ces colonnes :

```sql
-- Colonnes à créer :
id - bigint - Primary Key - Auto-increment
nom_pote - text
nom_balanceur - text  
type_action - text
autorite - text
description - text
date_creation - timestamptz - Default: now()
```

### 4. Configurer les clés API
1. Allez dans "Settings" > "API"
2. Copiez ces valeurs :
   - **Project URL** (ex: `https://abcdefghijk.supabase.co`)
   - **anon public** key (longue clé commençant par `eyJhbGci...`)

### 5. Mettre à jour l'application
Dans le fichier `lib/supabase.js`, remplacez :

```javascript
const SUPABASE_URL = 'https://votre-projet.supabase.co'; // Votre Project URL
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Votre anon key
```

**💡 Conseil** : Copiez le fichier `lib/supabase.example.js` vers `lib/supabase.js` et modifiez les valeurs.

### 6. Désactiver RLS (pour simplifier)
Dans le SQL Editor de Supabase, exécutez :

```sql
-- Désactiver RLS pour permettre l'accès public
ALTER TABLE balancages DISABLE ROW LEVEL SECURITY;
```

## 🚀 Avantages de Supabase

### ✅ **Gratuit**
- 500 MB de base PostgreSQL
- 2 Go de bande passante par mois
- 50,000 utilisateurs actifs mensuels

### ✅ **Fonctionnalités**
- API REST automatique
- Interface d'administration web
- Synchronisation temps réel
- Sauvegarde automatique

### ✅ **Évolutif**
- Passe facilement au plan payant si besoin
- Authentification intégrée disponible
- Stockage de fichiers inclus

## � Fonctionnement Multi-Utilisateurs

L'application utilise maintenant :
- **Supabase** (cloud) par défaut sur TOUTES les plateformes
- **SQLite** (local) comme fallback seulement

Cela permet :
- **Base partagée** entre tous les utilisateurs
- **Synchronisation temps réel** des balançages
- **Indicateur de connexion** (online/offline)
- **Reconnexion automatique** si réseau coupé
- **Mode offline** si Supabase indisponible

## 🎯 Pour vous 3 utilisateurs

Une fois configuré, vous pourrez TOUS :
- ✅ Voir les balançages des autres en temps réel
- ✅ Ajouter des balançages visibles par tous
- ✅ Utiliser l'app même sans réseau (mode offline)
- ✅ Se reconnecter automatiquement

## 📊 Tableau de bord Supabase

Une fois configuré, vous pouvez :
- Voir tous les balançages en temps réel
- Exporter les données
- Créer des rapports
- Gérer les utilisateurs (si authentification activée)

## 🔒 Sécurité (optionnel)

Pour activer l'authentification plus tard :

```sql
-- Réactiver RLS
ALTER TABLE balancages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de lire
CREATE POLICY "Allow public read" ON balancages FOR SELECT USING (true);

-- Politique pour permettre à tous d'insérer
CREATE POLICY "Allow public insert" ON balancages FOR INSERT WITH CHECK (true);
```