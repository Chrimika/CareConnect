import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const DoctorsManagementScreen = () => {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    try {
      const snapshot = await firestore().collection('doctors').get();
      const doctorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Erreur lors du chargement des docteurs :', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const docSnap = await firestore()
        .collection('settings')
        .doc('hospitalSettings')
        .get();
      if (docSnap.exists && docSnap.data().specialties) {
        setSpecialties(docSnap.data().specialties);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des spécialités :', error);
    }
  };

  const handleAddOrUpdateDoctor = async () => {
    if (!name.trim() || !specialty.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      if (editingDoctorId) {
        await firestore().collection('doctors').doc(editingDoctorId).update({
          name,
          specialty,
        });
        setEditingDoctorId(null);
      } else {
        await firestore().collection('doctors').add({
          name,
          specialty,
        });
      }

      setName('');
      setSpecialty('');
      fetchDoctors();
    } catch (error) {
      console.error("Erreur lors de l'ajout/mise à jour du docteur :", error);
    }
  };

  const handleEditDoctor = doctor => {
    setName(doctor.name);
    setSpecialty(doctor.specialty);
    setEditingDoctorId(doctor.id);
  };

  const handleDeleteDoctor = async id => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer ce docteur ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('doctors').doc(id).delete();
              fetchDoctors();
            } catch (error) {
              console.error('Erreur lors de la suppression :', error);
            }
          },
        },
      ],
    );
  };

  const renderDoctorItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name} ({item.specialty})</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEditDoctor(item)} style={styles.editButton}>
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteDoctor(item.id)} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Docteurs</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom du docteur"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Spécialité"
        value={specialty}
        onChangeText={setSpecialty}
      />
      {/* Si tu veux un Picker avec les spécialités disponibles */}
      {/* <Picker
        selectedValue={specialty}
        onValueChange={(itemValue) => setSpecialty(itemValue)}>
        {specialties.map((sp, idx) => (
          <Picker.Item key={idx} label={sp} value={sp} />
        ))}
      </Picker> */}

      <TouchableOpacity onPress={handleAddOrUpdateDoctor} style={styles.addButton}>
        <Text style={styles.buttonText}>
          {editingDoctorId ? 'Mettre à jour' : 'Ajouter'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={doctors}
        keyExtractor={item => item.id}
        renderItem={renderDoctorItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

export default DoctorsManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    marginRight: 12,
    backgroundColor: '#007bff',
    padding: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});
