import React, { useMemo, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  TouchableWithoutFeedback,
  FlatList, 
  Alert
} from 'react-native';
import moment from 'moment';
import 'moment/locale/fr';
import Swiper from 'react-native-swiper';
import Consultation from '../controller/Consultation';

moment.locale('fr');
const { width } = Dimensions.get('screen');

export default function ConsultationsScreen() {
  const swiper = useRef<Swiper>(null);
  const [value, setValue] = useState(new Date());
  const [week, setWeek] = useState(0);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);

  const hours = useMemo(() => {
    // Générer des heures de 00:00 à 23:30 par incréments de 30 minutes
    return Array.from({ length: 48 }, (_, index) => {
      return moment().startOf('day').add(index * 30, 'minutes').format('HH:mm');
    });
  }, []);

  const weeks = useMemo(() => {
    const start = moment().add(week, 'weeks').startOf('week');
    return [-1, 0, 1].map((adj) => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');
        return {
          weekday: date.format('ddd').replace('.', ''),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  const handleConfirmAppointment = () => {
    if (selectedHour) {
      const consultation = new Consultation(
        value,
        selectedHour,
        'Doe',
        'John',
        'Générale'
      );
      Alert.alert('Rendez-vous confirmé', consultation.getDetails());
    } else {
      Alert.alert('Veuillez sélectionner une heure.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Vos disponibilités</Text>
        </View>
        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            showsPagination={false}
            loop={false}
            onIndexChanged={(ind) => {
              if (ind === 1) {
                return;
              }
              setTimeout(() => {
                const newIndex = ind - 1;
                const newWeek = week + newIndex;
                setWeek(newWeek);
                setValue(moment(value).add(newIndex, 'week').toDate());

                if (swiper.current) {
                  swiper.current.scrollTo(1, false);
                }
              }, 100);
            }}
          >
            {weeks.map((dates, weekIndex) => (
              <View
                style={[styles.itemRow, { paddingHorizontal: 16 }]}
                key={`week-${weekIndex}`}
              >
                {dates.map((item, dateIndex) => {
                  const isActive = value.toDateString() === item.date.toDateString();

                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => setValue(item.date)}
                    >
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: '#0bcb95',
                            borderColor: '#0bcb95',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && {
                              color: '#fff',
                            },
                          ]}
                        >
                          {item.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.itemDate,
                            isActive && {
                              color: '#fff',
                            },
                          ]}
                        >
                          {item.date.getDate()}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          <View style={styles.hourPicker}>
            <Text style={styles.subTitle}>Choisissez une heure</Text>
            <FlatList
              horizontal
              data={hours}
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                const isSelected = item === selectedHour;
                return (
                  <TouchableOpacity
                    style={[
                      styles.hourItem,
                      isSelected && {
                        backgroundColor: '#0bcb95',
                        borderColor: '#0bcb95',
                      },
                    ]}
                    onPress={() => setSelectedHour(item)}
                  >
                    <Text
                      style={[
                        styles.hourText,
                        isSelected && {
                          color: '#fff',
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
            <Text style={styles.contentText}>
              {moment(value).format('dddd D MMMM YYYY')} à {selectedHour}Hr
            </Text>
          </View>
          <View style={{flex:1}}></View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btn} onPress={handleConfirmAppointment}>
              <Text style={styles.btnText}>Prendre rendez-vous</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0bcb95',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRow: {
    width,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737373',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  hourPicker: {
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hourItem: {
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourText: {
    fontSize: 14,
    color: '#333',
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  btn: {
    flexDirection: 'row',
    backgroundColor: '#0bcb95',
    borderWidth: 1,
    borderColor: '#0bcb95',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
