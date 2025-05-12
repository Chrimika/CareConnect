import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const specialites = [
  { label: 'Cardiologie', value: 'cardiologie' },
  { label: 'Dermatologie', value: 'dermatologie' },
  { label: 'Pédiatrie', value: 'pediatrie' },
  { label: 'Neurologie', value: 'neurologie' },
  { label: 'Orthopédie', value: 'orthopedie' },
  { label: 'Ophtalmologie', value: 'ophtalmologie' },
  { label: 'Gynécologie', value: 'gynecologie' },
  { label: 'Radiologie', value: 'radiologie' },
];

const AddMedecinScreen = ({ navigation, route }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Récupérer les hôpitaux de l'admin
  useEffect(() => {
    const fetchHospitals = async () => {
      const adminId = auth().currentUser?.uid;
      if (!adminId) return;

      const snapshot = await firestore()
        .collection('hospitals')
        .where('adminId', '==', adminId)
        .get();

      const hospitalsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHospitals(hospitalsList);
    };

    fetchHospitals();
  }, []);

  const createMedecin = async () => {
    if (!nom || !prenom || !email || !password || !specialite || !selectedHospital) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    setLoading(true);

    try {
      // 1. Créer le compte utilisateur
      const { user } = await auth().createUserWithEmailAndPassword(email, password);
      
      // 2. Enregistrer les infos supplémentaires dans Firestore
      await firestore().collection('medecins').doc(user.uid).set({
        nom,
        prenom,
        email,
        specialite,
        hospitalId: selectedHospital,
        role: 'medecin',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 3. Ajouter le médecin à la liste des médecins de l'hôpital
      await firestore()
        .collection('hospitals')
        .doc(selectedHospital)
        .update({
          medecins: firestore.FieldValue.arrayUnion(user.uid)
        });

      Alert.alert('Succès', 'Médecin créé avec succès');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      let errorMessage = "Une erreur est survenue";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit faire au moins 6 caractères';
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajouter un Médecin</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Entrez le nom"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Prénom *</Text>
        <TextInput
          style={styles.input}
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Entrez le prénom"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@exemple.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Spécialité *</Text>
        <View style={styles.selectContainer}>
          {specialites.map(item => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.selectOption,
                specialite === item.value && styles.selectOptionSelected
              ]}
              onPress={() => setSpecialite(item.value)}
            >
              <Text style={specialite === item.value ? styles.selectOptionTextSelected : styles.selectOptionText}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hôpital *</Text>
        <View style={styles.selectContainer}>
          {hospitals.map(hospital => (
            <TouchableOpacity
              key={hospital.id}
              style={[
                styles.selectOption,
                selectedHospital === hospital.id && styles.selectOptionSelected
              ]}
              onPress={() => setSelectedHospital(hospital.id)}
            >
              <Text style={selectedHospital === hospital.id ? styles.selectOptionTextSelected : styles.selectOptionText}>
                {hospital.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={createMedecin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Enregistrer le médecin</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#09d1a0',
    marginTop: 30,
    textAlign: 'center',
    marginBottom:10
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color:'black'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color:'black'
  },
  eyeIcon: {
    padding: 12,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '48%',
  },
  selectOptionSelected: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  selectOptionText: {
    color: '#333',
    textAlign: 'center',
  },
  selectOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#09d1a0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddMedecinScreen;