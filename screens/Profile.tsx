import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: user.photoURL || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{user.fullName || 'Nom non disponible'}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.sectionContainer}>
        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionText}>Je suis médecin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionText}>Je suis un hôpital</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.section}>
          <Text style={styles.sectionText}>Historique</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  email: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },
  sectionContainer: {
    marginTop: 30,
    width: '100%',
    paddingHorizontal: 20
  },
  section: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: '#333'
  }
});
