import { View, Text, Image, TouchableOpacity, ImageBackground } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// Définissez vos types de navigation
type RootStackParamList = {
  onBoard1: undefined;
  onBoard2: undefined;
  Home: undefined;
};

type OnBoard1ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'onBoard1'>;
type OnBoard1ScreenRouteProp = RouteProp<RootStackParamList, 'onBoard1'>;

// Propriétés du composant
interface Props {
  navigation: OnBoard1ScreenNavigationProp;
  route: OnBoard1ScreenRouteProp;
}

export default function OnBoard1Screen({ navigation }: Props) {
  return (
    <ImageBackground source={require('../assets/images/bgOnBoard.png')} style={{ height: '100%' }}>
      <View style={{ justifyContent: 'flex-end', paddingVertical: 15, paddingHorizontal: 'auto', height: '100%', flex: 5,alignItems:'center' }}>
        <Image source={require('../assets/images/pic1.png')} />
      </View>
      <View style={{ justifyContent: 'center', borderColor: 'black', width: '100%', padding: 20 }}>
        <View style={{ width: '100%' }}>
          <Text style={{ color: '#000', textAlign: 'center', fontSize: 32, width: '100%' }}>Trouvez votre Médecin idéal</Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ fontWeight: '300', textAlign: 'center', width: '80%', color: 'gray' }}>
            Contrairement à la croyance populaire, le Lorem Ipsum n'est pas simplement du texte aléatoire. Il trouve ses origines dans un texte vieux de plus de 2000 ans.
          </Text>
        </View>
      </View>
      <View style={{ borderColor: 'black', flex: 2, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('onBoard2')}
          style={{ backgroundColor: '#0EBE7F', width: '80%', padding: 10, borderRadius: 15 }}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: '#fff' }}>Suivant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
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
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, color: 'gray' }}>Sauter</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
