import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const HospitalDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [hospital, setHospital] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHospital = async () => {
      try {
        const doc = await firestore()
          .collection('hospitals')
          .doc(route.params.hospitalId)
          .get();
        
        if (doc.exists) {
          setHospital({
            id: doc.id,
            ...doc.data(),
            // Convertir le GeoPoint en objet simple si nécessaire
            location: doc.data().location 
              ? { 
                  latitude: doc.data().location.latitude, 
                  longitude: doc.data().location.longitude 
                } 
              : null
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération:", error);
        setLoading(false);
      }
    };

    fetchHospital();
  }, [route.params.hospitalId]);

  if (loading || !hospital) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#09d1a0" />
      </View>
    );
  }

  // Fonction pour formater les horaires
  const renderOpeningHours = () => {
    const days = [
      { label: 'Lundi', value: 'monday' },
      { label: 'Mardi', value: 'tuesday' },
      { label: 'Mercredi', value: 'wednesday' },
      { label: 'Jeudi', value: 'thursday' },
      { label: 'Vendredi', value: 'friday' },
      { label: 'Samedi', value: 'saturday' },
      { label: 'Dimanche', value: 'sunday' },
    ];

    return days.map(day => {
      const hours = hospital.openingHours?.[day.value];
      if (!hours) return null;

      return (
        <View key={day.value} style={styles.hoursRow}>
          <Text style={styles.dayLabel}>{day.label}</Text>
          {hours.closed ? (
            <Text style={styles.closedText}>Fermé</Text>
          ) : (
            <Text style={styles.hoursText}>
              {hours.open} - {hours.close}
            </Text>
          )}
        </View>
      );
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'hôpital</Text>
      </View>

      {/* Section logo et nom */}
      <View style={styles.topSection}>
        {hospital.logo ? (
          <Image source={{ uri: hospital.logo }} style={styles.logo} />
        ) : (
          <View style={[styles.logo, styles.logoPlaceholder]}>
            <Icon name="medical" size={40} color="#09d1a0" />
          </View>
        )}
        <Text style={styles.hospitalName}>{hospital.name}</Text>
      </View>

      {/* Section informations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        
        <View style={styles.infoItem}>
          <Icon name="time" size={20} color="#09d1a0" />
          <Text style={styles.infoText}>
            Durée de consultation: {hospital.consultationDuration} minutes
          </Text>
        </View>

        {hospital.address && (
          <View style={styles.infoItem}>
            <Icon name="location" size={20} color="#09d1a0" />
            <Text style={styles.infoText}>{hospital.address}</Text>
          </View>
        )}

        {hospital.location && (
          <View style={styles.infoItem}>
            <Icon name="map" size={20} color="#09d1a0" />
            <Text style={styles.infoText}>
              {hospital.location.latitude.toFixed(4)}, {hospital.location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>

      {/* Section horaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horaires d'ouverture</Text>
        {renderOpeningHours()}
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditHospital', { hospitalId: hospital.id })}
        >
          <Icon name="create-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {/* Ajouter la logique de suppression */}}
        >
          <Icon name="trash" size={20} color="white" />
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  topSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  logoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dayLabel: {
    fontSize: 16,
    color: '#555',
  },
  hoursText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  closedText: {
    fontSize: 16,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '48%',
  },
  editButton: {
    backgroundColor: '#09d1a0',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default HospitalDetailsScreen;