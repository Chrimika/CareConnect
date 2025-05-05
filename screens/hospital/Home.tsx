import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Mapbox from '@rnmapbox/maps';
import Feather from 'react-native-vector-icons/Feather';

Mapbox.setAccessToken('pk.eyJ1Ijoiam9yZWwtdGlvbWVsYSIsImEiOiJjbTdxbjhpNHgxMnFwMmpvanVwMm1odWh5In0.Sg7UkR0--3rsBywJvy3pIQ');

const HospitalHomeScreen = () => {
  const navigation = useNavigation();
  const [hospitalData, setHospitalData] = useState(null);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const docSnap = await firestore().collection('settings').doc('hospitalSettings').get();
        if (docSnap.exists) {
          setHospitalData(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching hospital data:', error);
      }
    };

    const fetchDoctorsCount = async () => {
      try {
        const snapshot = await firestore().collection('doctors').get();
        setDoctorsCount(snapshot.size);
      } catch (error) {
        console.error('Error fetching doctors count:', error);
      }
    };

    const fetchTodaySchedule = async () => {
      try {
        const today = getDayOfWeek();
        const snapshot = await firestore()
          .collection('appointments')
          .where('day', '==', today)
          .get();
        setTodaySchedule(snapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error('Error fetching today\'s schedule:', error);
      }
    };

    fetchHospitalData();
    fetchDoctorsCount();
    fetchTodaySchedule();
  }, []);

  const getDayOfWeek = () => {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const today = new Date().getDay();
    return days[today];
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={hospitalData?.logo ? { uri: hospitalData.logo } : require('../../assets/images/hosto.png')}
          style={styles.logo}
        />
        <Text style={styles.hospitalName}>{hospitalData?.hospitalName || 'Nom de l\'hôpital'}</Text>
        <Text style={styles.hospitalAddress}>{hospitalData?.address || 'Adresse de l\'hôpital'}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => navigation.navigate('Médecins')}
        >
          <Feather name="users" size={24} color="#0EBE7F" />
          <Text style={styles.statNumber}>{doctorsCount}</Text>
          <Text style={styles.statLabel}>Médecins</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard}>
          <Feather name="calendar" size={24} color="#0EBE7F" />
          <Text style={styles.statNumber}>{todaySchedule.length}</Text>
          <Text style={styles.statLabel}>RDV Aujourd'hui</Text>
        </TouchableOpacity>
      </View>

      {/* Location Map */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localisation</Text>
        {hospitalData?.location && (
          <View style={styles.mapContainer}>
            <Mapbox.MapView style={styles.map}>
              <Mapbox.Camera
                zoomLevel={15}
                centerCoordinate={[hospitalData.location.longitude, hospitalData.location.latitude]}
              />
              <Mapbox.PointAnnotation
                id="hospitalLocation"
                coordinate={[hospitalData.location.longitude, hospitalData.location.latitude]}
              >
                <View style={styles.marker}>
                  <Feather name="map-pin" size={24} color="#0EBE7F" />
                </View>
              </Mapbox.PointAnnotation>
            </Mapbox.MapView>
          </View>
        )}
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horaires aujourd'hui ({getDayOfWeek()})</Text>
        {hospitalData?.openingHours && (
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleText}>
              {hospitalData.openingHours[getDayOfWeek()]?.open ? 
                `Ouvert de ${hospitalData.openingHours[getDayOfWeek()].open} à ${hospitalData.openingHours[getDayOfWeek()].close}` : 
                'Fermé aujourd\'hui'}
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Médecins')}
          >
            <Feather name="user-plus" size={24} color="#fff" />
            <Text style={styles.actionText}>Ajouter un médecin</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Planning')}
          >
            <Feather name="calendar" size={24} color="#fff" />
            <Text style={styles.actionText}>Gérer les plannings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0EBE7F',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  marker: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
  },
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  scheduleText: {
    fontSize: 16,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#0EBE7F',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
});

export default HospitalHomeScreen;
