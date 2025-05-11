import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function HospitalAdminScreen({ navigation }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const adminId = auth().currentUser?.uid;
        if (!adminId) return;

        const snapshot = await firestore()
          .collection('hospitals')
          .where('adminId', '==', adminId)
          .get();

        const hospitalsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setHospitals(hospitalsData);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const renderHospitalItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.hospitalCard}
      onPress={() => navigation.navigate('HospitalDetails', { hospitalId: item.id })}
    >
      {item.logo ? (
        <Image source={{ uri: item.logo }} style={styles.hospitalLogo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Icon name="medical" size={24} color="#09d1a0" />
        </View>
      )}
      
      <View style={styles.hospitalInfo}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        {item.location && (
          <Text style={styles.hospitalLocation}>
            <Icon name="location" size={14} color="#666" /> 
            {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      <Icon name="chevron-forward" size={20} color="#09d1a0" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#09d1a0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mes Hôpitaux</Text>
        <View style={styles.underline} />
      </View>

      {/* Liste ou état vide */}
      {hospitals.length > 0 ? (
        <FlatList
          data={hospitals}
          renderItem={renderHospitalItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../assets/images/HospitalEmpty.png')} 
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>Pas encore d'hôpital enregistré</Text>
        </View>
      )}

      {/* Bouton d'ajout */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('add-hospital')}
      >
        <Icon name="add" size={28} color="white" />
      </TouchableOpacity>
      <Text style={styles.addButtonText}>Nouveau</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Rubik Medium',
  },
  underline: {
    width: 50,
    height: 6,
    backgroundColor: '#09d1a0',
    borderRadius: 8,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  hospitalLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  hospitalLocation: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 231,
    height: 200,
    marginBottom: 20,
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    backgroundColor: '#09d1a0',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    position: 'absolute',
    right: 30,
    bottom: 5,
    color: '#09d1a0',
    fontSize: 12,
    fontWeight: '500',
  },
});