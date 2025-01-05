import { View, Text, StatusBar, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';

export default function LoginScreen({navigation}) {
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <View style={{flex:1,alignItems:'center'}}>
      <StatusBar backgroundColor="#087a5d" barStyle="light-content" />
      <View style={{flex:1,backgroundColor:'#087a5d',width:'100%'}}>
        <View style={{flex:0.11,backgroundColor:'#087a5d',width:'100%',height:'100%',justifyContent:'center',alignItems:'center'}}>
            <Image resizeMode='contain' style={{width:48,height:48,borderRadius:24}} source={require('../assets/images/logo.png')}/>
        </View>
        <View style={{flex:1,backgroundColor:'#0bcb95',borderTopLeftRadius:37,borderTopRightRadius:37}}>
            <View style={{flex:0.16,backgroundColor:'#0bcb95',width:'100%',height:'100%',borderTopLeftRadius:37,borderTopRightRadius:37,justifyContent:'center',alignItems:'center'}}>
                <Text style={{fontSize:24,color:'white',fontFamily:'Rubik Medium'}}>Créez un compte</Text>
                <Text style={{fontSize:12,color:'white',fontFamily:'Poppins Medium'}}>Connectez-vous et recevez des soins chez vous</Text>
            </View>
        <View style={{flex:1,backgroundColor:'#ffffff',width:'100%',height:'100%',borderTopLeftRadius:37,borderTopRightRadius:37,padding:32,alignItems:'center'}}>
            <View style={{ marginBottom: 24,width:'100%' }}>
                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Nom complet
                </Text>
                <TextInput
                placeholder="Mika MBA"
                value={fullName}
                onChangeText={setFullName}
                style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black' }}
                />
            </View>

            <View style={{ marginBottom: 24,width:'100%' }}>
                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Email
                </Text>
                <TextInput
                placeholder="example@gmail.com"
                value={email}
                onChangeText={setEmail}
                style={{ width: '100%', height: 45, backgroundColor: '#f3f3f3', color: 'black' }}
                />
            </View>
            <View style={{ marginBottom: 24,width:'100%' }}>
                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                    Mot de passe
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f3f3', borderRadius: 8 }}>
                    <TextInput
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                    style={{ flex: 1, height: 45, paddingHorizontal: 10, color: 'black' }}
                    />
                    <TouchableOpacity
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                    style={{ padding: 10 }}
                    >
                    <Icon
                        name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="gray"
                    />
                    </TouchableOpacity>
                </View>
            </View>
            <View>
                
            </View>
            <View style={{width:'100%',flex:0.8,justifyContent:'center'}}>
                <TouchableOpacity style={{width:'100%',height:45,backgroundColor:'#0bcb95',justifyContent:'center',borderRadius:8}}>
                    <Text style={{color:'white',textAlign:'center',fontSize:18,fontFamily:'Rubik Medium'}}>Se connecter</Text>
                </TouchableOpacity>
            </View>
            <View
            style={{
                width: '100%',
                flex: 0.2,
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
            }}
            >
            <Text
                style={{
                color: 'black',
                textAlign: 'center',
                fontSize: 14,
                fontFamily: 'Rubik Medium',
                }}
            >
                Pas encore de compte ?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('signin')}>
                <Text
                style={{
                    color: '#0bcb95', // Couleur pour "Sign up"
                    fontSize: 14,
                    fontFamily: 'Rubik Medium',
                    cursor:'pointer',
                    textDecorationLine:'underline'
                }}
                >
                Sign up
                </Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
      </View>
    </View>
  )
}