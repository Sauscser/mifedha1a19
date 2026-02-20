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



export interface SMAccount {
    SMAc: {
      rafikiName: string,
      
      rafikicntct: string,  
      rafikiEmail:string,
      
      rafikiamnt:number,
      rafikiprcntg:number
      rafikidesc:string,
      rafikirpymntperiod:number,
              
    }}

const ViewSMDeposts = (props:SMAccount) => {
   const {
      SMAc: {
         
         rafikiName,  
         rafikicntct,
         rafikiEmail,
         rafikiamnt,
         rafikidesc,  
         rafikiprcntg,
         rafikirpymntperiod,

                 
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
              
            
              <View style={styles.card}>           
                       
            <Text style={styles.prodInfo}><Text style={styles.label}>Loaner Name:</Text> {rafikiName}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Loaner Contact:</Text> {rafikicntct}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Loaner Email:</Text> {rafikiEmail}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Loan Amount:</Text> {formatAmountSync(Math.floor(rafikiamnt), userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Repayment days:</Text> {rafikirpymntperiod.toLocaleString()}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Annual Percentage Rate:</Text> {rafikiprcntg.toLocaleString()}</Text>
            <Text style={styles.prodDesc}>{rafikidesc}</Text>            
                   
        </View>
                
        </View>
    );
}; 

export default ViewSMDeposts