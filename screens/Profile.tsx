import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
// import ImagePicker from 'react-native-image-crop-picker';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isHospital, setIsHospital] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        if (parsedUser.roles) {
          setIsDoctor(parsedUser.roles.includes('doctor'));
          setIsHospital(parsedUser.roles.includes('hospital'));
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('user');
      navigation.replace('login');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Déconnexion échouée');
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async () => {
    /*
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
      });

      setLoading(true);
      
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          photoURL: image.path
        });

      const updatedUser = { ...user, photoURL: image.path };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Erreur', 'Impossible de changer la photo');
      }
    } finally {
      setLoading(false);
    }
    */
  };

  const toggleRole = async (role) => {
    setLoading(true);
    try {
      const userRef = firestore().collection('users').doc(user.uid);
      const newRoles = user.roles || [];
      
      if (role === 'doctor') {
        const newDoctorStatus = !isDoctor;
        setIsDoctor(newDoctorStatus);
        if (newDoctorStatus && !newRoles.includes('doctor')) {
          newRoles.push('doctor');
        } else {
          const index = newRoles.indexOf('doctor');
          if (index > -1) newRoles.splice(index, 1);
        }
      } else if (role === 'hospital') {
        const newHospitalStatus = !isHospital;
        setIsHospital(newHospitalStatus);
        if (newHospitalStatus && !newRoles.includes('hospital')) {
          newRoles.push('hospital');
        } else {
          const index = newRoles.indexOf('hospital');
          if (index > -1) newRoles.splice(index, 1);
        }
      }

      await userRef.update({ roles: newRoles });
      
      const updatedUser = { ...user, roles: newRoles };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Modification échouée');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0bcb95" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={updateProfilePicture}>
          <Image
            source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Icon name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.name}>{user.name || 'Utilisateur'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon Statut</Text>
        
        <TouchableOpacity 
          style={[styles.roleButton, isDoctor && styles.roleButtonActive]}
          onPress={() => toggleRole('doctor')}
          disabled={loading}
        >
          <Icon 
            name={isDoctor ? 'checkmark-circle' : 'medical'} 
            size={24} 
            color={isDoctor ? '#0bcb95' : '#666'} 
          />
          <Text style={[styles.roleText, isDoctor && styles.roleTextActive]}>
            Je suis médecin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.roleButton, isHospital && styles.roleButtonActive]}
          onPress={() => toggleRole('hospital')}
          disabled={loading}
        >
          <Icon 
            name={isHospital ? 'checkmark-circle' : 'business'} 
            size={24} 
            color={isHospital ? '#0bcb95' : '#666'} 
          />
          <Text style={[styles.roleText, isHospital && styles.roleTextActive]}>
            Je suis un hôpital
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="time" size={24} color="#666" />
          <Text style={styles.menuText}>Mes rendez-vous</Text>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="document-text" size={24} color="#666" />
          <Text style={styles.menuText}>Mes documents</Text>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Icon name="log-out" size={20} color="white" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#0bcb95'
  },
  cameraIcon: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    backgroundColor: '#0bcb95',
    borderRadius: 20,
    padding: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  roleButtonActive: {
    borderColor: '#0bcb95',
    backgroundColor: '#f0faf7',
  },
  roleText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#666',
  },
  roleTextActive: {
    color: '#0bcb95',
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});