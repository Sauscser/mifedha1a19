import React, { useState, useEffect} from 'react';
import { View, Text, Pressable, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import styles from './styles';
import { generateClient } from 'aws-amplify/api';
import { remove } from 'aws-amplify/storage';
import { updateTransportRegister, deleteTransportRegister } from '../../../src/graphql/mutations';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';

export interface SMAccount {
  SMAc: {
    id: string;
    transportRate: number;
    transportdesc: string;
    Earnings: number;
    orderCost: number;
    buyerContact: string;
    transportPhoto: string;
    deliveryDesc: string;
    deliveryCost: number;
    transportName: string;
    engagementStatus: string;
    chmAcNumber: string;
    bizType: string;
    transportkntct: string;
  };
}

const client = generateClient();

const ViewSMDeposts = ({ SMAc }: SMAccount) => {
  const {
    id,
    transportName,
    transportRate,
    transportdesc,
    deliveryCost,
    Earnings,
    chmAcNumber,
    orderCost,
    buyerContact,
    transportPhoto,
    deliveryDesc,
    engagementStatus,
    bizType,
    transportkntct,
  } = SMAc;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const navigation = useNavigation();

  const ShareRev = () => {
    navigation.navigate("ShareTransportRevenue", { id });
  };

  const ViewTransportPaymentRec = () => {
    navigation.navigate("ViewTransportPaymentRec");
  };

  const ViewDeliveryPayments = () => {
    navigation.navigate("ViewDeliveryPayments");
  };

      const client = generateClient();
      const [Uzer, setUzer] = useState<string>(null);
      const [userNationality, setUserNationality] = useState<string>(null);
      const userCode = nationalityToCode(userNationality);
      const {ratesMap} = useExchange();
        
     
        
     
        useEffect(() => {
                const fetchUserData = async () => {
        
                    const user = await fetchUserAttributes();
                    setUzer(user.email);
                    try {
                        const userData = await client.graphql({
                            query: getSMAccount,
                            variables: { awsemail: user.email },
                        });
                        setUserNationality(userData.data.getSMAccount.nationality);
                        console.log('User Data:', userData);
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                };
                fetchUserData();
            }, [Uzer]);

  const fetchLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      if (loc.coords.accuracy && loc.coords.accuracy > 30) {
        Alert.alert(
          "Low GPS Accuracy",
          `Location accuracy is about ${Math.round(loc.coords.accuracy)} meters. Try moving near a window or outside.`
        );
      }

      setLocation(coords);

      const updateOrdr: any = await client.graphql({
        query: updateTransportRegister,
        variables: {
          input: {
            id,
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        },
      });

      if (updateOrdr.data.updateTransportRegister) {
        Alert.alert("Stage Location reset successfully.");
      }
    } catch (error) {
      console.warn("Error fetching location:", error);
      Alert.alert("Failed to get location. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAc = async () => {
    setIsLoading2(true);
    try {
      const delAc: any = await client.graphql({
        query: deleteTransportRegister,
        variables: {
          input: {
            id,
          },
        },
      });

      await remove({ key: transportPhoto });

      if (delAc.data.deleteTransportRegister) {
        Alert.alert("Account Deleted successfully.");
      }
    } catch (error) {
      console.warn("Error deleting Account:", error);
      Alert.alert("Failed to delete account. Try again.");
    } finally {
      setIsLoading2(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <Pressable style={styles.card}>
        <Text style={styles.prodInfo}>
          {transportName} transport services || TransportRate: {formatAmountSync(transportRate, userCode, ratesMap)} || Earnings: {formatAmountSync(Earnings, userCode, ratesMap)} || Description: {transportdesc}
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={fetchLocation}
          style={[
            styles.loanFriendButton,
            {
              backgroundColor: '#e58d29',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          disabled={isLoading}
        >
          {isLoading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />}
          <Text style={{ color: 'white', fontSize: 12 }}>
            {isLoading ? 'Processing...' : 'Reset Stage Location'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={deleteAc}
          style={[
            styles.loanFriendButton,
            {
              backgroundColor: '#e58d29',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isLoading2 ? 0.7 : 1,
            },
          ]}
          disabled={isLoading2}
        >
          {isLoading2 && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />}
          <Text style={{ color: 'white', fontSize: 12 }}>
            {isLoading2 ? 'Processing...' : 'Delete Transport Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loanFriendButton} onPress={ShareRev}>
          <Text style={{ color: 'white', fontSize: 12 }}>Share Revenue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loanFriendButton} onPress={ViewTransportPaymentRec}>
          <Text style={{ color: 'white', fontSize: 12 }}>View shared revenue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loanFriendButton} onPress={ViewDeliveryPayments}>
          <Text style={{ color: 'white', fontSize: 12 }}>View Delivery Payments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewSMDeposts;
