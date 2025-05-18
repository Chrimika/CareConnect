import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

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
  const initialSelectedDates = { [today]: { selected: true, selectedColor: '#09d1a0' } };

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
        selectedColor: '#09d1a0',
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
        {isBooked && <Icon name="checkmark" size={16} color="white" />}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Plannings</Text>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <View style={styles.dropdown}>
          <Text style={styles.dropdownLabel}>Hôpital</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {hospitals.map(hospital => (
              <TouchableOpacity
                key={hospital.id}
                style={[
                  styles.filterButton,
                  selectedHospital === hospital.id && styles.selectedFilter,
                ]}
                onPress={() => {
                  setSelectedHospital(hospital.id);
                  setSelectedDoctor(null);
                  setSelectedDates(initialSelectedDates);
                }}
              >
                <Text style={selectedHospital === hospital.id ? styles.selectedFilterText : styles.filterText}>
                  {hospital.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedHospital && (
          <View style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>Médecin</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {doctors.map(doctor => (
                <TouchableOpacity
                  key={doctor.id}
                  style={[
                    styles.filterButton,
                    selectedDoctor === doctor.id && styles.selectedFilter,
                  ]}
                  onPress={() => {
                    setSelectedDoctor(doctor.id);
                    setSelectedDates(initialSelectedDates);
                  }}
                >
                  <Text style={selectedDoctor === doctor.id ? styles.selectedFilterText : styles.filterText}>
                    Dr. {doctor.prenom} {doctor.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Calendrier avec multi-sélection */}
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
          enableMultiSelect={true}
          theme={{
            calendarBackground: '#fff',
            selectedDayBackgroundColor: '#09d1a0',
            selectedDayTextColor: '#fff',
            todayTextColor: '#09d1a0',
            dayTextColor: '#333',
            textDisabledColor: '#ccc',
            monthTextColor: '#333',
            arrowColor: '#09d1a0',
            selectedDotColor: '#fff',
          }}
        />
        <Text style={styles.selectedDatesInfo}>
          {Object.keys(selectedDates).length} jour(s) sélectionné(s)
        </Text>
      </View>

      {/* Créneaux horaires */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#09d1a0" />
        </View>
      ) : selectedDoctor ? (
        <View style={styles.timeSlotsWrapper}>
          <Text style={styles.timeSlotsTitle}>Plages horaires disponibles</Text>
          <FlatList
            data={generateTimeSlots()}
            renderItem={renderTimeSlot}
            keyExtractor={item => item.id}
            numColumns={4}
            contentContainerStyle={styles.timeSlotsContainer}
            columnWrapperStyle={styles.timeSlotsColumn}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="calendar" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            {selectedHospital 
              ? "Sélectionnez un médecin pour voir son planning" 
              : "Sélectionnez un hôpital pour commencer"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdown: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedFilter: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  filterText: {
    color: '#666',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 10,
  },
  selectedDatesInfo: {
    textAlign: 'center',
    color: '#09d1a0',
    fontWeight: '500',
    marginTop: 8,
  },
  timeSlotsWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    marginLeft: 8,
  },
  timeSlotsContainer: {
    paddingBottom: 20,
  },
  timeSlotsColumn: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeSlot: {
    width: '23%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  bookedSlot: {
    backgroundColor: '#09d1a0',
  },
  selectedSlot: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  timeSlotText: {
    color: '#333',
    fontSize: 14,
  },
  bookedSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default PlanningScreen;