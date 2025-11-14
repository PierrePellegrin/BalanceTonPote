import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { TYPES_ACTIONS, getAutorites } from '../constants/crimeTypes';
import { styles } from '../styles/appStyles';

/**
 * Écran pour balancer un pote
 */
export const BalancerScreen = ({
  nomPote,
  setNomPote,
  nomBalanceur,
  setNomBalanceur,
  typeAction,
  setTypeAction,
  autorite,
  setAutorite,
  description,
  setDescription,
  usersList,
  showNewSuspectInput,
  setShowNewSuspectInput,
  onSubmit
}) => {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <ScreenHeader 
        icon="target"
        title="BALANCE TON POTE"
        subtitle="TRIBUNAL DE L'INQUISITION MODERNE"
      />

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NOM DU SUSPECT :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={showNewSuspectInput ? 'AUTRE' : nomPote}
              style={[styles.picker, { backgroundColor: '#2A2A2A', color: '#FFFFFF' }]}
              onValueChange={(value) => {
                if (value === 'AUTRE') {
                  setShowNewSuspectInput(true);
                  setNomPote('');
                } else {
                  setShowNewSuspectInput(false);
                  setNomPote(value);
                }
              }}
              dropdownIconColor="#D4AF37"
              mode="dropdown"
              itemStyle={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}
            >
              <Picker.Item 
                label="Sélectionner un suspect..." 
                value="" 
                color="#BBBBBB"
                style={{ backgroundColor: '#2A2A2A' }}
              />
              {usersList.map((user, index) => (
                <Picker.Item 
                  key={index} 
                  label={user} 
                  value={user}
                  color="#FFFFFF"
                  style={{ backgroundColor: '#2A2A2A' }}
                />
              ))}
              <Picker.Item 
                label="➕ Nouveau suspect..." 
                value="AUTRE" 
                color="#D4AF37"
                style={{ backgroundColor: '#2A2A2A' }}
              />
            </Picker>
          </View>
          {showNewSuspectInput && (
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              value={nomPote}
              onChangeText={setNomPote}
              placeholder="Saisir le nom du nouveau suspect..."
              placeholderTextColor="#666"
              autoFocus
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>DÉNONCÉ PAR :</Text>
          <TextInput
            style={styles.input}
            value={nomBalanceur}
            onChangeText={setNomBalanceur}
            placeholder="Votre identité d'informateur..."
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>TYPE DE CRIME :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={typeAction}
              style={[styles.picker, { backgroundColor: '#2A2A2A', color: '#FFFFFF' }]}
              onValueChange={setTypeAction}
              dropdownIconColor="#D4AF37"
              mode="dropdown"
              itemStyle={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}
            >
              {TYPES_ACTIONS.map((type, index) => (
                <Picker.Item 
                  key={index} 
                  label={type.label} 
                  value={type.value}
                  color={type.value === '' ? '#BBBBBB' : '#FFFFFF'}
                  style={{ backgroundColor: '#2A2A2A' }}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>AUTORITÉ COMPÉTENTE :</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={autorite}
              style={[styles.picker, { backgroundColor: '#2A2A2A', color: '#FFFFFF' }]}
              onValueChange={setAutorite}
              dropdownIconColor="#D4AF37"
              enabled={typeAction !== ''}
              mode="dropdown"
              itemStyle={{ backgroundColor: '#2A2A2A', color: '#FFFFFF' }}
            >
              {getAutorites(typeAction).map((auth, index) => (
                <Picker.Item 
                  key={index} 
                  label={auth.label} 
                  value={auth.value}
                  color={auth.value === '' ? '#BBBBBB' : '#FFFFFF'}
                  style={{ backgroundColor: '#2A2A2A' }}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>DÉTAILS DE L'ACCUSATION :</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez les méfaits du suspect en détail..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>⚖️ PROCÉDER AU BALANÇAGE ⚖️</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
