import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export default function HistoriqueConsultationsScreen({ navigation }) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setConsultations([]);
      setLoading(false);
      return;
    }
    const unsubscribe = firestore()
      .collection('consultations')
      .where('patientId', '==', user.uid)
      .onSnapshot(snap => {
        if (!snap || !snap.docs) {
          setConsultations([]);
          setLoading(false);
          return;
        }
        setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingGradient}>
          <ActivityIndicator size="large" color="#09d1a0" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: 'checkmark-circle',
          color: '#00b894',
          text: 'Confirmé',
          bgColor: '#e8f5f0'
        };
      case 'pending':
        return {
          icon: 'time',
          color: '#fdcb6e',
          text: 'En attente',
          bgColor: '#fef7e8'
        };
      default:
        return {
          icon: 'close-circle',
          color: '#e17055',
          text: 'Annulé',
          bgColor: '#fceaea'
        };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Consultations</Text>
        <Text style={styles.subtitle}>
          {consultations.length} consultation{consultations.length > 1 ? 's' : ''}
        </Text>
      </View>
      
      <FlatList
        data={consultations}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const statusConfig = getStatusConfig(item.status);
          
          return (
            <TouchableOpacity
              style={[styles.card, { shadowColor: statusConfig.color }]}
              onPress={() => navigation.navigate('ConsultationDetail', { consultation: item })}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Icon
                    name={statusConfig.icon}
                    size={16}
                    color={statusConfig.color}
                  />
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.text}
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardContent}>
                <View style={styles.doctorInfo}>
                  <Icon name="person" size={20} color="#09d1a0" />
                  <Text style={styles.doctor}>{item.doctorName}</Text>
                </View>
                
                <View style={styles.hospitalInfo}>
                  <Icon name="business" size={18} color="#636e72" />
                  <Text style={styles.hospital}>{item.hospitalName}</Text>
                </View>
                
                <View style={styles.dateTimeInfo}>
                  <Icon name="calendar" size={18} color="#636e72" />
                  <Text style={styles.date}>{item.date}</Text>
                  <View style={styles.timeContainer}>
                    <Icon name="time" size={16} color="#636e72" />
                    <Text style={styles.time}>{item.heureDebut} - {item.heureFin}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.arrowContainer}>
                <Icon name="chevron-forward" size={20} color="#ddd" />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>Aucune consultation</Text>
            <Text style={styles.emptySubtitle}>
              Vos rendez-vous apparaîtront ici
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingGradient: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#09d1a0',
  },
  
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    fontFamily: 'UbuntuMono-Bold'
  },
  
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    backgroundColor: '#09d1a0',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'UbuntuMono-Bold',
    marginBottom: 5,
  },
  
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'UbuntuMono-Regular'
  },
  
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'UbuntuMono-Bold'
  },
  
  cardContent: {
    marginBottom: 10,
  },
  
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  doctor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginLeft: 12,
    fontFamily: 'UbuntuMono-Bold'
  },
  
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  hospital: {
    fontSize: 15,
    color: '#636e72',
    marginLeft: 10,
    fontFamily: 'UbuntuMono-Regular'
  },
  
  dateTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  date: {
    fontSize: 14,
    color: '#636e72',
    marginLeft: 10,
    fontFamily: 'UbuntuMono-Regular',
    flex: 1,
  },
  
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  time: {
    fontSize: 14,
    color: '#636e72',
    marginLeft: 6,
    fontFamily: 'UbuntuMono-Regular'
  },
  
  arrowContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#636e72',
    marginTop: 20,
    fontFamily: 'UbuntuMono-Bold'
  },
  
  emptySubtitle: {
    fontSize: 16,
    color: '#b2bec3',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'UbuntuMono-Regular'
  },
});