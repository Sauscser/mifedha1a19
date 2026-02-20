import { useNavigation } from '@react-navigation/core';
import { Text,  Pressable,  } from 'react-native';

import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';


export interface ChamaMmbrshpInfo {
    ChamaMmbrshpDtls: {
      loanID: string,
      lonBala:number,
      LoanerName:string,
      memberId:string,
      
    }}

const ChmMbrShpInfo = (props:ChamaMmbrshpInfo) => {
   const {
      ChamaMmbrshpDtls: {
         loanID,
         lonBala,
         LoanerName,
         memberId
   }} = props ;

   const navigation = useNavigation();
    
   const SndChmMmbrMny = () => {
      navigation.navigate("RepyChmCovLns", {loanID})
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
       <Pressable 
       onPress={SndChmMmbrMny}
       style = {styles.pageContainer}>   

       <Text style={styles.prodInfo}><Text style={styles.label}>Group Name:</Text> {LoanerName}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Loan Id:</Text> {loanID}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Member Chama ID:</Text> {memberId}</Text>
      <Text style={styles.prodInfo}><Text style={styles.label}>loan Balance:</Text> {formatAmountSync((lonBala), userCode, ratesMap)}</Text>
            
        </Pressable>
    );
}; 

export default ChmMbrShpInfo