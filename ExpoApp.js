
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import React, { useState, useEffect, useRef, createContext } from 'react';
import { ScrollView, RefreshControl, SafeAreaView, StyleSheet, TextInput, FlatList, Text, View, Button, StatusBar, Platform } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Ionicons from 'react-native-vector-icons/Ionicons';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const PUSH_ENDPOINT = 'https://spiral-east-muskox.glitch.me';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    marginHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  button: {
    padding: 20,
    margin: 10,
    height: 40
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

const Tab = createBottomTabNavigator();

const TokenContext = createContext(false);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        // lightColor: '#FF231F7C',
      });
    }

    return token;
  }

const App = () => {
  const [pushToken, setExpoPushToken] = useState(false);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  }, []);

  return (
    <TokenContext.Provider value={pushToken}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Settings') {
                iconName = 'settings';
              } else if (route.name === 'Notify') {
                iconName = 'alarm';
              }

              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'black',
            inactiveTintColor: 'gray',
          }}>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Notify">
            {(props) => <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text>Title: {notification && notification.request.content.title} </Text>
              <Text>Body: {notification && notification.request.content.body}</Text>
              <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
            </View>}
          </Tab.Screen>
          <Tab.Screen name="Settings" component={ConfigScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </TokenContext.Provider>
  );
};

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [tokenList, setTokenList] = useState([]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    fetch(`${PUSH_ENDPOINT}/list`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        setTokenList(data);
        setRefreshing(false);
      })

  }, []);
  useEffect(onRefresh, []);

  return (
    <TokenContext.Consumer>
      {pushToken => (
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <Text>{refreshing ? "List Loading" : (tokenList.length == 0) ? "No Registrations!" : "Active Registrations"}</Text>
              <FlatList
                data={tokenList}
                renderItem={({item}) => {
                  if (item.token == pushToken) return <Text style={[styles.item, { backgroundColor: "red"}]}>{item.id}: {item.name ? item.name : item.token}</Text>
                  return <Text style={styles.item}>{item.id}: {item.name ? item.name : item.token}</Text>
                }}
              />
          </ScrollView>
        </SafeAreaView>
      )}
    </TokenContext.Consumer>
  );
}

const Separator = () => (
  <View style={styles.separator} />
);

const ConfigScreen = () => {
  const [deviceName, setDeviceName] = useState("none");

  return (
    <TokenContext.Consumer>
      {pushToken => {

        const createUpdateRegistration = async () => {
          const fetchResponse = await fetch(`${PUSH_ENDPOINT}/token`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: pushToken,
              name: deviceName,
            }),
          });
          const data = await fetchResponse.json();

          //For generating alert on buttton click
          alert('Hello' + JSON.stringify(data));
        };

        const deleteRegistration = async () => {
          const fetchResponse = await fetch(`${PUSH_ENDPOINT}/token`, {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: pushToken,
            }),
          });
          const data = await fetchResponse.json();

          //For generating alert on buttton click
          alert('Hello' + JSON.stringify(data));
        };

        const pushToMe = async () => {
          const fetchResponse = await fetch(`${PUSH_ENDPOINT}/push/${pushToken}`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });
          const data = await fetchResponse.json();

          //For generating alert on buttton click
          alert('Hello' + JSON.stringify(data));
        };

          const pushLocal = async () => {
await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
        };

        return <SafeAreaView style={styles.container}>
          <View>
            <Text>Device Token:</Text>
            <Text>{pushToken ? pushToken : "Loading..."}</Text>

            <Separator />

            <TextInput
              style={styles.input}
              onChangeText={setDeviceName}
              value={deviceName}
              placeholder="Device Name"
            />

            <Separator />

            <Button onPress={createUpdateRegistration} title="Register/Update for Push" color="green" style={styles.button} />

            <Button onPress={deleteRegistration} title="Unregister" color="red" style={styles.button} />
            <Button onPress={pushToMe} title="Push Me" color="blue" style={styles.button} />
            <Button onPress={pushLocal} title="Push Me (Local)" color="blue" style={styles.button} />
          </View>
        </SafeAreaView>;
      }}
    </TokenContext.Consumer>
  );
}

export default App;
