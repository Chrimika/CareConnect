import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Alert, 
  StatusBar, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  FlatList, 
  Text, 
  ScrollView,
  Modal,
  Platform 
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Mapbox, { MapView, Camera, MarkerView, ShapeSource, LineLayer } from "@rnmapbox/maps";
import axios from 'axios';
import DatePicker from 'react-native-date-picker';

// Configuration de Mapbox
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoiam9yZWwtdGlvbWVsYSIsImEiOiJjbTdxbjhpNHgxMnFwMmpvanVwMm1odWh5In0.Sg7UkR0--3rsBywJvy3pIQ";
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const hospitals = [
  {
    id: '1',
    name: 'Hôpital Central de Yaoundé',
    latitude: 3.8686,
    longitude: 11.5214,
    price: 4500,
    rating: 4.3,
    comments: ['Service efficace', 'Personnel compétent'],
    openingHours: { start: 7, end: 20 }
  },
  {
    id: '2',
    name: 'Clinique de la Cité Verte',
    latitude: 3.8750,
    longitude: 11.5030,
    price: 6000,
    rating: 4.6,
    comments: ['Environnement moderne', 'Bon suivi médical'],
    openingHours: { start: 8, end: 18 }
  },
  {
    id: '3',
    name: 'Hôpital Général de Yaoundé',
    latitude: 3.8622,
    longitude: 11.5136,
    price: 3500,
    rating: 4.0,
    comments: ['Affluence moyenne', 'Prix abordables'],
    openingHours: { start: 6, end: 22 }
  },
  {
    id: '4',
    name: 'Polyclinique d\'Essos',
    latitude: 3.8915,
    longitude: 11.5310,
    price: 5500,
    rating: 4.4,
    comments: ['Spécialistes qualifiés', 'Bon accueil'],
    openingHours: { start: 7, end: 19 }
  },
  {
    id: '5',
    name: 'Clinique des Champions',
    latitude: 3.8800,
    longitude: 11.5150,
    price: 7000,
    rating: 4.7,
    comments: ['Équipements high-tech', 'Service VIP'],
    openingHours: { start: 6, end: 21 }
  },
  {
    id: '6',
    name: 'Hôpital de la Croix Bleue',
    latitude: 3.8550,
    longitude: 11.4950,
    price: 4000,
    rating: 4.1,
    comments: ['Tradition de qualité', 'Urgences 24/24'],
    openingHours: { start: 0, end: 24 }
  },
  {
    id: '7',
    name: 'Centre Médical de Ngoa-Ekelle',
    latitude: 3.8660,
    longitude: 11.5400,
    price: 5000,
    rating: 4.2,
    comments: ['Propreté exemplaire', 'Bon rapport qualité-prix'],
    openingHours: { start: 8, end: 17 }
  },
  {
    id: '8',
    name: 'Clinique du Mont Fébé',
    latitude: 3.9000,
    longitude: 11.5200,
    price: 6500,
    rating: 4.5,
    comments: ['Vue panoramique', 'Calme et sérénité'],
    openingHours: { start: 7, end: 19 }
  },
  {
    id: '9',
    name: 'Hôpital de la Mfoundi',
    latitude: 3.8555,
    longitude: 11.5255,
    price: 3000,
    rating: 3.9,
    comments: ['Service public', 'Longues attentes'],
    openingHours: { start: 6, end: 18 }
  },
  {
    id: '10',
    name: 'Centre Hospitalier de Bastos',
    latitude: 3.8805,
    longitude: 11.5055,
    price: 8000,
    rating: 4.8,
    comments: ['Standards internationaux', 'Médecins expatriés'],
    openingHours: { start: 6, end: 22 }
  }
];

