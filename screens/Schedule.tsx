import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert,
  Linking,
  Share,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const PlanningScreen = ({ navigation }) => {
  const [selectedDates, setSelectedDates] = useState({});
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  // Format de base pour les dates sélectionnées
  const today = new Date().toISOString().split('T')[0];
  const initialSelectedDates = { [today]: { selected: true, selectedColor: '#4A90E2' } };

  // Récupérer les hôpitaux de l'admin
  useEffect(() => {
    const fetchHospitals = async () => {
      const adminId = auth().currentUser?.uid;
      if (!adminId) return;

      setLoading(true);
      const unsubscribe = firestore()
        .collection('hospitals')
        .where('adminId', '==', adminId)
        .onSnapshot(snapshot => {
          const hospitalsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setHospitals(hospitalsList);
          setLoading(false);
        }, error => {
          console.error(error);
          setLoading(false);
        });

      return () => unsubscribe();
    };

    fetchHospitals();
  }, []);

  // Récupérer les médecins quand un hôpital est sélectionné
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedHospital) return;

      setLoading(true);
      const unsubscribe = firestore()
        .collection('hospitals')
        .doc(selectedHospital)
        .onSnapshot(hospitalDoc => {
          const doctorsIds = hospitalDoc.data()?.medecins || [];
          
          if (doctorsIds.length === 0) {
            setDoctors([]);
            setLoading(false);
            return;
          }

          const doctorsQuery = firestore()
            .collection('medecins')
            .where(firestore.FieldPath.documentId(), 'in', doctorsIds);

          doctorsQuery.onSnapshot(doctorsSnapshot => {
            const doctorsList = doctorsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setDoctors(doctorsList);
            setLoading(false);
          });
        });

      return () => unsubscribe();
    };

    fetchDoctors();
  }, [selectedHospital]);

  // Récupérer les créneaux en temps réel
  useEffect(() => {
    if (!selectedDoctor) return;

    setLoading(true);
    const unsubscribe = firestore()
      .collection('plannings')
      .where('doctorId', '==', selectedDoctor)
      .onSnapshot(snapshot => {
        const slots = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTimeSlots(slots);
        setLoading(false);
      }, error => {
        console.error(error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [selectedDoctor]);

  // Gestion de la sélection des dates
  const handleDayPress = (day) => {
    const newSelectedDates = { ...selectedDates };
    
    if (newSelectedDates[day.dateString]) {
      delete newSelectedDates[day.dateString];
    } else {
      newSelectedDates[day.dateString] = { 
        selected: true, 
        selectedColor: '#4A90E2',
        selectedTextColor: 'white'
      };
    }

    setSelectedDates(newSelectedDates);
  };

  // Génération des plages horaires
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 7; // 7h
    const endHour = 21;  // 21h
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          id: `${hour}${minute}`,
        });
      }
    }
    return slots;
  };

  // Vérifie si un créneau est réservé
  const isSlotBooked = (time) => {
    return Object.keys(selectedDates).some(date => 
      timeSlots.some(slot => 
        slot.date === date && slot.time === time && slot.doctorId === selectedDoctor
      )
    );
  };

  // Gestion de la sélection de plage horaire
  const handleTimeSlotPress = (time) => {
    if (!selectedDoctor || Object.keys(selectedDates).length === 0) {
      Alert.alert('Information', 'Veuillez sélectionner un médecin et au moins un jour');
      return;
    }

    setSelectedTimeRange(time);
    showTimeSlotActions(time);
  };

  // Actions disponibles pour un créneau
  const showTimeSlotActions = (time) => {
    const isBooked = isSlotBooked(time);
    const actionTitle = isBooked ? 'Libérer le créneau' : 'Réserver le créneau';
    const daysCount = Object.keys(selectedDates).length;

    Alert.alert(
      'Gestion des créneaux',
      `${actionTitle} pour ${time} sur ${daysCount} jour(s) sélectionné(s)`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: isBooked ? 'Libérer' : 'Réserver',
          onPress: () => isBooked ? freeTimeSlot(time) : bookTimeSlot(time),
        },
      ],
    );
  };

  // Réservation des créneaux
  const bookTimeSlot = async (time) => {
    try {
      const batch = firestore().batch();
      const planningsRef = firestore().collection('plannings');

      Object.keys(selectedDates).forEach(date => {
        const docRef = planningsRef.doc();
        batch.set(docRef, {
          doctorId: selectedDoctor,
          date,
          time,
          status: 'reserved',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      Alert.alert('Succès', `Créneau ${time} réservé avec succès`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de réserver ce créneau');
    }
  };

  // Libération des créneaux
  const freeTimeSlot = async (time) => {
    try {
      const batch = firestore().batch();
      const slotsToDelete = timeSlots.filter(slot => 
        Object.keys(selectedDates).includes(slot.date) && 
        slot.time === time && 
        slot.doctorId === selectedDoctor
      );

      slotsToDelete.forEach(slot => {
        batch.delete(firestore().collection('plannings').doc(slot.id));
      });

      await batch.commit();
      Alert.alert('Succès', `Créneau ${time} libéré avec succès`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de libérer ce créneau');
    }
  };

  // Générer l'emploi du temps formaté
  const generateScheduleTable = () => {
    const hospital = hospitals.find(h => h.id === selectedHospital);
    const doctor = doctors.find(d => d.id === selectedDoctor);
    const selectedDatesList = Object.keys(selectedDates).sort();
    
    if (!hospital || !doctor || selectedDatesList.length === 0) {
      return null;
    }

    // Grouper les créneaux par date
    const scheduleByDate = {};
    selectedDatesList.forEach(date => {
      scheduleByDate[date] = timeSlots
        .filter(slot => slot.date === date && slot.doctorId === selectedDoctor)
        .map(slot => slot.time)
        .sort();
    });

    // Créer le tableau formaté
    let scheduleText = `🏥 PLANNING - ${hospital.name}\n`;
    scheduleText += `👨‍⚕️ Dr. ${doctor.prenom} ${doctor.nom}\n`;
    scheduleText += `🔬 ${doctor.specialty || 'Médecine Générale'}\n`;
    scheduleText += `📞 ${hospital.phone || 'N/A'}\n`;
    scheduleText += `📍 ${hospital.address || 'N/A'}\n\n`;
    
    scheduleText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    scheduleText += `📅 CRÉNEAUX DISPONIBLES\n`;
    scheduleText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    selectedDatesList.forEach(date => {
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long' });
      const formattedDate = dateObj.toLocaleDateString('fr-FR');
      
      scheduleText += `📆 ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${formattedDate}\n`;
      
      const daySlots = scheduleByDate[date];
      if (daySlots.length > 0) {
        // Grouper les créneaux par plages continues
        const groupedSlots = [];
        let currentGroup = [daySlots[0]];
        
        for (let i = 1; i < daySlots.length; i++) {
          const prevTime = daySlots[i-1];
          const currTime = daySlots[i];
          
          const prevMinutes = parseInt(prevTime.split(':')[0]) * 60 + parseInt(prevTime.split(':')[1]);
          const currMinutes = parseInt(currTime.split(':')[0]) * 60 + parseInt(currTime.split(':')[1]);
          
          if (currMinutes - prevMinutes === 30) {
            currentGroup.push(currTime);
          } else {
            groupedSlots.push(currentGroup);
            currentGroup = [currTime];
          }
        }
        groupedSlots.push(currentGroup);
        
        groupedSlots.forEach(group => {
          if (group.length === 1) {
            scheduleText += `   ⏰ ${group[0]}\n`;
          } else {
            scheduleText += `   ⏰ ${group[0]} - ${group[group.length - 1]}\n`;
          }
        });
      } else {
        scheduleText += `   ❌ Aucun créneau disponible\n`;
      }
      scheduleText += '\n';
    });

    scheduleText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    scheduleText += `ℹ️ Pour prendre rendez-vous, contactez-nous :\n`;
    scheduleText += `📞 ${hospital.phone || 'Appelez l\'hôpital'}\n`;
    scheduleText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    return scheduleText;
  };

  // Partager sur WhatsApp
  const shareOnWhatsApp = async () => {
    const scheduleText = generateScheduleTable();
    
    if (!scheduleText) {
      Alert.alert('Erreur', 'Veuillez sélectionner un hôpital, un médecin et au moins une date');
      return;
    }

    try {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(scheduleText)}`;
      const supported = await Linking.canOpenURL(whatsappUrl);
      
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback vers le partage natif
        await Share.share({
          message: scheduleText,
          title: 'Planning Médical',
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le planning');
    }
  };

  // Partager via d'autres moyens
  const shareSchedule = async () => {
    const scheduleText = generateScheduleTable();
    
    if (!scheduleText) {
      Alert.alert('Erreur', 'Veuillez sélectionner un hôpital, un médecin et au moins une date');
      return;
    }

    try {
      await Share.share({
        message: scheduleText,
        title: 'Planning Médical',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le planning');
    }
  };

  // Affichage d'un créneau horaire
  const renderTimeSlot = ({ item }) => {
    const isBooked = isSlotBooked(item.time);
    const isSelected = selectedTimeRange === item.time;

    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          isBooked && styles.bookedSlot,
          isSelected && styles.selectedSlot,
        ]}
        onPress={() => handleTimeSlotPress(item.time)}
      >
        <Text style={[
          styles.timeSlotText,
          isBooked && styles.bookedSlotText,
        ]}>
          {item.time}
        </Text>
        {isBooked && <Icon name="checkmark-circle" size={16} color="white" />}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header amélioré */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="calendar" size={24} color="#4A90E2" />
          <Text style={styles.title}>Gestion des Plannings</Text>
        </View>
        
        {/* Boutons d'action */}
        {selectedHospital && selectedDoctor && Object.keys(selectedDates).length > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.whatsappButton} onPress={shareOnWhatsApp}>
              <Icon name="logo-whatsapp" size={20} color="white" />
              <Text style={styles.buttonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={shareSchedule}>
              <Icon name="share" size={20} color="white" />
              <Text style={styles.buttonText}>Partager</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filtres améliorés */}
      <View style={styles.filterContainer}>
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Icon name="business" size={20} color="#4A90E2" />
            <Text style={styles.filterLabel}>Hôpital</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {hospitals.map(hospital => (
              <TouchableOpacity
                key={hospital.id}
                style={[
                  styles.filterChip,
                  selectedHospital === hospital.id && styles.selectedChip,
                ]}
                onPress={() => {
                  setSelectedHospital(hospital.id);
                  setSelectedDoctor(null);
                  setSelectedDates(initialSelectedDates);
                }}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedHospital === hospital.id && styles.selectedChipText
                ]}>
                  {hospital.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedHospital && doctors.length > 0 && (
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Icon name="person" size={20} color="#4A90E2" />
              <Text style={styles.filterLabel}>Médecin</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {doctors.map(doctor => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.filterChip,
                    selectedDoctor === doctor.id && styles.selectedChip,
                  ]}
                  onPress={() => {
                    setSelectedDoctor(doctor.id);
                    setSelectedDates(initialSelectedDates);
                  }}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedDoctor === doctor.id && styles.selectedChipText
                  ]}>
                    Dr. {doctor.prenom} {doctor.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Calendrier amélioré */}
      <View style={styles.calendarSection}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-outline" size={20} color="#4A90E2" />
          <Text style={styles.sectionTitle}>Sélection des dates</Text>
        </View>
        
        <View style={styles.calendarContainer}>
          <Calendar
            current={today}
            onDayPress={handleDayPress}
            markedDates={{
              ...selectedDates,
              [today]: { 
                ...selectedDates[today],
                today: true,
                selected: selectedDates[today]?.selected || false,
              }
            }}
            minDate={today}
            theme={{
              calendarBackground: '#fff',
              selectedDayBackgroundColor: '#4A90E2',
              selectedDayTextColor: '#fff',
              todayTextColor: '#4A90E2',
              dayTextColor: '#333',
              textDisabledColor: '#ccc',
              monthTextColor: '#333',
              arrowColor: '#4A90E2',
              selectedDotColor: '#fff',
              textDayFontWeight: '500',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
            }}
          />
          
          {Object.keys(selectedDates).length > 0 && (
            <View style={styles.selectedDatesInfo}>
              <Icon name="checkmark-circle" size={16} color="#4A90E2" />
              <Text style={styles.selectedDatesText}>
                {Object.keys(selectedDates).length} jour(s) sélectionné(s)
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Informations détaillées */}
      {selectedHospital && (
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="business" size={20} color="#4A90E2" />
            <Text style={styles.cardTitle}>Détails de l'Hôpital</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.hospitalName}>
              {hospitals.find(h => h.id === selectedHospital)?.name}
            </Text>
            
            <View style={styles.infoRow}>
              <Icon name="location" size={16} color="#666" />
              <Text style={styles.infoText}>
                {hospitals.find(h => h.id === selectedHospital)?.address || 'Non spécifiée'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="call" size={16} color="#666" />
              <Text style={styles.infoText}>
                {hospitals.find(h => h.id === selectedHospital)?.phone || 'Non spécifié'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {selectedDoctor && (
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={20} color="#4A90E2" />
            <Text style={styles.cardTitle}>Détails du Médecin</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.doctorName}>
              Dr. {doctors.find(d => d.id === selectedDoctor)?.prenom} {doctors.find(d => d.id === selectedDoctor)?.nom}
            </Text>
            
            <View style={styles.infoRow}>
              <Icon name="medical" size={16} color="#666" />
              <Text style={styles.infoText}>
                {doctors.find(d => d.id === selectedDoctor)?.specialty || 'Médecine Générale'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="call" size={16} color="#666" />
              <Text style={styles.infoText}>
                {doctors.find(d => d.id === selectedDoctor)?.phone || 'Non spécifié'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Créneaux horaires améliorés */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Chargement des créneaux...</Text>
        </View>
      ) : selectedDoctor ? (
        <View style={styles.timeSlotsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="time" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Créneaux horaires</Text>
          </View>
          
          <View style={styles.timeSlotsContainer}>
            <FlatList
              data={generateTimeSlots()}
              renderItem={renderTimeSlot}
              keyExtractor={item => item.id}
              numColumns={4}
              contentContainerStyle={styles.timeSlotsGrid}
              columnWrapperStyle={styles.timeSlotsRow}
              scrollEnabled={false}
            />
          </View>
          
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f0f0f0' }]} />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4A90E2' }]} />
              <Text style={styles.legendText}>Réservé</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="calendar" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>
            {selectedHospital 
              ? "Sélectionnez un médecin" 
              : "Sélectionnez un hôpital"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedHospital 
              ? "Choisissez un médecin pour voir son planning" 
              : "Commencez par sélectionner un hôpital"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  shareButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 10,
  },
  selectedChip: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterChipText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#fff',
  },
  calendarSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  calendarContainer: {
    paddingBottom: 16,
  },
  selectedDatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  selectedDatesText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  timeSlotsSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  timeSlotsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timeSlotsGrid: {
    paddingBottom: 10,
  },
  timeSlotsRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeSlot: {
    width: (width - 80) / 4,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bookedSlot: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  selectedSlot: {
    borderWidth: 2,
    borderColor: '#007bff',
    backgroundColor: '#e7f1ff',
  },
  timeSlotText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '500',
  },
  bookedSlotText: {
    color: '#fff',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  
});

export default PlanningScreen;