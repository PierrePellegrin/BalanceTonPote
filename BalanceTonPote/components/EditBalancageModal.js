import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles/appStyles';
import { TYPES_ACTIONS, getAutorites } from '../constants/crimeTypes';

/**
 * Modal de modification d'un balançage
 */
export const EditBalancageModal = ({ visible, balancage, onClose, onSave }) => {
  const [nomPote, setNomPote] = useState('');
  const [nomBalanceur, setNomBalanceur] = useState('');
  const [typeAction, setTypeAction] = useState('');
  const [autorite, setAutorite] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (balancage) {
      setNomPote(balancage.nom_pote || '');
      setNomBalanceur(balancage.nom_balanceur || '');
      setTypeAction(balancage.type_action || '');
      setAutorite(balancage.autorite || '');
      setDescription(balancage.description || '');
    }
  }, [balancage]);

  const handleSave = async () => {
    // Validation
    if (!nomPote.trim()) {
      Alert.alert('❌ ERREUR', 'Le nom du suspect est requis');
      return;
    }
    if (!nomBalanceur.trim()) {
      Alert.alert('❌ ERREUR', 'Le nom du dénonciateur est requis');
      return;
    }
    if (!typeAction) {
      Alert.alert('❌ ERREUR', 'Le type d\'action est requis');
      return;
    }
    if (!autorite) {
      Alert.alert('❌ ERREUR', 'L\'autorité est requise');
      return;
    }
    if (!description.trim()) {
      Alert.alert('❌ ERREUR', 'La description est requise');
      return;
    }

    const updates = {
      nom_pote: nomPote.trim(),
      nom_balanceur: nomBalanceur.trim(),
      type_action: typeAction,
      autorite: autorite,
      description: description.trim()
    };

    await onSave(balancage.id, updates);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <MaterialCommunityIcons name="pencil" size={30} color="#D4AF37" />
                <Text style={styles.title}>MODIFIER LE DOSSIER</Text>
              </View>
              <Text style={styles.subtitle}>DOSSIER #{balancage?.id}</Text>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>NOM DU SUSPECT</Text>
                <TextInput
                  style={styles.input}
                  value={nomPote}
                  onChangeText={setNomPote}
                  placeholder="Entrez le nom du suspect"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>NOM DU DÉNONCIATEUR</Text>
                <TextInput
                  style={styles.input}
                  value={nomBalanceur}
                  onChangeText={setNomBalanceur}
                  placeholder="Votre nom"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>TYPE DE CRIME</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={typeAction}
                    onValueChange={setTypeAction}
                    style={styles.picker}
                    dropdownIconColor="#D4AF37"
                  >
                    {TYPES_ACTIONS.map((type) => (
                      <Picker.Item key={type.value} label={type.label} value={type.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>AUTORITÉ COMPÉTENTE</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={autorite}
                    onValueChange={setAutorite}
                    style={styles.picker}
                    dropdownIconColor="#D4AF37"
                    enabled={typeAction !== ''}
                  >
                    {getAutorites(typeAction).map((auth) => (
                      <Picker.Item key={auth.value} label={auth.label} value={auth.value} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>DESCRIPTION DES FAITS</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Décrivez en détail l'infraction commise..."
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Boutons */}
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={20} color="#8B0000" />
                  <Text style={styles.buttonText}>ANNULER</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
                  <MaterialCommunityIcons name="lock" size={20} color="#D4AF37" />
                  <Text style={styles.buttonText}>ENREGISTRER</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
