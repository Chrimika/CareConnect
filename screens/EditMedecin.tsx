import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EditMedecinScreen = ({ route, navigation }) => {
  const { medecin } = route.params;
  const [nom, setNom] = useState(medecin.nom);
  const [prenom, setPrenom] = useState(medecin.prenom);
  const [email, setEmail] = useState(medecin.email);
  const [specialite, setSpecialite] = useState(medecin.specialite);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await firestore().collection('medecins').doc(medecin.id).update({
        nom,
        prenom,
        email,
        specialite,
      });
      Alert.alert('Succès', 'Médecin modifié');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', "Impossible de modifier le médecin");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Modifier le Médecin</Text>
      <TextInput
        style={styles.input}
        value={nom}
        onChangeText={setNom}
        placeholder="Nom"
      />
      <TextInput
        style={styles.input}
        value={prenom}
        onChangeText={setPrenom}
        placeholder="Prénom"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={specialite}
        onChangeText={setSpecialite}
        placeholder="Spécialité"
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

export default EditMedecinScreen;