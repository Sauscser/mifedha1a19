import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text,  Pressable,  } from 'react-native';
import styles from './styles';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';



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
       <View style = {styles.container}>
      
                 
          
                     <Text style = {styles.ownerContact}>                       
                       {/*loaner details */}  
                       Loan ID: {loanID}                
                    </Text>  

                    <Text style = {styles.ownerContact}>                       
                       {/*loaner details */}  
                       Member Chama ID: {memberId}                
                    </Text>                                                  
                    <Text style = {styles.ownerContact}>                       
                       {/*loaner details */}  
                     Chama Name: {LoanerName}                
                    </Text>   
                    <Text style = {styles.ownerContact}>                       
                       {/*loaner details */}  
                     loan Balance Ksh: {formatAmountSync(lonBala, userCode, ratesMap)}                
                    </Text>  
                                
               
        </View>
    );
}; 

export default ChmMbrShpInfo