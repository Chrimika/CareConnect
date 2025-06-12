import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function MessagesScreen({ navigation }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatInfos, setChatInfos] = useState({});

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;
    // Récupère les médecins avec qui le patient a un rendez-vous confirmé
    const unsubscribe = firestore()
      .collection('consultations')
      .where('patientId', '==', user.uid)
      .where('status', '==', 'confirmed')
      .onSnapshot(snap => {
        const uniqueDoctors = {};
        snap.docs.forEach(doc => {
          const c = doc.data();
          if (c.doctorId && c.doctorName) {
            uniqueDoctors[c.doctorId] = {
              doctorId: c.doctorId,
              doctorName: c.doctorName,
              doctorSpecialite: c.doctorSpecialite || '',
            };
          }
        });
        const doctorIds = Object.keys(uniqueDoctors);
        setDoctors(Object.values(uniqueDoctors));
        setLoading(false);
      });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (doctors.length === 0) return;
    const fetchSpecialites = async () => {
      const doctorIds = doctors.map(d => d.doctorId);
      if (doctorIds.length === 0) return;
      // Firestore ne supporte que 10 éléments max dans un "in"
      const batchSize = 10;
      let updatedDoctors = [...doctors];
      for (let i = 0; i < doctorIds.length; i += batchSize) {
        const batchIds = doctorIds.slice(i, i + batchSize);
        const snap = await firestore()
          .collection('medecins')
          .where(firestore.FieldPath.documentId(), 'in', batchIds)
          .get();
        snap.docs.forEach(doc => {
          const idx = updatedDoctors.findIndex(d => d.doctorId === doc.id);
          if (idx !== -1) {
            updatedDoctors[idx].doctorSpecialite = doc.data().specialite || '';
          }
        });
      }
      setDoctors(updatedDoctors);
    };
    fetchSpecialites();
    // eslint-disable-next-line
  }, [doctors.length]);

  useEffect(() => {
    if (doctors.length === 0) return;
    const user = auth().currentUser;
    let unsubscribes = [];
    let infos = {};
    doctors.forEach(doc => {
      const chatId = [user.uid, doc.doctorId].sort().join('_');
      const unsub = firestore()
        .collection('PatientDoctorMessages')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .onSnapshot(snap => {
          let lastMsg = null;
          let unread = 0;
          snap.docs.forEach(d => {
            const msg = d.data();
            if (!lastMsg) lastMsg = msg;
            if (msg.to === user.uid && msg.status !== 'read') unread++;
          });
          infos[doc.doctorId] = {
            lastMsgDate: lastMsg?.timestamp?.toDate?.() || null,
            unread,
          };
          setChatInfos({ ...infos });
        });
      unsubscribes.push(unsub);
    });
    return () => unsubscribes.forEach(u => u && u());
  }, [doctors]);

  if (loading) {
    return <ActivityIndicator color="#09d1a0" style={{ marginTop: 30 }} />;
  }

  if (doctors.length === 0) {
    return (
      <View style={styles.container}>
        <Icon name="hourglass-empty" size={60} color="#999" />
        <Text style={styles.title}>Messagerie</Text>
        <Text style={styles.message}>Aucun médecin avec rendez-vous confirmé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messagerie</Text>
      <FlatList
        data={doctors}
        keyExtractor={item => item.doctorId}
        renderItem={({ item }) => {
          const info = chatInfos[item.doctorId] || {};
          return (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => navigation.navigate('Chat', { doctor: item })}
            >
              <Icon name="person" size={58} color="#09d1a0" style={{borderWidth:1,borderColor:'#eee',borderRadius:30,backgroundColor:'#f6f5fd'}} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.doctorName}>{item.doctorName}</Text>
                <Text style={styles.specialite}>{item.doctorSpecialite}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
                {info.lastMsgDate && (
                  <Text style={{ color: '#888', fontSize: 12 }}>
                    {info.lastMsgDate.toLocaleDateString() + ' ' + info.lastMsgDate.toLocaleTimeString().slice(0,5)}
                  </Text>
                )}
                {info.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{info.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  title: { fontFamily:'UbuntuMono-Bold',fontSize: 24, marginBottom: 20, color: '#333',marginTop:40 },
  message: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 18,
    marginBottom: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  doctorName: { fontFamily:'UbuntuMono-Bold',fontSize: 16, color: '#09d1a0' },
  specialite: { fontFamily:'UbuntuMono-Regular',fontSize: 13, color: '#666' },
  unreadBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  unreadBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily:'UbuntuMono-Regular'
  },
});