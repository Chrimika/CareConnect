import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HospitalAdminScreen({ navigation }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminId = auth().currentUser?.uid;
    if (!adminId) {
      setLoading(false);
      return;
    }

    const CACHE_KEY = `@hospitals_${adminId}`;

    // 1. Vérifier le cache local
    const checkCache = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setHospitals(JSON.parse(cachedData));
          setLoading(false);
        }
      } catch (error) {
        console.log("Erreur cache:", error);
      }
    };

    // 2. Configurer l'écouteur temps réel
    const setupRealtimeListener = () => {
      return firestore()
        .collection('hospitals')
        .where('adminId', '==', adminId)
        .onSnapshot(async (snapshot) => {
          const hospitalsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setHospitals(hospitalsData);
          setLoading(false);

          // Mettre à jour le cache
          try {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(hospitalsData));
          } catch (error) {
            console.log("Erreur sauvegarde cache:", error);
          }
        }, (error) => {
          console.error("Erreur temps réel:", error);
          setLoading(false);
        });
    };

    checkCache();
    const unsubscribe = setupRealtimeListener();

    return () => unsubscribe();
  }, []);

  const renderHospitalItem = ({ item }) => (
    <Pressable 
      style={styles.hospitalCard}
      onPress={() => navigation.navigate('HospitalDetails', { hospitalId: item.id })}
    >
      {item.logo ? (
        <Image defaultSource={require('../assets/images/HospitalEmpty.png')} source={{ uri: item.logo }} style={styles.hospitalLogo} />
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
      <View style={{display:'flex',flexDirection:'row',marginTop:'auto'}}>
        <Pressable style={{padding:5,backgroundColor:'#f9f9f9',borderRadius:'50%'}}>
           <Icon name="create-outline" size={20} color="#09d1a0"  />
        </Pressable>
        <Pressable style={{padding:5,backgroundColor:'#f9f9f9',marginLeft:15,borderRadius:'50%'}}>
          <Icon name="trash" size={20} color="red"/>
        </Pressable>
        
      </View>
     
    </Pressable>
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
      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate('add-hospital')}
      >
        <Icon name="add" size={28} color="white" />
      </Pressable>
      <Text style={styles.addButtonText}>Nouveau</Text>
    </View>
  );
}

// Gardez le même StyleSheet que dans votre code original
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 40,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  hospitalInfo: {
    height:100,
    flex: 1,
    justifyContent:'center'
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