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
import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";

Mapbox.setAccessToken("pk.eyJ1Ijoiam9yZWwtdGlvbWVsYSIsImEiOiJjbTdxbjhpNHgxMnFwMmpvanVwMm1odWh5In0.Sg7UkR0--3rsBywJvy3pIQ");

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

  const cameraRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Fonction pour simuler un itinéraire réaliste
  const generateRealisticRoute = (start, end) => {
    const intermediatePoints = [];
    const steps = 5;
    
    for (let i = 1; i < steps; i++) {
      const fraction = i / steps;
      intermediatePoints.push([
        start[0] + (end[0] - start[0]) * fraction + (Math.random() * 0.01 - 0.005),
        start[1] + (end[1] - start[1]) * fraction + (Math.random() * 0.01 - 0.005)
      ]);
    }
    
    return [start, ...intermediatePoints, end];
  };

  const goToNextHospital = () => {
    if (!sortedHospitals.length || !position) return;
    
    const newIndex = currentHospitalIndex % sortedHospitals.length;
    const hospital = sortedHospitals[newIndex];
    setCurrentHospitalIndex(newIndex + 1);
    setSelectedHospital(hospital);
    
    // Animation de la caméra
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [hospital.longitude, hospital.latitude],
        zoomLevel: 15,
        pitch: 45,
        animationMode: 'flyTo',
        animationDuration: 3000,
      });
    }
    
    // Générer un itinéraire réaliste
    const coords = generateRealisticRoute(
      [position.longitude, position.latitude],
      [hospital.longitude, hospital.latitude]
    );
    
    setRouteCoordinates(coords);
    setRoute({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: coords,
      }
    });
    
    // Calcul de la distance
    let totalDistance = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lon1, lat1] = coords[i-1];
      const [lon2, lat2] = coords[i];
      totalDistance += haversineDistance(lat1, lon1, lat2, lon2);
    }
    
    const estimatedTimeMin = Math.ceil((totalDistance / 5) * 60);
    setDistanceText(`${totalDistance.toFixed(2)} km (~${estimatedTimeMin} min à pied)`);
    
    // Faire défiler vers le haut
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // km
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
    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non connecté');
        setIsLoading(false);
        return;
      }

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setPosition({ latitude, longitude });

            const sorted = hospitals
              .map(h => ({
                ...h,
                distance: haversineDistance(latitude, longitude, h.latitude, h.longitude)
              }))
              .sort((a, b) => a.distance - b.distance);
            setSortedHospitals(sorted);

            try {
              await AsyncStorage.setItem('userPosition', JSON.stringify({ latitude, longitude }));
              await firestore().collection('users').doc(user.uid).update({
                position: new firestore.GeoPoint(latitude, longitude),
                updatedAt: firestore.FieldValue.serverTimestamp(),
              });
            } catch (error) {
              console.error('Error saving position:', error);
            }
            
            setIsLoading(false);
          },
          (error) => {
            console.warn(error);
            Alert.alert('Erreur', 'Impossible d\'obtenir la position de l\'utilisateur.');
            setIsLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      } else {
        // Fallback for web or unsupported platforms (for testing)
        const defaultPosition = { latitude: 3.87, longitude: 11.52 };
        setPosition(defaultPosition);
        
        const sorted = hospitals
          .map(h => ({
            ...h,
            distance: haversineDistance(defaultPosition.latitude, defaultPosition.longitude, h.latitude, h.longitude)
          }))
          .sort((a, b) => a.distance - b.distance);
        setSortedHospitals(sorted);
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in getPosition:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPosition();
    const interval = setInterval(() => {
      getPosition();
    }, 60000); // Update position every minute
    return () => clearInterval(interval);
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

  const handleHospitalPress = (item) => {
    setSelectedHospital(item);
    
    // Centrer sur l'hôpital sélectionné
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [item.longitude, item.latitude],
        zoomLevel: 15,
        pitch: 45,
        animationMode: 'flyTo',
        animationDuration: 2000,
      });
    }

    // Générer un itinéraire si la position est disponible
    if (position) {
      const coords = generateRealisticRoute(
        [position.longitude, position.latitude],
        [item.longitude, item.latitude]
      );
      
      setRouteCoordinates(coords);
      setRoute({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords,
        }
      });
      
      // Calcul de la distance
      let totalDistance = 0;
      for (let i = 1; i < coords.length; i++) {
        const [lon1, lat1] = coords[i-1];
        const [lon2, lat2] = coords[i];
        totalDistance += haversineDistance(lat1, lon1, lat2, lon2);
      }
      
      const estimatedTimeMin = Math.ceil((totalDistance / 5) * 60);
      setDistanceText(`${totalDistance.toFixed(2)} km (~${estimatedTimeMin} min à pied)`);
    }
  };

  const handleConsultPress = (hospital) => {
    setSelectedHospitalDetails(hospital);
    setModalVisible(true);
  };

  const renderHospitalItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.hospitalItem, 
        selectedHospital?.id === item.id && styles.selectedHospitalItem
      ]}
      onPress={() => handleHospitalPress(item)}
      activeOpacity={0.7}
      accessibilityLabel={`Hôpital ${item.name}`}
      accessibilityRole="button"
      accessibilityHint="Appuyer pour sélectionner cet hôpital et voir l'itinéraire"
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
              accessibilityLabel="Bouton Consulter"
              accessibilityRole="button"
              accessibilityHint="Appuyer pour prendre rendez-vous dans cet établissement"
            >
              <Text style={styles.consultButtonText}>Consulter</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  // Modal pour les détails et rendez-vous
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
          
          <Text style={styles.modalSubtitle}>Commentaires</Text>
          {selectedHospitalDetails?.comments.map((comment, index) => (
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
              onPress={() => {
                setModalVisible(false);
                Alert.alert('Rendez-vous', 'Votre rendez-vous a été pris en compte. Vous recevrez une confirmation bientôt.');
              }}
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
      
      {/* Carte ou indicateur de chargement */}
      {isLoading ? (
        <View style={{ height: 500, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3a86ff" />
          <Text style={{ marginTop: 10 }}>Chargement de la carte...</Text>
        </View>
      ) : position ? (
        <>
          {/* Carte avec une hauteur fixe */}
          <View style={{ height: 500, position: 'relative' }}>
            <MapView
              style={{ flex: 1 }}
              styleURL={'mapbox://styles/mapbox/streets-v12'}
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
              
              {/* Marqueur de position utilisateur */}
              <MarkerView coordinate={[position.longitude, position.latitude]}>
                <View style={styles.userMarker} />
              </MarkerView>

              {/* Itinéraire */}
              {route && (
                <Mapbox.ShapeSource id="routeSource" shape={route}>
                  <Mapbox.LineLayer
                    id="routeLayer"
                    style={{
                      lineColor: '#3a86ff',
                      lineWidth: 4,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                </Mapbox.ShapeSource>
              )}

              {/* Marqueurs d'hôpitaux */}
              {hospitals.map((hospital) => (
                <MarkerView 
                  key={hospital.id} 
                  coordinate={[hospital.longitude, hospital.latitude]}
                >
                  <TouchableOpacity
                    onPress={() => handleHospitalPress(hospital)}
                    accessibilityLabel={`Marqueur de l'hôpital ${hospital.name}`}
                    accessibilityRole="button"
                  >
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

            {/* Boutons de contrôle */}
            <TouchableOpacity 
              style={styles.targetButton} 
              onPress={centerOnUser}
              accessibilityLabel="Centrer sur ma position"
              accessibilityRole="button"
            >
              <Image source={require('../assets/images/target.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.hospitalButton} 
              onPress={goToNextHospital}
              accessibilityLabel="Prochain hôpital"
              accessibilityRole="button"
              accessibilityHint="Parcourir les hôpitaux proches"
            >
              <Image source={require('../assets/images/hosto.png')} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          </View>

          {/* Liste des hôpitaux */}
          <ScrollView 
            ref={scrollViewRef}
            style={{ padding: 15 }}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.sectionTitle}>Hôpitaux à proximité</Text>
            <FlatList
              data={hospitals}
              keyExtractor={(item) => item.id}
              renderItem={renderHospitalItem}
              scrollEnabled={false} // Désactive le scroll interne
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          </ScrollView>

          {/* Modal de consultation */}
          {renderConsultationModal()}
        </>
      ) : (
        <View style={{ height: 500, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3a86ff" />
          <Text style={{ marginTop: 10 }}>Impossible d'obtenir votre position</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={getPosition}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}
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
    height: 20,
    width: 20,
    backgroundColor: '#3a86ff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  hospitalMarker: {
    height: 30,
    width: 30,
    backgroundColor: 'red',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  selectedHospitalMarker: {
    backgroundColor: '#3a86ff',
    transform: [{ scale: 1.2 }],
  },
  
  markerText: {
    color: 'white',
    fontSize: 8,
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
});
export default ConsultationScreen;