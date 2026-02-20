import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { deleteReqLoan, updateBizSlsReq, updateNonLoans, updateReqLoan } from '../../../../../src/graphql/mutations';
import { StyleSheet, Dimensions } from 'react-native';

import styles from './styles';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import React, {useState, useEffect} from 'react';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { getSMAccount } from '../../../../../src/graphql/queries';


export interface SMAccount {
  SMAc: {
    id: string,
    senderPhn: string,
    recPhn: string,
    RecName: string,
    SenderName: string,
    amount: number,
    description: string,
    owner: string,
    createdAt: string,
    attendingAdmin: string
  }
}


const SMCvLnStts = (props: SMAccount) => {
  const {
    SMAc: {
      id,
      senderPhn,
      recPhn,
      RecName,
      SenderName,
      amount,
      description,
      owner,
      createdAt,
      attendingAdmin
    }
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const SndChmMmbrMny = () => {
    navigation.navigate("B2BPayCashB2BBen", { id });
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

  const updtCashSale = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await client.graphql({
        query: updateBizSlsReq,
        variables: {
          input: {
            id: id,
            status: "Declined"
          }
        }
      });
    } catch (error) {
      if (error) {
        return;
      }
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.card}>
        <Text style={styles.prodName}>
          {/*loaner details */}
          Hi! Kindly approve this cash payment to {RecName} business
          amounting to  {formatAmountSync(Math.floor(amount), userCode, ratesMap)}. More about the payment is
          as follows: {description}. Thank you.
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={SndChmMmbrMny}
          style={styles.loanFriendButton}
        >
          <Text>Approve</Text>
        </Pressable>

        <Pressable
          onPress={updtCashSale}
          style={styles.redeemButton}
        >
          <Text>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SMCvLnStts;
