import { useNavigation } from '@react-navigation/core';

import styles from './styles';

import React, {useEffect, useState} from 'react';
import {View, Text,  Pressable,  } from 'react-native';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';



export interface SMCvLnSttus {
    Loanee: {
      loanID:string,
        loaneePhn: string,
        
        lonBala: number,
        createdAt:string
        loaneename:string,
        
    }}

const SMCvLnStts = (props:SMCvLnSttus) => {
   const {
    Loanee: {
      loanID,
    loaneePhn,
    
    lonBala,
    createdAt,
    loaneename,
   
   }} = props ;

   const navigation = useNavigation()

   
   const SndChmMmbrMny = () => {
      navigation.navigate("BLPal2Pal", {loanID})
   }

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
      
      <View style = {styles.pageContainer}>
      <Pressable 
       onPress={SndChmMmbrMny}
       style = {styles.card}>  
            <Text style={styles.prodInfo}><Text style={styles.label}>Loanee Name:</Text> {loaneename}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Loan ID:</Text> {loanID}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}> Loanee Contact:</Text> {loaneePhn}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}> Loan Balance:</Text> {formatAmountSync(lonBala, userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Time Loan was given:</Text> {createdAt}</Text>
            
        </Pressable>
        </View>

    );
}; 

export default SMCvLnStts