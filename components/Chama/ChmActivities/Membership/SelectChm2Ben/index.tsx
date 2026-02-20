import { useNavigation } from '@react-navigation/core';
import {View, Text,  Pressable} from 'react-native';

import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../../src/graphql/queries';


export interface ChamaMmbrshpInfo {
    ChamaMmbrshpDtls: {
      MembaId: string,
      ChamaNMember: string,
      groupContact: string,
      
      groupName:string,
      GrossLnsGvn:number,
      LonAmtGven: number,
      AmtRepaid:number,
      LnBal: number,
      memberChmBenefit:number,
      
      AcStatus: string,
      loanStatus: string,
      blStatus: string,
      createdAt:string,
      
    }}

const ChmMbrShpInfo = (props:ChamaMmbrshpInfo) => {
   const {
      ChamaMmbrshpDtls: {
         MembaId,
         ChamaNMember,
         groupContact,
       
         groupName,
         loanStatus,
         blStatus,
         GrossLnsGvn,
         LonAmtGven,
         AmtRepaid,
         LnBal,
         memberChmBenefit,
         
         createdAt,       
         AcStatus,
       
       
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

   const navigation = useNavigation();
   const ViewMmberDtls = () => {
      navigation.navigate ("ChamaDtls", {ChamaNMember})
   }
   
    return (
      <View style = {styles.pageContainer}>              
      <View  style = {styles.card}>
         <Text style={styles.prodName}>{groupName}</Text>
         <Text style={styles.prodInfo}><Text style={styles.label}>Member Chama Number:</Text> {MembaId}</Text>
         <Text style={styles.prodInfo}><Text style={styles.label}> Group Benefits:</Text> {formatAmountSync(Math.floor(memberChmBenefit), userCode, ratesMap)}</Text>
         <Text style={styles.prodInfo}><Text style={styles.label}>Chama Phone:</Text> {groupContact}</Text>
         <Text style={styles.prodInfo}><Text style={styles.label}>Membership Status:</Text> {AcStatus}</Text>

          </View>      
        
      </View>
    );
}; 

export default ChmMbrShpInfo