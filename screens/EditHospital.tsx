import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EditHospitalScreen = ({ route, navigation }) => {
  const { hospital } = route.params;
  const [name, setName] = useState(hospital.name);
  const [address, setAddress] = useState(hospital.address || '');
  const [consultationDuration, setConsultationDuration] = useState(hospital.consultationDuration?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await firestore().collection('hospitals').doc(hospital.id).update({
        name,
        address,
        consultationDuration: parseInt(consultationDuration),
      });
      Alert.alert('Succès', 'Hôpital modifié');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', "Impossible de modifier l'hôpital");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Modifier l'Hôpital</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nom"
      />
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Adresse"
      />
      <TextInput
        style={styles.input}
        value={consultationDuration}
        onChangeText={setConsultationDuration}
        placeholder="Durée consultation (min)"
        keyboardType="numeric"
      />
      <Pressable style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#09d1a0', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  button: { backgroundColor: '#09d1a0', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default EditHospitalScreen;