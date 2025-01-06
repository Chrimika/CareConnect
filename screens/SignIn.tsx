import { View, Text, StatusBar, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import DatePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SignInScreen({navigation}) {
  const [step1Data, setStep1Data] = useState({ name: '', address: '' });
  const [step2Data, setStep2Data] = useState({ email: '', username: '' });
  const [step3Data, setStep3Data] = useState({ password: '', retypePassword: '' });
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [sex, setSex] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Close the DatePicker after selection
    setDateOfBirth(selectedDate || dateOfBirth); // Update date if changed
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' }}>
      <StatusBar backgroundColor="#0bcb95" barStyle="light-content" />
      <ProgressSteps>
        <ProgressStep label='Informations personnelles'>
          <View style={{ width: '100%', padding: 32 }}>
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Nom complet
              </Text>
              <TextInput
                placeholder="Mika MBA"
                style={{ width: '100%', height: 45, backgroundColor: '#ffffff', color: 'black' }}
              />
            </View>
            <View style={{ marginBottom: 24,flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Button to trigger DatePicker */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text>Date de naissance</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ height: 52, backgroundColor: '#ffffff', justifyContent: 'center', paddingHorizontal: 10,marginTop:12,width:'100%' }}>
                  <Text>{dateOfBirth ? dateOfBirth.toLocaleDateString() : "Sélectionner la date"}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DatePicker
                    style={{ width: '100%' }}
                    value={dateOfBirth}
                    mode="date"
                    placeholder="Sélectionner la date"
                    format="DD/MM/YYYY"
                    confirmBtnText="Confirmer"
                    cancelBtnText="Annuler"
                    onChange={handleDateChange}
                  />
                )}
              </View>

              {/* Sex Picker */}
              <View style={{ flex: 0.4 }}>
                <Text>Sexe</Text>
                <Picker
                  selectedValue={sex}
                  onValueChange={(itemValue) => setSex(itemValue)}
                  style={{width:'100%',backgroundColor:'white',marginTop:12}}
                >
                  <Picker.Item label="H" value="H" />
                  <Picker.Item label="F" value="F" />
                  
                </Picker>
                {/* Display the selected sex */}
               
              </View>
            </View>
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Address
              </Text>
              <TextInput
                placeholder="Yaoundé, Nsimeyong"
                style={{ width: '100%', height: 45, backgroundColor: '#ffffff', color: 'black' }}
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
            <View style={{ marginBottom: 24,width:'100%' }}>
                <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                    Confirmer mot de passe
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
          </View>
        </ProgressStep>
        <ProgressStep label='Informations de santé'>
          <View style={{ width: '100%', padding: 32 }}>
          <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Poids (Kg)
              </Text>
              <TextInput
                placeholder="56"
                style={{ width: '100%', height: 45, backgroundColor: '#ffffff', color: 'black' }}
              />
            </View>
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Taille (cm)
              </Text>
              <TextInput
                placeholder="56"
                style={{ width: '100%', height: 45, backgroundColor: '#ffffff', color: 'black' }}
              />
            </View>
            <View style={{ flex: 0.4, }}>
                <Text>Alergies</Text>
                <Picker
                  selectedValue={sex}
                  onValueChange={(itemValue) => setSex(itemValue)}
                  style={{width:'100%',backgroundColor:'white',marginTop:12}}
                >
                  <Picker.Item label="H" value="H" />
                  <Picker.Item label="F" value="F" />
                  
                </Picker>
                {/* Display the selected sex */}
               
              </View>
          </View>
        </ProgressStep>
        <ProgressStep label='Contact durgence & consultation à domicile' onSubmit={()=>navigation.replace('Home')}>
          <View style={{ width: '100%', padding: 32, }}>
            <View style={{ flex: 0.4,marginBottom: 24 }}>
                <Text>Assurée</Text>
                <Picker
                  selectedValue={sex}
                  onValueChange={(itemValue) => setSex(itemValue)}
                  style={{width:'100%',backgroundColor:'white',marginTop:12}}
                >
                  <Picker.Item label="H" value="H" />
                  <Picker.Item label="F" value="F" />
                  
                </Picker>
                {/* Display the selected sex */}
               
              </View>
              <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Tel
              </Text>
              <TextInput
                placeholder="69345..."
                style={{ width: '100%', height: 45, backgroundColor: '#ffffff', color: 'black' }}
              />
            </View>
            <View style={{ marginBottom: 24, width: '100%' }}>
              <Text style={{ fontSize: 12, color: 'black', fontFamily: 'Poppins Medium', marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                placeholder="xyz@gmail.com"
                style={{ width: '100%', height: 45, backgroundColor: '#ffffff', color: 'black' }}
              />
            </View>
          </View>
        </ProgressStep>
      </ProgressSteps>
    </View>
  );
}
