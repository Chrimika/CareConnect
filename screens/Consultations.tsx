import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import moment, { weekdays } from 'moment'
import Swiper from 'react-native-swiper'

const {width} = Dimensions.get('screen');

export default function ConsultationsScreen() {
  const swiper = useRef();
  const [value, setValue] = useState(new Date());
  const [week, setWeek] = useState(0);
  const weeks = useMemo(()=>{
    const start = moment(start).add(week, 'weeks').startOf('week');

    return [-1,0,1].map(adj => {
      return Array.from({length: 7}).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day')

        return{
          weekday: date.format('ddd'),
          date: date.toDate(),
        }
      })
    })
  },[week])


  return (
    <SafeAreaView style={{flex:1}}>
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
          onIndexChanged={ind => {
            if (ind === 1){
              return
            }
            setTimeout(()=> {
              const newIndex = ind - 1
              const newWeek = week + newIndex
              setWeek(newWeek);
              setValue(moment(value).add(newIndex, 'week').toDate())
              swiper.current.scrollTo(1, false)
            },100)
          }}  >
          {weeks.map((dates, weekIndex) => (
            <View 
              style={[styles.itemRow, { paddingHorizontal: 16 }]} 
              key={`week-${weekIndex}`}>
            {dates.map((item, dateIndex) => {
              const isActive = value.toDateString() === item.date.toDateString();

              return(
                <TouchableWithoutFeedback
                key={dateIndex}
                 onPress={() => setValue(item.date)}>
                  <View 
                    style={[
                      styles.item,
                      isActive && {
                        backgroundColor: '#0bcb95',
                        borderColor: '#0bcb95'
                      }
                      ]}>
                    <Text 
                      style={[
                        styles.itemWeekday,
                        isActive && {
                          color: '#fff'
                        }
                      ]}>{item.weekday}</Text>
                    <Text
                     style={[
                      styles.itemDate,
                      isActive && {
                        color: '#fff'
                      }]}>{item.date.getDate()}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )

            })}
          </View>
          ))}
          </Swiper>
        </View>
        <View style={{flex:1,paddingHorizontal:16,paddingVertical:24}}>
          <Text style={styles.contentText}>{value.toDateString()}</Text>
          <View style={styles.placeholder}>
            <View style={styles.placeholderContent}>

            </View>
            <View style={styles.footer}>
              <TouchableOpacity 
              style={styles.btn} 
              onPress={() => {

              } }>
                <Text style={styles.btnText}>Prendre rendez-vous</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24
  },
  header: {
    paddingHorizontal: 16
  },
  title: {
    fontSize: 32,
    fontWeight:'700',
    color: '#1d1d1d',
    marginBottom: 12
  },
  contentText: {
    fontSize:17,
    fontWeight:'600',
    color:'#999',
    marginBottom:12
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemRow: {
    width,
    flexDirection: 'row',
    alignItems:'flex-start',
    justifyContent:'space-between',
    marginHorizontal:-4
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth:1,
    borderColor:'#e3e3e3',
    borderRadius:8,
    alignItems:'center',
    flexDirection:'column'
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737373',
    marginBottom: 4
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111'
  },
  placeholder: {
    flex:1,
    height:400,

  },
  placeholderContent: {
    borderWidth:4,
    borderColor: '#e5e7eb',
    borderStyle:'dashed',
    borderRadius:9,
    flex:1
  },
  footer: {
    marginTop:24,
    paddingHorizontal: 16
  },
  btn: {
    flexDirection:'row',
    backgroundColor:'#0bcb95',
    borderWidth:1,
    borderColor:'#0bcb95',
    paddingVertical:10,
    paddingHorizontal:20,
    borderRadius:8,
    alignItems:'center',
    justifyContent:'center'
  },
  btnText: {
    fontSize:18,
    fontWeight:'600',
    color:'#fff'
  }
})