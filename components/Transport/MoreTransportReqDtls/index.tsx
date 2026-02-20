

import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

export interface SMAccount {
  SMAc: {
    id: string;
    sellerName: string;
    buyerName: string;
    distance: number;
    
    orderCost: number;
    buyerContact: string;
    transportRequest: string;
   deliveryDesc:string
   deliveryCost: number;
   engagementStatus: string;
    
  };
}

const ViewSMDeposts = ({ SMAc }: SMAccount) => {
  const {
    id,
    engagementStatus,
    sellerName,
    buyerName,
   deliveryCost,
    distance,
    orderCost,
    buyerContact,
    transportRequest,
    deliveryDesc
  
  } = SMAc;


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

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <View style={styles.pageContainer}>
       

        <View style={styles.card}>
         
         <Text style={styles.prodInfo}> 
                         {sellerName} to {buyerName}
                         || Aerial Distance: {distance} Kilometer || Order Total Cost: {formatAmountSync(orderCost, userCode, ratesMap)} || TransportCost: 
                          Ksh. {formatAmountSync(deliveryCost, userCode, ratesMap)}
                         || Contact: {buyerContact} || {transportRequest} || {engagementStatus}
                       </Text>
                      
                       <Text style = {styles.prodDesc}>Order Desciption: {deliveryDesc}</Text>
         
             </View>
      </View>
    </ScrollView>
  );
};

export default ViewSMDeposts;
