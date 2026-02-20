import { useNavigation } from '@react-navigation/native';
import { Alert, Text, TouchableOpacity } from 'react-native';

import React, {useEffect, useState} from 'react';
import styles from './styles';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { deleteRafikiLnAd, deleteSokoAd } from '../../../src/graphql/mutations';

export interface SMAccount {
  SMAc: {
    rafikiName: string,
    id: string,
    rafikicntct: string,
    rafikiEmail: string,
    rafikiamnt: number,
    rafikiprcntg: number,
    rafikidesc: string,
    rafikirpymntperiod: number,
  }
}

const client = generateClient();

const ViewSMDeposts = (props: SMAccount) => {
  const {
    SMAc: {
      rafikiName,
      rafikicntct,
      id,
      rafikiamnt,
      rafikidesc,
      rafikiprcntg,
      rafikirpymntperiod,
    }
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

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

 

  const DeleteSlsAd = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await client.graphql({
        query: deleteRafikiLnAd,
        variables: {
          input: { id: id }
        }
      });
    } catch (error) {
      console.log(error);
      if (error) {
        Alert.alert("Check your internet");
        return;
      }
    }
    setIsLoading(false);
    Alert.alert("Ad deleted. Refresh to load other ads");
  };

  return (
    <TouchableOpacity
      onPress={DeleteSlsAd}
      style={styles.pageContainer}>

      <Text style={styles.prodInfo}><Text style={styles.label}>Loaner Name:</Text> {rafikiName}</Text>
      <Text style={styles.prodInfo}><Text style={styles.label}>Loaner Contact:</Text> {rafikicntct}</Text>
      <Text style={styles.prodInfo}><Text style={styles.label}>Loan Amount:</Text> {formatAmountSync((rafikiamnt), userCode, ratesMap)}</Text>

    </TouchableOpacity>
  );
};

export default ViewSMDeposts;
