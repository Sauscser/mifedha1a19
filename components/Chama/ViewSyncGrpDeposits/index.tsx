import { useNavigation } from '@react-navigation/native';
import {View, Text,   ScrollView, Pressable, Alert} from 'react-native';
import styles from './styles';
import { formatAmountSync } from '../../../src/utils/exchange';
import React, {useState, useEffect} from 'react';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';


export interface SMAccount {
    SMAc: {
      
      GrpAc: string,
     
      ChamaName: string,
      amount:number,
      createdAt: string
    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        GrpAc,
     
        ChamaName,
        amount,
        createdAt
        
   }} = props ;

   const navigation = useNavigation();
   const[isLoading, setIsLoading] = useState(false);

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
       <View style={styles.pageContainer}>
          <View style={styles.card}>
            <Text style={styles.prodInfo}><Text style={styles.label}>Group Name:</Text> {ChamaName}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Group Account:</Text> {GrpAc}</Text>
            {/* Replace KES with dynamic currency */}
            <Text style={styles.prodInfo}><Text style={styles.label}>Sync Amount:</Text> {formatAmountSync(Math.floor(amount), userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Time Synced:</Text> {createdAt}</Text>
          </View>
        </View> 

    );
}; 

export default SMCvLnStts