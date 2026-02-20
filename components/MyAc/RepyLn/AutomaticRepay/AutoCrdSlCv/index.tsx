import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text, ImageBackground, Pressable, TextInput, ScrollView} from 'react-native';
import styles from './styles';

import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

     
     export interface ChmCvLnSttusRec {
         Loanee: {
            loanID: string,
           itemName: string,
           itemSerialNumber: string,
           buyerContact: string,
           
           SellerName:string,
        
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
            loanID,
           
           SellerName,
        
           lonBala,
         
        }} = props ;
        const navigation = useNavigation();
     
        const SndChmMmbrMny = () => {
           navigation.navigate("RpayCredSlrCovs", {loanID})
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
           <View 
           
           style = {styles.container}>            
                 <View style = {{alignItems:"center"}}>
                 <Text style = {styles.loanAdvert}>                       
                            {/*loaner details */}   
                            {SellerName}               
                         </Text>
                 </View>
                 
                          <Text style = {styles.ownerName}>                       
                            {/*loaner details */}   
                            Loan Id: {loanID}                 
                         </Text>
                         
     
                         <Text style = {styles.interest}>                       
                            {/* interest*/}
                            Loan Balance(Ksh): {formatAmountSync(lonBala, userCode, ratesMap)}                    
                         </Text> 
                         
             
                     
             </View>
         );
     }; 
     
     export default CredSlrCvLnStts
     