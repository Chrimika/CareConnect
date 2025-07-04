import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

  // Suppression d'un hôpital avec confirmation
    const handleDeleteHospital = (hospitalId, hospitalName) => {
      Alert.alert(
        "Confirmation",
        `Voulez-vous vraiment supprimer l'hôpital "${hospitalName}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                await firestore().collection('hospitals').doc(hospitalId).delete();
                
                Alert.alert("Succès", "Hôpital supprimé !");
              } catch (error) {
                Alert.alert("Erreur", "Impossible de supprimer cet hôpital");
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    };

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
    <View style={styles.container}>
      {/* Header avec gradient */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de l'hôpital</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Section hero avec logo et nom */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            {hospital.logo ? (
              <Image source={{ uri: hospital.logo }} style={styles.logo} />
            ) : (
              <View style={[styles.logo, styles.logoPlaceholder]}>
                <Icon name="medical" size={45} color="#09d1a0" />
              </View>
            )}
          </View>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>4.8 (245 avis)</Text>
          </View>
        </View>

        {/* Section informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="information-circle" size={20} color="#09d1a0" />  Informations générales
          </Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="time" size={22} color="#09d1a0" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Durée de consultation</Text>
                <Text style={styles.infoValue}>{hospital.consultationDuration} minutes</Text>
              </View>
            </View>

            {hospital.address && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon name="location" size={22} color="#09d1a0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Adresse</Text>
                  <Text style={styles.infoValue}>{hospital.address}</Text>
                </View>
              </View>
            )}

            {hospital.location && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Icon name="map" size={22} color="#09d1a0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Coordonnées GPS</Text>
                  <Text style={styles.infoValue}>
                    {hospital.location.latitude.toFixed(4)}, {hospital.location.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Section horaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="calendar" size={20} color="#09d1a0" />  Horaires d'ouverture
          </Text>
          <View style={styles.hoursCard}>
            {renderOpeningHours()}
          </View>
        </View>

        {/* Section services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="medical" size={20} color="#09d1a0" />  Services disponibles
          </Text>
          <View style={styles.servicesGrid}>
            <View style={styles.serviceItem}>
              <Icon name="heart" size={24} color="#e74c3c" />
              <Text style={styles.serviceText}>Cardiologie</Text>
            </View>
            <View style={styles.serviceItem}>
              <Icon name="eye" size={24} color="#3498db" />
              <Text style={styles.serviceText}>Ophtalmologie</Text>
            </View>
            <View style={styles.serviceItem}>
              <Icon name="body" size={24} color="#9b59b6" />
              <Text style={styles.serviceText}>Chirurgie</Text>
            </View>
            <View style={styles.serviceItem}>
              <Icon name="flask" size={24} color="#f39c12" />
              <Text style={styles.serviceText}>Laboratoire</Text>
            </View>
          </View>
        </View>

        {/* Section contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="call" size={20} color="#09d1a0" />  Contact
          </Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem}>
              <Icon name="call" size={20} color="#09d1a0" />
              <Text style={styles.contactText}>+237 6XX XXX XXX</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Icon name="mail" size={20} color="#09d1a0" />
              <Text style={styles.contactText}>contact@{hospital.name.toLowerCase().replace(/\s/g, '')}.cm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action flottants */}
      <View style={styles.floatingActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditHospital', { hospital: hospital })}
        >
          <Icon name="create-outline" size={20} color="white" />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteHospital(hospital.id, hospital.name)}
        >
          <Icon name="trash" size={20} color="white" />
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#09d1a0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 24,
    backgroundColor: 'white',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#09d1a0',
  },
  logoPlaceholder: {
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#e8f5e8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  hoursCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  dayLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  closedText: {
    fontSize: 16,
    color: '#e74c3c',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceText: {
    marginTop: 8,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  floatingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HospitalDetailsScreen;