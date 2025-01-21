import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground, StatusBar } from 'react-native';
import { Specialites } from './../datas/specialities'; // Assurez-vous de remplacer par le chemin correct
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather'



export default function SpecialitiesScreen() {
  const navigation = useNavigation();

  // Vérifie si l'image ou le nom est manquant, si oui, ne pas afficher l'élément
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
      <StatusBar backgroundColor="#0bcb95" barStyle="light-content" />
      <ImageBackground source={require('../assets/images/bg-wave.png')} resizeMode='repeat' style={{width:'100%',flex:0.35}}>
        <View style={{padding:16,justifyContent:'space-between',flexDirection:'row',width:'100%',borderWidth:1,borderColor:'#0bcb95'}}>
          <View>
            <Image source={require('../assets/images/logo.png')} style={{width:40,height:40}}/>
          </View>
          <View>
            <Feather name='bell' size={22} color={'white'}/>
          </View>
        </View>
        <View style={{paddingHorizontal:16,}}>
          <Text style={{fontSize:20,fontFamily:'Rubik Medium',color:'white'}}>Hosto au piol</Text>
          <Text style={{fontWeight:'ultralight',fontSize:12,color:'white'}}>
          Consultez un médecin ou accédez aux soins facilement, où que vous soyez !
          </Text>
        </View>
      </ImageBackground>
      <View style={{flex:0.3}}>
      <View style={{flexDirection:'row',paddingHorizontal:16,alignItems:'center'}}>
        <View style={{backgroundColor:'#0bcb95',width:5,height:20}}>

        </View>
        <Text style={{marginLeft:6,fontFamily:'Poppins Light',fontSize:18,fontWeight:"600",color:'#000'}}>Specialités</Text>
      </View>
      <View style={{justifyContent:'center',alignItems:'center'}}>
      <FlatList
        data={Specialites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()} // Assure une clé unique pour chaque élément
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={{}}
      />
      </View>
      </View>
      <View style={{flex:0.3}}>
      <View style={{flexDirection:'row',paddingHorizontal:16,alignItems:'center'}}>
        <View style={{backgroundColor:'#0bcb95',width:5,height:20}}>

        </View>
        <Text style={{marginLeft:6,fontFamily:'Poppins Light',fontSize:18,fontWeight:"600",color:'#000'}}>Généraliste</Text>
      </View>
      <View style={{flex:1,flexDirection:'row'}}>
        <ImageBackground resizeMode='contain' source={require('../assets/images/doctorHero.png')} style={{flex:0.6}}>
          
        </ImageBackground>
        <View style={{flex:0.4,paddingHorizontal:15,justifyContent:'center'}}>
        <TouchableOpacity
          onPress={() => navigation.navigate('consultations')}
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
    justifyContent: 'space-evenly', // Également espacé entre les items
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
    borderRadius: 40, // Rendre l'image circulaire
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
