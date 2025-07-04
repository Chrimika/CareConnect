import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [planningMode, setPlanningMode] = useState('simple');
  const [customTimeSlot, setCustomTimeSlot] = useState({ start: '', end: '' });
  const [weeklyView, setWeeklyView] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

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

  // Génération des plages horaires prédéfinies
  const generateTimeSlots = () => {
    const slots = [];
    const intervals = [
      { start: '08:00', end: '12:00', label: 'Matin' },
      { start: '14:00', end: '18:00', label: 'Après-midi' },
      { start: '18:00', end: '22:00', label: 'Soir' },
      { start: '22:00', end: '06:00', label: 'Nuit' }
    ];

    intervals.forEach(interval => {
      slots.push({
        id: interval.label.toLowerCase(),
        time: `${interval.start} - ${interval.end}`,
        label: interval.label,
        start: interval.start,
        end: interval.end
      });
    });

    return slots;
  };

  // Génération des créneaux horaires détaillés (30 min)
  const generateDetailedTimeSlots = () => {
    const slots = [];
    const startHour = 6;
    const endHour = 23;
    const interval = 30;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour && minute > 0) break;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endMinute = minute + interval;
        const endTime = endMinute >= 60 
          ? `${(hour + 1).toString().padStart(2, '0')}:00`
          : `${hour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          time: `${time} - ${endTime}`,
          id: `${hour}${minute}`,
          start: time,
          end: endTime
        });
      }
    }
    return slots;
  };

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

  // Vérifie si un créneau est assigné
  const isSlotAssigned = (timeSlot) => {
    return timeSlots.some(slot => 
      Object.keys(selectedDates).includes(slot.date) && 
      slot.timeSlot === timeSlot.id && 
      slot.doctorId === selectedDoctor
    );
  };

  // Gestion de l'assignation de créneaux
  const handleTimeSlotPress = (timeSlot) => {
    if (!selectedDoctor || Object.keys(selectedDates).length === 0) {
      Alert.alert('Information', 'Veuillez sélectionner un médecin et au moins un jour');
      return;
    }

    const isAssigned = isSlotAssigned(timeSlot);
    const actionTitle = isAssigned ? 'Retirer l\'assignation' : 'Assigner le créneau';
    const daysCount = Object.keys(selectedDates).length;

    Alert.alert(
      'Gestion des assignations',
      `${actionTitle} "${timeSlot.label || timeSlot.time}" pour Dr. ${doctors.find(d => d.id === selectedDoctor)?.prenom} ${doctors.find(d => d.id === selectedDoctor)?.nom} sur ${daysCount} jour(s)`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: isAssigned ? 'Retirer' : 'Assigner',
          onPress: () => isAssigned ? removeAssignment(timeSlot) : assignTimeSlot(timeSlot),
        },
      ],
    );
  };

  // Assignation des créneaux
  const assignTimeSlot = async (timeSlot) => {
    try {
      const batch = firestore().batch();
      const planningsRef = firestore().collection('plannings');

      Object.keys(selectedDates).forEach(date => {
        const docRef = planningsRef.doc();
        batch.set(docRef, {
          doctorId: selectedDoctor,
          hospitalId: selectedHospital,
          date,
          timeSlot: timeSlot.id,
          timeRange: timeSlot.time,
          label: timeSlot.label,
          status: 'assigned',
          createdAt: firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();
      Alert.alert('Succès', `Créneau "${timeSlot.label || timeSlot.time}" assigné avec succès`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'assigner ce créneau');
    }
  };

  // Suppression des assignations
  const removeAssignment = async (timeSlot) => {
    try {
      const batch = firestore().batch();
      const slotsToDelete = timeSlots.filter(slot => 
        Object.keys(selectedDates).includes(slot.date) && 
        slot.timeSlot === timeSlot.id && 
        slot.doctorId === selectedDoctor
      );

      slotsToDelete.forEach(slot => {
        batch.delete(firestore().collection('plannings').doc(slot.id));
      });

      await batch.commit();
      Alert.alert('Succès', `Assignation "${timeSlot.label || timeSlot.time}" supprimée`);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer cette assignation');
    }
  };

  // Ajout de créneau personnalisé
  const addCustomTimeSlot = () => {
    if (!customTimeSlot.start || !customTimeSlot.end) {
      Alert.alert('Erreur', 'Veuillez renseigner l\'heure de début et de fin');
      return;
    }

    const newSlot = {
      id: `custom_${customTimeSlot.start}_${customTimeSlot.end}`,
      time: `${customTimeSlot.start} - ${customTimeSlot.end}`,
      start: customTimeSlot.start,
      end: customTimeSlot.end,
      label: `Personnalisé ${customTimeSlot.start}-${customTimeSlot.end}`
    };

    handleTimeSlotPress(newSlot);
    setCustomTimeSlot({ start: '', end: '' });
    setModalVisible(false);
  };

  // Export du planning
  const exportPlanning = () => {
    if (!selectedHospital) {
      Alert.alert('Erreur', 'Veuillez sélectionner un hôpital');
      return;
    }

    const hospitalData = hospitals.find(h => h.id === selectedHospital);
    const hospitalSlots = timeSlots.filter(slot => slot.hospitalId === selectedHospital);
    
    Alert.alert(
      'Export Planning',
      `Planning de ${hospitalData.name} prêt à être exporté.\n\n${hospitalSlots.length} créneaux assignés`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Exporter PDF', onPress: () => exportToPDF(hospitalData, hospitalSlots) },
        { text: 'Exporter Excel', onPress: () => exportToExcel(hospitalData, hospitalSlots) }
      ]
    );
  };

  const exportToPDF = (hospital, slots) => {
    Alert.alert('Export PDF', 'Fonctionnalité à implémenter avec react-native-pdf ou similaire');
  };

  const exportToExcel = (hospital, slots) => {
    Alert.alert('Export Excel', 'Fonctionnalité à implémenter avec xlsx ou similaire');
  };

  // Vue hebdomadaire
  const getWeeklyView = () => {
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const slots = planningMode === 'simple' ? generateTimeSlots() : generateDetailedTimeSlots();
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weeklyContainer}>
          <View style={styles.weeklyHeader}>
            <View style={styles.timeColumn}>
              <Text style={styles.weeklyHeaderText}>Créneaux</Text>
            </View>
            {days.map(day => (
              <View key={day} style={styles.dayColumn}>
                <Text style={styles.weeklyHeaderText}>{day}</Text>
              </View>
            ))}
          </View>
          
          {slots.map(slot => (
            <View key={slot.id} style={styles.weeklyRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.slotTimeText}>{slot.label || slot.time}</Text>
              </View>
              {days.map(day => {
                const daySlots = timeSlots.filter(ts => 
                  ts.timeSlot === slot.id && 
                  ts.hospitalId === selectedHospital
                );
                return (
                  <View key={day} style={styles.dayColumn}>
                    {daySlots.map(daySlot => {
                      const doctor = doctors.find(d => d.id === daySlot.doctorId);
                      return doctor ? (
                        <Text key={daySlot.id} style={styles.assignedDoctorText}>
                          Dr. {doctor.prenom} {doctor.nom}
                        </Text>
                      ) : null;
                    })}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Affichage d'un créneau horaire
  const renderTimeSlot = ({ item }) => {
    const isAssigned = isSlotAssigned(item);
    const isSelected = selectedTimeRange === item.time;

    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          isAssigned && styles.assignedSlot,
          isSelected && styles.selectedSlot,
        ]}
        onPress={() => handleTimeSlotPress(item)}
      >
        <Text style={[
          styles.timeSlotText,
          isAssigned && styles.assignedSlotText,
        ]}>
          {item.label || item.time}
        </Text>
        {isAssigned && <Icon name="person" size={16} color="white" />}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header avec options */}
      <View style={styles.header}>
        <Text style={styles.title}>Gestion des Plannings</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setWeeklyView(!weeklyView)}
          >
            <Icon name={weeklyView ? "calendar" : "grid"} size={20} color="#09d1a0" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setExportModalVisible(true)}
          >
            <Icon name="download" size={20} color="#09d1a0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode de planification */}
      <View style={styles.modeContainer}>
        <Text style={styles.modeLabel}>Mode de planification :</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[styles.modeButton, planningMode === 'simple' && styles.selectedMode]}
            onPress={() => setPlanningMode('simple')}
          >
            <Text style={planningMode === 'simple' ? styles.selectedModeText : styles.modeText}>
              Plages (Matin/Soir)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, planningMode === 'advanced' && styles.selectedMode]}
            onPress={() => setPlanningMode('advanced')}
          >
            <Text style={planningMode === 'advanced' ? styles.selectedModeText : styles.modeText}>
              Créneaux détaillés
            </Text>
          </TouchableOpacity>
        </View>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#09d1a0" />
        </View>
      ) : weeklyView && selectedHospital ? (
        /* Vue hebdomadaire */
        <View style={styles.weeklyViewContainer}>
          <Text style={styles.sectionTitle}>Planning Hebdomadaire</Text>
          {getWeeklyView()}
        </View>
      ) : (
        <>
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
              theme={{
                calendarBackground: '#fff',
                selectedDayBackgroundColor: '#09d1a0',
                selectedDayTextColor: '#fff',
                todayTextColor: '#09d1a0',
                dayTextColor: '#333',
                textDisabledColor: '#ccc',
                monthTextColor: '#333',
                arrowColor: '#09d1a0',
              }}
            />
            <Text style={styles.selectedDatesInfo}>
              {Object.keys(selectedDates).length} jour(s) sélectionné(s)
            </Text>
          </View>

          {/* Créneaux horaires */}
          {selectedDoctor ? (
            <View style={styles.timeSlotsWrapper}>
              <View style={styles.timeSlotsHeader}>
                <Text style={styles.timeSlotsTitle}>
                  {planningMode === 'simple' ? 'Plages horaires' : 'Créneaux détaillés'}
                </Text>
                <TouchableOpacity
                  style={styles.addCustomButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Icon name="add" size={20} color="#09d1a0" />
                  <Text style={styles.addCustomText}>Personnalisé</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={planningMode === 'simple' ? generateTimeSlots() : generateDetailedTimeSlots()}
                renderItem={renderTimeSlot}
                keyExtractor={item => item.id}
                numColumns={planningMode === 'simple' ? 2 : 3}
                contentContainerStyle={styles.timeSlotsContainer}
                columnWrapperStyle={planningMode === 'simple' ? styles.timeSlotsColumnSimple : styles.timeSlotsColumn}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="calendar" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {selectedHospital 
                  ? "Sélectionnez un médecin pour gérer son planning" 
                  : "Sélectionnez un hôpital pour commencer"}
              </Text>
            </View>
          )}
        </>
      )}

      {/* Modal pour créneau personnalisé */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créneau personnalisé</Text>
            
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Heure de début :</Text>
              <TextInput
                style={styles.timeInput}
                value={customTimeSlot.start}
                onChangeText={(text) => setCustomTimeSlot(prev => ({ ...prev, start: text }))}
                placeholder="08:00"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.timeInputContainer}>
              <Text style={styles.timeInputLabel}>Heure de fin :</Text>
              <TextInput
                style={styles.timeInput}
                value={customTimeSlot.end}
                onChangeText={(text) => setCustomTimeSlot(prev => ({ ...prev, end: text }))}
                placeholder="12:00"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={addCustomTimeSlot}
              >
                <Text style={styles.modalConfirmText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal d'export */}
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exporter le planning</Text>
            
            <TouchableOpacity style={styles.exportOption} onPress={exportPlanning}>
              <Icon name="document-text" size={24} color="#09d1a0" />
              <Text style={styles.exportOptionText}>Exporter en PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} onPress={exportPlanning}>
              <Icon name="grid" size={24} color="#09d1a0" />
              <Text style={styles.exportOptionText}>Exporter en Excel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption}>
              <Icon name="share" size={24} color="#09d1a0" />
              <Text style={styles.exportOptionText}>Partager par email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setExportModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  modeContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  modeButtons: {
    flexDirection: 'row',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  selectedMode: {
    backgroundColor: '#09d1a0',
    borderColor: '#09d1a0',
  },
  modeText: {
    color: '#666',
  },
  selectedModeText: {
    color: '#fff',
    fontWeight: '500',
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
  timeSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#09d1a0',
  },
  addCustomText: {
    color: '#09d1a0',
    marginLeft: 4,
    fontSize: 12,
  },
  timeSlotsContainer: {
    paddingBottom: 20,
  },
  timeSlotsColumn: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeSlotsColumnSimple: {
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  timeSlot: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    minHeight: 60,
  },
  assignedSlot: {
    backgroundColor: '#09d1a0',
  },
  selectedSlot: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  timeSlotText: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
  },
  assignedSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  weeklyViewContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
  },
  weeklyContainer: {
    minWidth: 800,
  },
  weeklyHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#09d1a0',
    paddingBottom: 8,
    marginBottom: 8,
  },
  weeklyHeaderText: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  weeklyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  timeColumn: {
    width: 120,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dayColumn: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  slotTimeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  assignedDoctorText: {
    fontSize: 10,
    color: '#09d1a0',
    textAlign: 'center',
    backgroundColor: '#e8f5e8',
    padding: 2,
    borderRadius: 4,
    marginVertical: 1,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeInputContainer: {
    marginBottom: 15,
  },
  timeInputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#09d1a0',
    marginLeft: 8,
  },
  modalCancelText: {
    textAlign: 'center',
    color: '#666',
  },
  modalConfirmText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exportOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});

export default PlanningScreen;