const ConsultationScreen = ({ navigation }) => {
  const [position, setPosition] = useState(null);
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0);
  const [sortedHospitals, setSortedHospitals] = useState([]);
  const [route, setRoute] = useState(null);
  const [distanceText, setDistanceText] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHospitalDetails, setSelectedHospitalDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const cameraRef = useRef(null);
  const scrollViewRef = useRef(null);

  const getRealRoute = async (start, end) => {
    try {
      const startCoords = `${start[0]},${start[1]}`;
      const endCoords = `${end[0]},${end[1]}`;
      
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoords};${endCoords}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      
      if (response.data && response.data.routes && response.data.routes[0]) {
        return {
          route: response.data.routes[0].geometry,
          distance: response.data.routes[0].distance / 1000,
          duration: Math.ceil(response.data.routes[0].duration / 60)
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching route:', err);
      return null;
    }
  };

  const goToNextHospital = async () => {
    if (!sortedHospitals.length || !position) return;
    
    const newIndex = (currentHospitalIndex + 1) % sortedHospitals.length;
    const hospital = sortedHospitals[newIndex];
    setCurrentHospitalIndex(newIndex);
    setSelectedHospital(hospital);
    
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [hospital.longitude, hospital.latitude],
        zoomLevel: 15,
        pitch: 45,
        animationMode: 'flyTo',
        animationDuration: 2000,
      });
    }
    
    const routeData = await getRealRoute(
      [position.longitude, position.latitude],
      [hospital.longitude, hospital.latitude]
    );
    
    if (routeData) {
      setRouteCoordinates(routeData.route.coordinates);
      setRoute({
        type: 'Feature',
        geometry: routeData.route
      });
      setDistanceText(`${routeData.distance.toFixed(2)} km (~${routeData.duration} min à pied)`);
    } else {
      const distance = haversineDistance(
        position.latitude, 
        position.longitude, 
        hospital.latitude, 
        hospital.longitude
      );
      const estimatedTime = Math.ceil((distance / 5) * 60);
      setDistanceText(`${distance.toFixed(2)} km (~${estimatedTime} min à pied)`);
    }
    
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getPosition = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => resolve(position),
          error => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      });

      const { latitude, longitude } = position.coords;
      setPosition({ latitude, longitude });

      const sorted = hospitals
        .map(h => ({
          ...h,
          distance: haversineDistance(latitude, longitude, h.latitude, h.longitude)
        }))
        .sort((a, b) => a.distance - b.distance);
      
      setSortedHospitals(sorted);

      await AsyncStorage.setItem('userPosition', JSON.stringify({ latitude, longitude }));
      await firestore().collection('users').doc(user.uid).update({
        position: new firestore.GeoPoint(latitude, longitude),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error getting position:', error);
      setError(error.message || 'Impossible d\'obtenir la position');
      
      if (__DEV__) {
        const defaultPosition = { latitude: 3.87, longitude: 11.52 };
        setPosition(defaultPosition);
        
        const sorted = hospitals
          .map(h => ({
            ...h,
            distance: haversineDistance(defaultPosition.latitude, defaultPosition.longitude, h.latitude, h.longitude)
          }))
          .sort((a, b) => a.distance - b.distance);
        setSortedHospitals(sorted);
      }
      
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPosition();
  }, []);

  const centerOnUser = () => {
    if (position && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [position.longitude, position.latitude],
        zoomLevel: 15,
        animationMode: 'flyTo',
        animationDuration: 1000,
      });
    }
  };

  const handleHospitalPress = async (item) => {
    setSelectedHospital(item);
    
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [item.longitude, item.latitude],
        zoomLevel: 15,
        pitch: 45,
        animationMode: 'flyTo',
        animationDuration: 2000,
      });
    }

    if (position) {
      const routeData = await getRealRoute(
        [position.longitude, position.latitude],
        [item.longitude, item.latitude]
      );
      
      if (routeData) {
        setRouteCoordinates(routeData.route.coordinates);
        setRoute({
          type: 'Feature',
          geometry: routeData.route
        });
        setDistanceText(`${routeData.distance.toFixed(2)} km (~${routeData.duration} min à pied)`);
      } else {
        const distance = haversineDistance(
          position.latitude, 
          position.longitude, 
          item.latitude, 
          item.longitude
        );
        const estimatedTime = Math.ceil((distance / 5) * 60);
        setDistanceText(`${distance.toFixed(2)} km (~${estimatedTime} min à pied)`);
      }
    }
  };

  const handleConsultPress = (hospital) => {
    setSelectedHospitalDetails(hospital);
    setModalVisible(true);
  };

  const handleTakeAppointment = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert("Erreur", "Vous devez être connecté pour prendre un rendez-vous");
        return;
      }
  
      // Récupérer les infos du patient depuis Firestore
      const patientDoc = await firestore().collection('users').doc(user.uid).get();
      if (!patientDoc.exists) {
        throw new Error("Profil patient introuvable");
      }
  
      const patientData = patientDoc.data();
  
      // Créer l'objet rendez-vous
      const appointmentData = {
        patientId: user.uid,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        patientPhone: patientData.phone || 'Non renseigné',
        hospitalId: selectedHospitalDetails.id,
        hospitalName: selectedHospitalDetails.name,
        date: new Date(), // Date actuelle (à remplacer par un sélecteur de date)
        status: 'pending', // pending, confirmed, cancelled, completed
        price: selectedHospitalDetails.price,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      };
  
      // Ajouter à la collection appointments
      await firestore().collection('appointments').add(appointmentData);
  
      // Mettre à jour les sous-collections (optionnel mais pratique)
      await firestore().collection('hospitals').doc(selectedHospitalDetails.id)
        .collection('appointments').add({
          ...appointmentData,
          patientRef: firestore().collection('users').doc(user.uid)
        });
  
      await firestore().collection('users').doc(user.uid)
        .collection('appointments').add({
          ...appointmentData,
          hospitalRef: firestore().collection('hospitals').doc(selectedHospitalDetails.id)
        });
  
      Alert.alert(
        "Succès", 
        "Votre rendez-vous a été enregistré. Vous recevrez une confirmation par SMS."
      );
      setModalVisible(false);
      
    } catch (error) {
      console.error("Erreur prise de RDV:", error);
      Alert.alert(
        "Erreur", 
        error.message || "Une erreur est survenue lors de la prise de rendez-vous"
      );
    }
  };

  const renderHospitalItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.hospitalItem, 
        selectedHospital?.id === item.id && styles.selectedHospitalItem
      ]}
      onPress={() => handleHospitalPress(item)}
      activeOpacity={0.7}
    >
      <View>
        <Text style={styles.hospitalName}>{item.name}</Text>
        <Text style={styles.hospitalDetail}>💵 Prix: {item.price} FCFA</Text>
        <Text style={styles.hospitalDetail}>⭐ Note: {item.rating}/5</Text>
        <Text style={styles.hospitalDetail}>🕒 Horaire: {item.openingHours.start}h - {item.openingHours.end}h</Text>
        
        {selectedHospital?.id === item.id && (
          <>
            <Text style={styles.distanceText}>{distanceText}</Text>
            <TouchableOpacity 
              style={styles.consultButton}
              onPress={() => handleConsultPress(item)}
            >
              <Text style={styles.consultButtonText}>Consulter</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderConsultationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedHospitalDetails?.name}</Text>
          
          <View style={styles.modalSeparator} />
          
          <Text style={styles.modalSubtitle}>Informations</Text>
          <Text style={styles.modalText}>Prix consultation: {selectedHospitalDetails?.price} FCFA</Text>
          <Text style={styles.modalText}>Note: {selectedHospitalDetails?.rating}/5</Text>
          <Text style={styles.modalText}>Heures d'ouverture: {selectedHospitalDetails?.openingHours?.start}h - {selectedHospitalDetails?.openingHours?.end}h</Text>
          
          <Text style={styles.modalSubtitle}>Date du rendez-vous</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.datePickerButtonText}>
              {appointmentDate.toLocaleString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </TouchableOpacity>
  
          <DatePicker
            modal
            open={datePickerVisible}
            date={appointmentDate}
            onConfirm={(date) => {
              setDatePickerVisible(false);
              setAppointmentDate(date);
            }}
            onCancel={() => setDatePickerVisible(false)}
            minuteInterval={15}
            minimumDate={new Date()}
            locale="fr"
            title="Sélectionnez une date"
            confirmText="Confirmer"
            cancelText="Annuler"
          />
  
          <Text style={styles.modalSubtitle}>Commentaires</Text>
          {selectedHospitalDetails?.comments?.map((comment, index) => (
            <Text key={index} style={styles.modalComment}>• {comment}</Text>
          ))}
          
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonSecondaryText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleTakeAppointment}
            >
              <Text style={styles.modalButtonPrimaryText}>Prendre RDV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F5FCFF' }}>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'dark-content'} />
      
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3a86ff" />
          <Text style={{ marginTop: 10 }}>Chargement de la carte...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={getPosition}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : position ? (
        <>
          <View style={{ height: '50%', position: 'relative' }}>
            <MapView
              style={{ flex: 1 }}
              styleURL={'mapbox://styles/mapbox/streets-v11'}
              projection='globe'
              zoomEnabled
              rotateEnabled
              pitchEnabled
              logoEnabled={false}
              scaleBarEnabled={false}
            >
              <Camera
                ref={cameraRef}
                zoomLevel={16}
                centerCoordinate={[position.longitude, position.latitude]}
                animationMode='flyTo'
                animationDuration={2000}
              />
              
              <MarkerView coordinate={[position.longitude, position.latitude]}>
                <View style={styles.userMarker}>
                  <View style={styles.userMarkerInner} />
                </View>
              </MarkerView>

              {route && (
                <ShapeSource id="routeSource" shape={route}>
                  <LineLayer
                    id="routeLayer"
                    style={{
                      lineColor: '#3a86ff',
                      lineWidth: 4,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                </ShapeSource>
              )}

              {hospitals.map((hospital) => (
                <MarkerView 
                  key={hospital.id} 
                  coordinate={[hospital.longitude, hospital.latitude]}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <TouchableOpacity onPress={() => handleHospitalPress(hospital)}>
                    <View style={[
                      styles.hospitalMarker,
                      selectedHospital?.id === hospital.id && styles.selectedHospitalMarker
                    ]}>
                      <Text style={styles.markerText}>{hospital.price}F</Text>
                    </View>
                  </TouchableOpacity>
                </MarkerView>
              ))}
            </MapView>

            <TouchableOpacity 
              style={styles.targetButton} 
              onPress={centerOnUser}
            >
              <Image source={require('../assets/images/target.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.hospitalButton} 
              onPress={goToNextHospital}
            >
              <Image source={require('../assets/images/hosto.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={{ flex: 1, padding: 15 }}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <Text style={styles.sectionTitle}>Hôpitaux à proximité</Text>
            <FlatList
              data={sortedHospitals.length ? sortedHospitals : hospitals}
              keyExtractor={(item) => item.id}
              renderItem={renderHospitalItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          </ScrollView>

          {renderConsultationModal()}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  hospitalItem: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedHospitalItem: {
    backgroundColor: '#e6f7ff',
    borderColor: '#3a86ff',
  },
  hospitalName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#212529',
  },
  hospitalDetail: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 3,
  },
  distanceText: {
    marginTop: 8,
    color: '#3a86ff',
    fontWeight: '500',
  },
  consultButton: {
    marginTop: 10,
    backgroundColor: '#3a86ff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  consultButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userMarker: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a86ff',
  },
  userMarkerInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#3a86ff',
  },
  hospitalMarker: {
    height: 36,
    width: 36,
    backgroundColor: 'red',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedHospitalMarker: {
    backgroundColor: '#3a86ff',
    transform: [{ scale: 1.2 }],
    zIndex: 10,
  },
  markerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  targetButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  hospitalButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: '#3a86ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 10,
    marginBottom: 5,
  },
  modalText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
  },
  modalComment: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 5,
    marginBottom: 3,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#3a86ff',
  },
  modalButtonSecondary: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  modalButtonPrimaryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonSecondaryText: {
    color: '#495057',
    fontWeight: '500',
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginVertical: 10,
    alignItems: 'center'
  },
  datePickerButtonText: {
    color: '#495057',
    fontSize: 14
  },
});

export default ConsultationScreen;