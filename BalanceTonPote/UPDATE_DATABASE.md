# Mise à jour de la base de données Supabase

Pour terminer l'intégration de l'authentification, vous devez exécuter cette commande SQL dans votre console Supabase :

## 1. Accéder à la console Supabase
1. Allez sur https://supabase.com
2. Connectez-vous à votre projet
3. Allez dans "SQL Editor"

## 2. Exécuter cette commande SQL

```sql
-- Ajouter la colonne user_id à la table balancages
ALTER TABLE balancages 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Optionnel : Ajouter un index pour optimiser les performances
CREATE INDEX idx_balancages_user_id ON balancages(user_id);

-- Optionnel : Ajouter une politique RLS (Row Level Security) pour que chaque utilisateur ne voie que ses propres balançages
ALTER TABLE balancages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs propres balançages
CREATE POLICY "Users can view own balancages" ON balancages
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer leurs propres balançages
CREATE POLICY "Users can insert own balancages" ON balancages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres balançages
CREATE POLICY "Users can update own balancages" ON balancages
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres balançages
CREATE POLICY "Users can delete own balancages" ON balancages
    FOR DELETE USING (auth.uid() = user_id);
```

## 3. Fonctionnalités disponibles après la mise à jour

✅ **Authentification complète** - Login/Register/Logout
✅ **Sécurité RLS** - Chaque utilisateur ne voit que ses propres balançages
✅ **Multi-utilisateurs** - Plusieurs personnes peuvent utiliser l'app
✅ **Données persistantes** - Sauvegarde cloud automatique

## 4. Tester l'application

1. Lancez l'app : `npx expo start`
2. Créez un compte utilisateur
3. Balancez un pote
4. Vérifiez que le balançage apparaît dans le dashboard
5. Déconnectez-vous et reconnectez-vous
6. Vérifiez que vos données sont toujours là

## 5. Mode de fonctionnement

- **Par défaut** : Chaque utilisateur voit uniquement ses propres balançages (mode privé)
- **Optionnel** : Si vous voulez que tous les utilisateurs voient tous les balançages (mode public), supprimez les politiques RLS avec :

```sql
DROP POLICY IF EXISTS "Users can view own balancages" ON balancages;
DROP POLICY IF EXISTS "Users can insert own balancages" ON balancages;
DROP POLICY IF EXISTS "Users can update own balancages" ON balancages;
DROP POLICY IF EXISTS "Users can delete own balancages" ON balancages;
ALTER TABLE balancages DISABLE ROW LEVEL SECURITY;
```

L'app est maintenant prête à être utilisée ! 🎉