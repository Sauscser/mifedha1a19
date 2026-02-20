import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text,  Pressable,  } from 'react-native';
import styles from './styles';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';


export interface ChmCvLnSttusRec {
    Loanee: {
      id: string,
      itemName: string,
     
      buyerContact: string,
      
      buyerName:string,
   
      amountSold: number,
      amountexpectedBack: number,
      amountRepaid: number,
      repaymentPeriod: number,
      lonBala:number,
      description: string,
      status: string,
      advregnu: string,
      createdAt:string,
      updatedAt:string,
        
    }}

const CredSlrCvLnStts = (props:ChmCvLnSttusRec) => {
   const {
    Loanee: {
      id,
      itemName,
      createdAt,
      buyerName,
   
      lonBala,
      
   }} = props ;
   const navigation = useNavigation();

   const SndChmMmbrMny = () => {
      navigation.navigate("BListCredByrCovs", {id})
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
           
            <Text style = {styles.prodName}>                       
                       {/*loaner details */}   
                       {buyerName}               
                    </Text>
           <Text style={styles.prodInfo}><Text style={styles.label}>Loan ID:</Text> {id}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Loan Balance:</Text> {formatAmountSync(lonBala, userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Item Name:</Text> {itemName}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Time loan was given:</Text> {createdAt}</Text>
           
        </Pressable>

        </View>
    );
}; 

export default CredSlrCvLnStts