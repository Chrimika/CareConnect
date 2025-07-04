import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ChatScreen({ route }) {
  const { doctor } = route.params;
  const user = auth().currentUser;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef();

  const chatId = [user.uid, doctor.doctorId].sort().join('_');

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('PatientDoctorMessages')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snap => {
        setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // Marquer les messages reçus comme "read"
        snap.docs.forEach(doc => {
          const msg = doc.data();
          if (msg.to === user.uid && msg.status !== 'read') {
            doc.ref.update({ status: 'read' });
          }
        });
      });
    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await firestore()
      .collection('PatientDoctorMessages')
      .doc(chatId)
      .collection('messages')
      .add({
        from: user.uid,
        to: doctor.doctorId,
        text: input,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: 'sent',
      });
    setInput('');
  };

  const renderStatus = (msg) => {
    if (msg.from !== user.uid) return null;
    // Tick icons: 1 gray = sent, 2 gray = delivered, 2 green = read
    if (msg.status === 'read') {
      return <Icon name="done-all" size={18} color="#09d1a0" style={{ marginLeft: 4 }} />;
    }
    if (msg.status === 'delivered') {
      return <Icon name="done-all" size={18} color="#aaa" style={{ marginLeft: 4 }} />;
    }
    // sent
    return <Icon name="done" size={18} color="#aaa" style={{ marginLeft: 4 }} />;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f8f9fa' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Icon name="person" size={28} color="#09d1a0" />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.headerTitle}>{doctor.doctorName}</Text>
          <Text style={styles.headerSub}>{doctor.doctorSpecialite}</Text>
        </View> 
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isMe = item.from === user.uid;
          return (
            <View style={[
              styles.messageRow,
              isMe ? styles.messageRight : styles.messageLeft
            ]}>
              <View style={[
                styles.bubble,
                isMe ? styles.bubbleRight : styles.bubbleLeft
              ]}>
                <Text style={{ color: isMe ? '#fff' : '#333' }}>{item.text}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 2 }}>
                  <Text style={{ fontSize: 10, color: isMe ? '#e0f7f4' : '#999' }}>
                    {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString().slice(0,5) : ''}
                  </Text>
                  {renderStatus(item)}
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Votre message..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Icon name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', padding: 32, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee',alignItems:'center'},
  headerTitle: { fontWeight: 'bold', fontSize: 18, color: '#09d1a0' },
  headerSub: { color: '#666', fontSize: 13, marginTop: 2 },
  messageRow: { flexDirection: 'row', marginBottom: 10 },
  messageLeft: { justifyContent: 'flex-start' },
  messageRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 10, marginHorizontal: 8 },
  bubbleLeft: { backgroundColor: '#e0f7f4', alignSelf: 'flex-start' },
  bubbleRight: { backgroundColor: '#09d1a0', alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', position: 'absolute', bottom: 0, left: 0, right: 0 },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, fontSize: 16, marginRight: 10 },
  sendBtn: { backgroundColor: '#09d1a0', borderRadius: 20, padding: 10 },
});