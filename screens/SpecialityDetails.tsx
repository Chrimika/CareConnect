import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';



type SpecialityItem = {
  id: number;
  nom: string;
  imageRepresentatif: string;
  couleur: string;
  sousTitre?: string; // Optionnel si vous l'ajoutez
  details?: string;   // Optionnel si vous l'ajoutez
  prixConsultation?: number; // Optionnel
  services?: {
    nom: string;
    prix: number;
    details: string;
  }[];
};

type RootStackParamList = {
  SpecialityDetails: {
    item: SpecialityItem;
  };
  Home: undefined; // Si aucun paramètre n'est attendu
};

// Définir les props de la screen
type Props = NativeStackScreenProps<RootStackParamList, 'SpecialityDetails'>;

const SpecialityDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { item } = route.params;
  

  return (
      <ScrollView style={[styles.container]}>
        <View style={{flexDirection:'row',justifyContent:'space-between',width:'100%',backgroundColor:'#0bcb95',height:200}}>
            <View style={{}}>
              <TouchableOpacity style={{margin:22,width:35}} onPress={()=>navigation.navigate('Home')}>
                  <Feather color={'white'} name='chevron-left' size={35}/>
              </TouchableOpacity>
              <View style={{marginHorizontal:22,width:250,}}>
                <Text style={{color:'white',fontSize:28,fontFamily:'Roboto Thin',fontWeight:'ultralight',marginHorizontal:8}}>{item.nom}</Text>
                <Text style={{color:'white',fontSize:11,fontFamily:'Poppins Light',fontWeight:'light',marginHorizontal:8,marginTop:8}}>{item.sousTitre}</Text>
              </View>
            </View>
            
            <View>
              <Image
                source={require('../assets/images/sideImage.png')}
                style={{width:100,height:100}}
              />
            </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={{flexDirection:'row',paddingTop:32,paddingLeft:32,alignItems:'center',marginTop:16}}>
            <View style={{backgroundColor:'#0bcb95',width:5,height:20}}>

            </View>
            <Text style={{marginLeft:6,fontFamily:'Poppins Light',fontSize:18,fontWeight:"600",color:'#000'}}>Détails</Text>
          </View>
          <View style={{paddingHorizontal:32,paddingVertical:8}}>
            <Text>{item.details}</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingTop: 32, paddingLeft: 32, alignItems: 'center', marginTop: 16 }}>
            <View style={{ backgroundColor: '#0bcb95', width: 5, height: 20 }}></View>
            <Text style={{ marginLeft: 6, fontFamily: 'Poppins Light', fontSize: 18, fontWeight: "600", color: '#000' }}>Services</Text>
          </View>

          {/* Liste des services */}
          <View style={{ paddingHorizontal: 32, paddingTop: 16 }}>
            {item.services.map((service, index) => (
              <TouchableOpacity key={index} style={{ marginBottom: 16,borderWidth:1,padding:8,borderRadius:10,borderStyle:'dashed',borderColor:'#0bcb95',flexDirection:'row',justifyContent:'space-between' }}>
                <View style={{flex:0.8}}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000',fontFamily:'Rubik Medium' }}>{service.nom}</Text>
                  <Text style={{ fontSize: 12, color: '#000', marginTop: 4,fontFamily:'Poppins Light',fontWeight:'light' }}>{service.details}</Text>
                </View>
                <View>
                <View style={{flex:0.2,flexDirection:'row',alignItems:'flex-end'}}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0bcb95',fontFamily:'Rubik Medium' }}>{service.prix}</Text>
                  <Text style={{fontSize:10,fontFamily:'Poppins Light',fontWeight:'light',color: '#0bcb95'}}>FCFA</Text>
                </View>

                </View>
                {/* <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
                  {service.nom}
                </Text>
                
                
                <Text style={{ fontSize: 14, color: '#555' }}>
                  Prix : {service.prix.toLocaleString()} FCFA
                </Text>
                <Text style={{ fontSize: 14, color: '#777', marginTop: 4 }}>
                  {service.details}
                </Text> */}
              </TouchableOpacity>
            ))}
          </View>
        </View>
    </ScrollView>
    
  );
};

export default SpecialityDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#0bcb95',
  },
  imageBackground: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderTopLeftRadius:80,
    height:'100%'
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    margin:32
  },
  description: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    marginHorizontal:32
  },
  button: {
    backgroundColor: '#0EBE7F',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
