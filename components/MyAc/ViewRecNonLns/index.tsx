import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text, ImageBackground, Pressable, TextInput, ScrollView} from 'react-native';
import styles from './styles';

import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';


export interface SMAccount {
    SMAc: {
      id: string,
      
      senderPhn: string,  
      SenderName: string,
      amount: number,
      description: string, 
      status: string,
      createdAt:string,
      updatedAt:string,
              
    }}

const SMNonLnRec = (props:SMAccount) => {
   const {
      SMAc: {
         id,
         senderPhn,  
         SenderName,
         amount,
         description, 
         status,
         createdAt,
         updatedAt,
                 
   }} = props ;

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
            <View style = {styles.card}>

            <Text style={styles.prodInfo}><Text style={styles.label}>Sender Name:</Text> {SenderName}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Transaction ID: </Text> {id}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Amount:</Text> {formatAmountSync(amount, userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Sender Contact:</Text> {senderPhn}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Created At:</Text> {createdAt}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Type of Transaction:</Text> {status}</Text>
            <Text style={styles.prodDesc} > {description}</Text> 

                 </View>
                
        </View>
    );
}; 

export default SMNonLnRec