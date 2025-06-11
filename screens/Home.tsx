import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground, StatusBar, Alert } from 'react-native';
import { Specialites } from './../datas/specialities'; // Assurez-vous de remplacer par le chemin correct
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function HomeScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null); // Stocke la position de l'utilisateur
  const [permissionGranted, setPermissionGranted] = useState(false); // Gère l'état de la permission

  // Demande de permission pour accéder à la géolocalisation
  const requestLocationPermission = async () => {
    try {
      const permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (permission === RESULTS.GRANTED) {
        setPermissionGranted(true);
        fetchLocation(); // Récupérer la position si la permission est accordée
      } else {
        Alert.alert("Permission refusée", "La permission d'accès à la localisation est nécessaire.");
      }
    } catch (error) {
      console.log('Erreur de permission:', error);
      Alert.alert("Erreur", "Impossible de demander la permission.");
    }
  };

  // Fonction qui récupère la position de l'utilisateur
  const fetchLocation = async () => {
    if (permissionGranted) {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const user = auth().currentUser;
  
          if (user) {
            const uid = user.uid;
  
            const positionData = { latitude, longitude };
  
            try {
              // 🔁 Firestore : met à jour la position du user
              await firestore()
                .collection('users')
                .doc(uid)
                .update({ position: positionData });
  
              // 💾 AsyncStorage : stocke localement
              await AsyncStorage.setItem('user_position', JSON.stringify(positionData));
  
              console.log('Position mise à jour en ligne et locale :', positionData);
            } catch (error) {
              console.error('Erreur de mise à jour de la position :', error);
            }
  
            setLocation(positionData); // met à jour l’état local
          }
        },
        (error) => {
          console.log('Erreur de géolocalisation :', error);
          alert('Impossible de récupérer la position.');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    }
  };
  

  useEffect(() => {
    // Demander la permission dès que le composant se monte
    requestLocationPermission();
  }, []); // Appel seulement au premier rendu

  const renderItem = ({ item }) => {
    if (!item.imageRepresentatif || !item.nom) {
      return null; // Ignore les éléments invalides
    }

    return (
      <TouchableOpacity
        style={[styles.block, { backgroundColor: 'white', borderWidth: 0.7, borderColor:'gray' }]}
        onPress={() => navigation.navigate('speciality', { item })}
      >
        <Image
          source={{ uri: item.imageRepresentatif }}
          resizeMode="contain"
          style={styles.image}
        />
        <Text style={styles.blockText}>{item.nom}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
      
      <ImageBackground source={require('../assets/images/bg-wave.png')} resizeMode='repeat' style={{width:'100%',flex:0.35}}>
        <View style={{padding:16, justifyContent:'space-between',flexDirection:'row',width:'100%',borderWidth:1,borderColor:'#0bcb95'}}>
          <TouchableOpacity onPress={()=>({})}>
            <Image source={require('../assets/images/logo.png')} style={{width:40,height:40}}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate('message')}>
            <Feather name='bell' size={22} color={'white'}/>
          </TouchableOpacity>
        </View>
        <View style={{paddingHorizontal:16,}}>
          <Text style={{fontSize:20,fontFamily:'Rubik Medium',color:'white'}}>Hosto au piol</Text>
          <Text style={{fontWeight:'ultralight',fontSize:12,color:'white'}}>
            Consultez un médecin ou accédez aux soins facilement, où que vous soyez !
          </Text>
        </View>
      </ImageBackground>
      <View style={{flex:0.3}}>
        <View style={{flexDirection:'row',paddingHorizontal:16,alignItems:'center',marginTop:-15}}>
          <View style={{backgroundColor:'#0bcb95',width:5,height:20}}></View>
          <Text style={{marginLeft:6,fontFamily:'Poppins Light',fontSize:18,fontWeight:"600",color:'#000'}}>Specialités</Text>
        </View>
        <View style={{justifyContent:'center',alignItems:'center'}}>
          <FlatList
            data={Specialites}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
      <View style={{flex:0.3}}>
        <View style={{flexDirection:'row',paddingHorizontal:16,alignItems:'center'}}>
          <View style={{backgroundColor:'#0bcb95',width:5,height:20}}></View>
          <Text style={{marginLeft:6,fontFamily:'Poppins Light',fontSize:18,fontWeight:"600",color:'#000'}}>Généraliste</Text>
        </View>
        <View style={{flex:1,flexDirection:'row'}}>
          <ImageBackground resizeMode='contain' source={require('../assets/images/doctorHero.png')} style={{flex:0.6}}></ImageBackground>
          <View style={{flex:0.4,paddingHorizontal:15,justifyContent:'center'}}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ListHosto')}
              style={{ backgroundColor: '#0bcb95', width: '100%', padding: 10, borderRadius: 15 }}
            >
              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#fff',fontFamily:'Poppins Medium' }}>Consulter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    justifyContent: 'space-evenly',
    paddingVertical: 10,
  },
  block: {
    marginHorizontal: 8,
    padding: 8,
    height: 120,
    width: 120,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40, 
    overflow: 'hidden',
  },
  blockText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
