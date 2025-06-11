import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import Mapbox, { Camera, LineLayer, MapView, MarkerView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import 'moment/locale/fr';

moment.locale('fr');

// Configuration Mapbox
Mapbox.setAccessToken('pk.eyJ1IjoibWlrYS1tYmEiLCJhIjoiY21heDI1ZjlpMDFmNjJrcHJmemI1cHl1bSJ9.X0S79u0BD7Xn2WIJypQWsg');

const HospitalListScreen = ({ navigation }) => {
  const [hospitals, setHospitals] = useState([]);
  const [sortedHospitals, setSortedHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0);
  const [route, setRoute] = useState(null);
  const [distanceText, setDistanceText] = useState('');
  
  const cameraRef = useRef(null);
  const mapRef = useRef(null);

  // Récupérer la position et les hôpitaux
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get user location
        const position = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000
          });
        });
        
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        // 2. Fetch hospitals from Firestore
        const unsubscribe = firestore()
          .collection('hospitals')
          .onSnapshot(snapshot => {
            const hospitalsData = snapshot.docs.map(doc => {
              const data = doc.data();
              const location = data.location 
                ? { latitude: data.location.latitude, longitude: data.location.longitude }
                : null;
              
              return {
                id: doc.id,
                ...data,
                location,
                distance: location 
                  ? haversineDistance(latitude, longitude, location.latitude, location.longitude)
                  : null
              };
            });

            // Sort by distance
            const sorted = [...hospitalsData].sort((a, b) => a.distance - b.distance);
            setHospitals(hospitalsData);
            setSortedHospitals(sorted);
            setLoading(false);

            // Center on nearest hospital if available
            if (sorted.length > 0 && cameraRef.current) {
              centerOnHospital(sorted[0]);
            }
          });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcul de distance haversine
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Centrer sur un hôpital spécifique
  const centerOnHospital = (hospital) => {
    if (!hospital?.location || !cameraRef.current) return;
    
    cameraRef.current.setCamera({
      centerCoordinate: [hospital.location.longitude, hospital.location.latitude],
      zoomLevel: 15,
      animationMode: 'flyTo',
      animationDuration: 2000,
    });
  };

  // Obtenir l'itinéraire réel
  const getRealRoute = async (start, end) => {
    try {
      const startCoords = `${start[0]},${start[1]}`;
      const endCoords = `${end[0]},${end[1]}`;
      
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoords};${endCoords}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      
      if (response.data?.routes?.[0]) {
        return {
          route: response.data.routes[0].geometry,
          distance: response.data.routes[0].distance / 1000,
          duration: Math.ceil(response.data.routes[0].duration / 60)
        };
      }
    } catch (err) {
      console.error('Error fetching route:', err);
    }
    return null;
  };

  // Navigation vers le prochain hôpital
  const goToNextHospital = async () => {
    if (!sortedHospitals.length || !userLocation) return;
    
    const newIndex = (currentHospitalIndex + 1) % sortedHospitals.length;
    const hospital = sortedHospitals[newIndex];
    setCurrentHospitalIndex(newIndex);
    
    // Center on hospital
    centerOnHospital(hospital);
    
    // Calculate route
    if (userLocation && hospital.location) {
      const routeData = await getRealRoute(
        [userLocation.longitude, userLocation.latitude],
        [hospital.location.longitude, hospital.location.longitude]
      );
      
      if (routeData) {
        setRoute({
          type: 'Feature',
          geometry: routeData.route
        });
        setDistanceText(`${routeData.distance.toFixed(1)} km (~${routeData.duration} min)`);
      } else {
        const distance = haversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          hospital.location.latitude,
          hospital.location.longitude
        );
        setDistanceText(`${distance.toFixed(1)} km`);
      }
    }
  };

  // Recentrer sur la position utilisateur
  const centerOnUser = () => {
    if (!userLocation || !cameraRef.current) return;
    
    cameraRef.current.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: 15,
      animationMode: 'flyTo',
      animationDuration: 1000,
    });
    
    // Reset to nearest hospital
    if (sortedHospitals.length > 0) {
      setCurrentHospitalIndex(0);
    }
  };

  // Rendu d'un hôpital dans la liste
  const renderHospitalItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.hospitalCard,
        index === currentHospitalIndex && styles.selectedHospitalCard
      ]}
      onPress={() => {
        setCurrentHospitalIndex(index);
        centerOnHospital(item);
      }}
    >
      {item.logo ? (
        <Image source={{ uri: item.logo }} style={styles.hospitalLogo} />
      ) : (
        <View style={styles.hospitalLogoPlaceholder}>
          <Icon name="medical" size={24} color="#fff" />
        </View>
      )}
      
      <View style={styles.hospitalInfo}>
        <Text style={styles.hospitalName}>{item.name}</Text>
        <Text style={styles.hospitalAddress}>
          <Icon name="location" size={12} color="#666" /> {item.address}
        </Text>
        {item.distance && (
          <Text style={styles.hospitalDistance}>
            <Icon name="walk" size={12} color="#666" /> {item.distance.toFixed(1)} km
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un hôpital..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          styleURL={'mapbox://styles/mapbox/streets-v11'}
          rotateEnabled={false}
          pitchEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <Camera
            ref={cameraRef}
            zoomLevel={15}
            centerCoordinate={userLocation ? [userLocation.longitude, userLocation.latitude] : [0, 0]}
          />
          
          {/* User Location Marker */}
          {userLocation && (
            <MarkerView coordinate={[userLocation.longitude, userLocation.latitude]}>
              <View style={styles.userMarker}>
                <View style={styles.userMarkerInner} />
              </View>
            </MarkerView>
          )}
          
          {/* Hospitals Markers */}
          {sortedHospitals.map((hospital, index) => (
            hospital.location && (
              <MarkerView
                key={hospital.id}
                coordinate={[hospital.location.longitude, hospital.location.latitude]}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <TouchableOpacity onPress={() => {
                  setCurrentHospitalIndex(index);
                  navigation.navigate('HospitalDetails', { hospital });
                }}>
                  <View style={[
                    styles.hospitalMarker,
                    index === currentHospitalIndex && styles.selectedHospitalMarker
                  ]}>
                    <Icon name="medical" size={16} color="white" />
                  </View>
                </TouchableOpacity>
                
                {/* Hospital Name Label */}
                <SymbolLayer
                  id={`hospital-label-${hospital.id}`}
                  style={{
                    textField: hospital.name,
                    textSize: 12,
                    textColor: '#09d1a0',
                    textHaloColor: 'white',
                    textHaloWidth: 1,
                    textOffset: [0, 1.5],
                    textAnchor: 'top'
                  }}
                />
              </MarkerView>
            )
          ))}
          
          {/* Route Layer */}
          {route && (
            <ShapeSource id="routeSource" shape={route}>
              <LineLayer
                id="routeLayer"
                style={{
                  lineColor: '#09d1a0',
                  lineWidth: 3,
                  lineOpacity: 0.7
                }}
              />
            </ShapeSource>
          )}
        </MapView>
        
        {/* Map Controls */}
        <TouchableOpacity 
          style={[styles.mapButton, styles.targetButton]}
          onPress={centerOnUser}
        >
          <Icon name="locate" size={20} color="#09d1a0" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mapButton, styles.nextButton]}
          onPress={goToNextHospital}
        >
          <Icon name="arrow-forward" size={20} color="#09d1a0" />
        </TouchableOpacity>
        
        {distanceText && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{distanceText}</Text>
          </View>
        )}
      </View>

      {/* Hospitals List */}
      <FlatList
        data={sortedHospitals}
        renderItem={renderHospitalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucun hôpital trouvé</Text>
        }
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop:30
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  specialtiesContainer: {
    paddingVertical: 10,
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  specialtyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  selectedSpecialtyButton: {
    backgroundColor: '#09d1a0',
  },
  specialtyText: {
    color: '#666',
  },
  selectedSpecialtyText: {
    color: '#fff',
  },
  mapContainer: {
    height: 200,
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#09d1a0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#09d1a0',
  },
  hospitalMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#09d1a0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hospitalLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hospitalText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  distanceText: {
    fontSize: 14,
    color: '#09d1a0',
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  // Styles pour HospitalDetailScreen
  backButton: {
    padding: 15,
  },
  hospitalHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hospitalDetailLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  hospitalDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
    marginVertical:5
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayLabel: {
    fontSize: 16,
    color: '#333',
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
  noHoursText: {
    color: '#666',
    fontStyle: 'italic',
  },
  selectedDateText: {
    fontSize: 16,
    color: '#09d1a0',
    fontWeight: '500',
    padding: 10,
    backgroundColor: '#f0f9f7',
    borderRadius: 8,
  },
  timeSlot: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedTimeSlot: {
    backgroundColor: '#09d1a0',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
  },
  timeSlotsContainer: {
    paddingVertical: 10,
  },
  noSlotsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  bookButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#09d1a0',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#09d1a0',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
  },
  mapButton: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  targetButton: {
    bottom: 20,
    right: 20,
  },
  hospitalsButton: {
    bottom: 70,
    right: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  nextButton: {
    bottom: 70,
    right: 20,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
  },
  selectedHospitalMarker: {
    backgroundColor: '#ff6b6b',
    transform: [{ scale: 1.2 }],
    zIndex: 10,
  },
  selectedHospitalCard: {
    backgroundColor: '#f0f9f7',
  },
  hospitalLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#09d1a0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hospitalDistance: {
    fontSize: 12,
    color: '#09d1a0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  address: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  doctorCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  specialty: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  appointmentDetails: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  doctorsScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  doctorsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  doctorFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedDoctorFilter: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  doctorFilterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDoctorFilterText: {
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  slotsContainer: {
    flex: 1,
    padding: 16,
  },
  noSlotsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  doctorSlotContainer: {
    marginBottom: 24,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  doctorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#09d1a0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export { HospitalListScreen };