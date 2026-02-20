import { useNavigation } from '@react-navigation/native';
import {View, Text, ScrollView} from 'react-native';
import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { getSMAccount } from '../../../../../src/graphql/queries';

import { generateClient } from 'aws-amplify/api';


export interface MmbrContriInfo {
   memberContriDtls: {
     id: string,
     grpContact: string,
     
     SenderName:string,
     memberId:string,
     amountSent: number,
   
     description: string,
   
     status: string,
     createdAt:string,
     
   }}

const MmbrContriInfo = (props:MmbrContriInfo) => {
  const {
     memberContriDtls: {
        id,
        grpContact,
        memberId,
        SenderName,
        status,
        amountSent,
        createdAt,       
        description,
      
      
  }} = props ;

  const navigation = useNavigation;

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
       <Text style={styles.prodInfo}><Text style={styles.label}>Transaction ID: </Text> {id}</Text>
       <Text style={styles.prodInfo}><Text style={styles.label}> Member Chama ID: </Text> {memberId}</Text>
       <Text style={styles.prodInfo}><Text style={styles.label}> Chama Name:</Text> {SenderName}</Text>
       <Text style={styles.prodInfo}><Text style={styles.label}> Amount: </Text> {formatAmountSync(Math.floor(amountSent), userCode, ratesMap)}</Text>
       <Text style={styles.prodInfo}><Text style={styles.label}> Time Sent :</Text> {createdAt}</Text>
       <Text style={styles.prodDesc}>{description}</Text>
     </View>
     </View>
               
       
   );
}; 

export default MmbrContriInfo