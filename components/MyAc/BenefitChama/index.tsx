import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text,  ScrollView, Pressable} from 'react-native';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import styles from './styles';


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
      NonLoanAcBal:number,
      ttlNonLonAcBal: number,
      AcStatus: string,
      loanStatus: string,
      blStatus: string,
      createdAt:string,
      memberChmBenefit:number,
      
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
         NonLoanAcBal,
         memberChmBenefit,
         createdAt,       
         AcStatus,
       
       
   }} = props ;

       const client = generateClient();
       const [Uzer, setUzer] = useState<string>(null);
       const [userNationality, setUserNationality] = useState<string>(null);
       const userCode = nationalityToCode(userNationality);
       const {ratesMap} = useExchange();
   

   const navigation = useNavigation();

   const BenefitChama = () => {
      navigation.navigate("SendNLBnftChm", {ChamaNMember})
   }

   const BenefitChmSenderOnly = () => {
      navigation.navigate("BenefitChmSenderOnly")
   }

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

        <Text style={styles.prodInfo}><Text style={styles.label}>GroupName:</Text> {groupName}</Text>
           
            <Text style={styles.prodInfo}><Text style={styles.label}> Chama Benefits Earned:</Text> {formatAmountSync (memberChmBenefit, userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}> Group Contact:</Text> {groupContact}</Text>
            
              </View>

              <View style = {styles.buttonRow}>
              <Pressable
                onPress={BenefitChama}
                style = {styles.loanFriendButton}
                >            
                  <Text style = {styles.buttonText}>Benefit</Text>            
              </Pressable>
              
              
              <Pressable
                onPress={BenefitChmSenderOnly}
                style = {styles.loanFriendButton}>            
                  <Text style = {styles.buttonText}>Dont Benefit</Text>            
              </Pressable>  
             
              </View>
  </View>
        
    );
}; 

export default ChmMbrShpInfo