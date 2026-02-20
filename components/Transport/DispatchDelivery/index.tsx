import { useNavigation } from '@react-navigation/core';
import { View, Text, ScrollView, Pressable, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import styles from './styles';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { getTransportOrder, getSMAccount, getBizna, getGroup, getChamaMembers, getCompany } from '../../../src/graphql/queries';
import { updateTransportOrder, updateSMAccount, updateGroup, updateCompany } from '../../../src/graphql/mutations';
import { Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';

import React, {useEffect, useState} from 'react';

import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';

import {fetchUserAttributes} from 'aws-amplify/auth';


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
    bizType: string;
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
    bizType,
    transportkntct,
  } = SMAc;

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const route = useRoute();

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

      const orderDtl: any = await client.graphql({
        query: getTransportOrder,
        variables: { id }
      });
      const orderDtlz = orderDtl.data.getTransportOrder;

      const CompDtls: any = await client.graphql({
        query: getCompany,
        variables: { AdminId: "BaruchHabaB'ShemAdonai2" }
      });

      const compDtls = CompDtls.data.getCompany;
      const compEarningShare = compDtls.transportCompanyShare;
      const CompEarning = compEarningShare * parseFloat(orderDtlz.deliveryCost);

      if (orderDtlz.bizType === "TransportDispatched") {
        Alert.alert("Sorry", "This delivery has already been Dispatched.");
        return;
      }

      if (orderDtlz.transportRequest === "transportRequestNo") {
        Alert.alert("Sorry", "This Transporter has not been requested.");
        return;
      } else {
        const updateOrdr: any = await client.graphql({
          query: updateTransportOrder,
          variables: {
            input: {
              id,
              bizType: "TransportDispatched",
            }
          }
        });

        if (updateOrdr?.data?.updateTransportOrder) {
          Alert.alert("Success", "Delivery Dispatched!");
          // Send SMS notification
          const sendSMS = (phoneNumber: string, message: string) => {
            const url = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
            Linking.openURL(url);
          };

          sendSMS(
            orderDtlz.buyerContact,
            orderDtlz.sellerName +
              ' has dispatched your delivery of ' +
              orderDtlz.deliveryDesc +
              ' through your transport service of choice ' +
              orderDtlz.transportName +
              '.' +
              ' You may contact them through ' +
              orderDtlz.transportkntct
          );
        }
      }
    } catch (err) {
      console.error("Accept error:", err);
      Alert.alert("Error", "Could not accept delivery.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <Pressable style={styles.card}>
        <Text style={styles.prodInfo}>
          {transportName} transport services || {sellerName} to {buyerName} ||
          {(() => { const { nationality, ratesMap } = useExchange(); return <>Aerial Distance: {distance} Kilometer || Order Total Cost: {formatAmountSync(orderCost, userCode, ratesMap)} ||</> })()}
          TransportCost: Ksh. {formatAmountSync(deliveryCost, userCode, ratesMap)} || Contact: {transportkntct} || {engagementStatus} ||
          {bizType} || {transportRequest}
        </Text>

        <Text style={styles.prodDesc}>Order Description: {deliveryDesc}</Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => handleAcceptDelivery()}
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
          {isLoading && (
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
          )}
          <Text style={{ color: 'white', fontSize: 12 }}>
            {isLoading ? 'Processing...' : 'Dispatch Delivery'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ViewSMDeposts;
