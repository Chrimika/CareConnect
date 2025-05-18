import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function MedecinScreen({ navigation }) {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const adminId = auth().currentUser?.uid;
        if (!adminId) return;
  
        // 1. Récupérer les hôpitaux de l'admin
        const hospitalsSnapshot = await firestore()
          .collection('hospitals')
          .where('adminId', '==', adminId)
          .get();
  
        const hospitalIds = hospitalsSnapshot.docs.map(doc => doc.id);
  
        // 2. Vérifier si on a des hôpitaux avant de faire la requête
        if (hospitalIds.length === 0) {
          setMedecins([]);
          setLoading(false);
          return;
        }
  
        // 3. Récupérer les médecins de ces hôpitaux
        const medecinsSnapshot = await firestore()
          .collection('medecins')
          .where('hospitalId', 'in', hospitalIds)
          .get();
  
        const medecinsData = medecinsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        setMedecins(medecinsData);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMedecins();
  }, []);

  const renderMedecinItem = ({ item }) => (
    <Pressable 
      style={styles.medecinCard}
      onPress={() => navigation.navigate('MedecinDetails', { medecinId: item.id })}
    >
      <View style={styles.avatarPlaceholder}>
        <Icon name="person" size={24} color="#09d1a0" />
      </View>
      
      <View style={styles.medecinInfo}>
        <Text style={styles.medecinName}>{item.prenom} {item.nom}</Text>
        <Text style={styles.medecinSpecialite}>{item.specialite}</Text>
        <Text style={styles.medecinEmail}>
          <Icon name="mail" size={14} color="#666" /> {item.email}
        </Text>
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
        <Text style={styles.title}>Mes Médecins</Text>
        <View style={styles.underline} />
      </View>

      {/* Liste ou état vide */}
      {medecins.length > 0 ? (
        <FlatList
          data={medecins}
          renderItem={renderMedecinItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('../assets/images/DoctorEmpty.png')} 
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>Pas encore de médecin enregistré</Text>
        </View>
      )}

      {/* Bouton d'ajout */}
      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate('add-medecins')}
      >
        <Icon name="add" size={28} color="white" />
      </Pressable>
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
  medecinCard: {
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
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  medecinInfo: {
    flex: 1,
  },
  medecinName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  medecinSpecialite: {
    fontSize: 14,
    color: '#09d1a0',
    marginBottom: 3,
  },
  medecinEmail: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 200,
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