import { View, Text, Image, TouchableOpacity, ImageBackground, StatusBar } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// Définissez vos types de navigation
type RootStackParamList = {
  onBoard1: undefined;
  onBoard2: undefined;
  Home: undefined;
};

type OnBoard2ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'onBoard2'>;
type OnBoard2ScreenRouteProp = RouteProp<RootStackParamList, 'onBoard2'>;

// Propriétés du composant
interface Props {
  navigation: OnBoard2ScreenNavigationProp;
  route: OnBoard2ScreenRouteProp;
}

export default function OnBoard2Screen({ navigation }: Props) {
  return (
    <ImageBackground source={require('../assets/images/bgOnBoard.png')} style={{ height: '100%' }}>
      <StatusBar translucent backgroundColor={'transparent'} barStyle={'light-content'} />
      <ImageBackground source={require('../assets/images/pic2.jpg')} style={{ justifyContent: 'center', paddingVertical: 15, height: '100%', flex: 5,alignItems:'center'}}>
        
        </ImageBackground>
      <View style={{ justifyContent: 'center', borderColor: 'black', width: '100%', padding: 20 }}>
        <View style={{ width: '100%' }}>
          <Text style={{ fontFamily:'Rubik Medium' ,color: '#000', textAlign: 'center', fontSize: 32, width: '100%' }}>Simplifiez vos Consultations</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ fontFamily:'Poppins Light',fontWeight: '300', textAlign: 'center', width: '80%', color: 'gray' }}>
          Prenez rendez-vous rapidement avec le médecin qu'il vous faut et gagnez du temps pour votre santé.
          </Text>
        </View>
      </View>
      <View style={{ borderColor: 'black', flex: 2, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation.replace('login')}
          style={{ backgroundColor: '#0EBE7F', width: '80%', padding: 10, borderRadius: 15 }}
        >
          <Text style={{fontFamily:'Poppins Light', textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#fff' }}>Suivant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.replace('login')}
          style={{
            backgroundColor: '#f5f5f5',
            width: '80%',
            borderColor: '#f5f5f5',
            borderWidth: 0.3,
            padding: 10,
            borderRadius: 15,
            marginTop: 10,
          }}
        >
          <Text style={{ fontFamily:'Poppins Light',textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: 'gray' }}>Sauter</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
