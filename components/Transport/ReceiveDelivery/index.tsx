import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import styles from './styles';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import {
  getTransportOrder,
  getSMAccount,
  getBizna,
  getGroup,
  getChamaMembers,
  getCompany,
  getTransportRegister
} from '../../../src/graphql/queries';
import {
  updateTransportOrder,
  updateSMAccount,
  updateGroup,
  updateCompany,
  createNonLoans,
  updateTransportRegister,
  updateBizna,
  createBenefitContributions2
} from '../../../src/graphql/mutations';
import { Linking } from 'react-native';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { useRoute, useNavigation as useNav } from '@react-navigation/native';

import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';


export interface SMAccount {
  SMAc: {
    id: string;
    sellerName: string;
    buyerName: string;
    distance: number;
    orderCost: number;
    buyerContact: string;
    transportRequest: string;
    deliveryDesc: string;
    deliveryCost: number;
    transportName: string;
    engagementStatus: string;
    chmAcNumber: string;
    deliveryStart: number;
    transportkntct: string;
  };
}

const client = generateClient();

const ViewSMDeposts = ({ SMAc }: SMAccount) => {
  const {
    id,
    transportName,
    sellerName,
    buyerName,
    deliveryCost,
    distance,
    chmAcNumber,
    orderCost,
    buyerContact,
    transportRequest,
    deliveryDesc,
    engagementStatus,
    deliveryStart,
    transportkntct,
  } = SMAc;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isLoading3, setIsLoading3] = useState(false);

  const navigation = useNav();

  const ChangeDeliveryLocation = () => {
    navigation.navigate("ChangeDeliveryLocation", { id });
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

  const handleAcceptDelivery = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const orderDtl: any = await client.graphql({ query: getTransportOrder, variables: { id } });
      const orderDtlz = orderDtl.data.getTransportOrder;

      const TransportDtls: any = await client.graphql({ query: getTransportRegister, variables: { id: orderDtlz.bizAc } });
      const transportDtlz = TransportDtls.data.getTransportRegister;

      const bizResult: any = await client.graphql({ query: getBizna, variables: { BusKntct: orderDtlz.sellerContact } });
      const biz = bizResult.data.getBizna;

      const buyerDtls: any = await client.graphql({ query: getSMAccount, variables: { awsemail: orderDtlz.customerEmail } });
      const buyerDtlsz = buyerDtls.data.getSMAccount;

      const CompDtls: any = await client.graphql({ query: getCompany, variables: { AdminId: "BaruchHabaB'ShemAdonai2" } });
      const compDtls = CompDtls.data.getCompany;

      // … keep your business logic intact, just swap API.graphql calls with client.graphql
      await client.graphql({
        query: updateTransportOrder,
        variables: {
          input: {
            id,
            engagementStatus: "TransportNotEngaged",
            transportRequest: "transportRequestNo",
          }
        }
      });

      Alert.alert("Success", "Delivery Received!");
    } catch (err) {
      console.error("Accept error:", err);
      Alert.alert("Error", "Could not accept delivery.");
    } finally {
      setIsLoading(false);
    }
  };

  const CancelRequest = async () => {
    setIsLoading2(true);
    try {
      const orderDtl: any = await client.graphql({ query: getTransportOrder, variables: { id } });
      const orderDtlz = orderDtl.data.getTransportOrder;

      if (orderDtlz.engagementStatus === "TransportEngaged") {
        Alert.alert("Sorry", "This delivery request has already been accepted.");
        return;
      }

      await client.graphql({
        query: updateTransportOrder,
        variables: { input: { id, transportRequest: "transportRequestNo" } }
      });

      Alert.alert("Success", "Delivery request cancelled!");
    } catch (err) {
      console.error("Cancel error:", err);
      Alert.alert("Error", "Could not handle delivery.");
    } finally {
      setIsLoading2(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <Pressable style={styles.card}>
        <Text style={styles.prodInfo}>
          {transportName} transport services || {sellerName} to {buyerName} ||
         Aerial Distance: {distance} Kilometer || Order Total Cost: {formatAmountSync(orderCost, userCode, ratesMap)}
          TransportCost: {formatAmountSync(deliveryCost, userCode, ratesMap)} || Contact: {transportkntct} || {engagementStatus} ||
          {((Date.now() - deliveryStart) / 3600000).toFixed(4)} hours ago
        </Text>
        <Text style={styles.prodDesc}>Order Description: {deliveryDesc}</Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handleAcceptDelivery} style={styles.loanFriendButton} disabled={isLoading}>
          {isLoading && <ActivityIndicator size="small" color="#fff" />}
          <Text style={{ color: 'white' }}>{isLoading ? 'Processing...' : 'Accept Delivery'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={CancelRequest} style={styles.loanFriendButton} disabled={isLoading2}>
          {isLoading2 && <ActivityIndicator size="small" color="#fff" />}
          <Text style={{ color: 'white' }}>{isLoading2 ? 'Processing...' : 'Cancel Request'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={ChangeDeliveryLocation} style={styles.loanFriendButton} disabled={isLoading3}>
          {isLoading3 && <ActivityIndicator size="small" color="#fff" />}
          <Text style={{ color: 'white' }}>{isLoading3 ? 'Processing...' : 'Change Delivery Location'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewSMDeposts;
