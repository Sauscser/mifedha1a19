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


export interface ChmCvLnSttusRec {
    Loanee: {
      loanID: string,
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
      crtnDate: number,
      interest:number,
      amountExpectedBackWthClrnc:number,
      DefaultPenaltyCredSl2:number,
      clearanceAmt:number
        
    }}

const CredSlrCvLnStts = (props:ChmCvLnSttusRec) => {
   const {
    Loanee: {
      loanID,
      amountExpectedBackWthClrnc,
      DefaultPenaltyCredSl2,
      clearanceAmt,
      buyerContact,
      
      buyerName,
   
      amountSold,
      amountexpectedBack,
      amountRepaid,
      repaymentPeriod,
      lonBala,
      description,
      status,
      advregnu,
      createdAt,
      updatedAt,
      crtnDate,
         interest
   }} = props ;


    const navigation = useNavigation();
   const SndChmMmbrMny = () => {
      navigation.navigate ("VwMyBizLoaneesDtld", {loanID})
   }

   const VwRpayments = () => {
      navigation.navigate ("CredB2BReceived", {loanID})
   }

   const Blacklist = () => {
      navigation.navigate ("BLCredBiz2Biz", {loanID})
   }

   const WaiveBiz2Biz = () => {
      navigation.navigate ("WaiveBiz2Biz", {loanID})
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
      


   const today = new Date();
              let hours = (today.getHours() < 10 ? '0' : '') + today.getHours();
              let minutes = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
              let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
              let years = (today.getFullYear() < 10 ? '0' : '') + today.getFullYear();
              let months = (today.getMonth() < 10 ? '0' : '') + today.getMonth();
              let months2 = parseFloat(months)
              let days = (today.getDate() < 10 ? '0' : '') + today.getDate();
              
              const now:any = years+ "-"+ "0"+months2 +"-"+ days+"T"+hours + ':' + minutes + ':' + seconds;

              const curYrs = parseFloat(years)*365;
              const curMnths = (months2)*30.4375;
              const daysUpToDate = curYrs + curMnths + parseFloat(days)

              const dayselapsed = (crtnDate - daysUpToDate) *(-1)

              const netLnBal = (amountExpectedBackWthClrnc) - 
              (clearanceAmt) -  (DefaultPenaltyCredSl2)
      
              const netLnBal2 = (netLnBal) * 
              ((Math.pow(1 + (interest)/36500, dayselapsed)))

              const LonBal1 = netLnBal2 + (clearanceAmt) +  (DefaultPenaltyCredSl2)

   
    return (
        <View style = {styles.pageContainer}>              
            
            <Pressable onPress={SndChmMmbrMny} style = {styles.card}>
            <Text style = {styles.prodName}>                       
                       {/*loaner details */}   
                       Buyer Name: {buyerName}               
                    </Text>

               <Text style={styles.prodInfo}><Text style={styles.label}>Loan ID:</Text> {loanID}</Text>
               <Text style={styles.prodInfo}><Text style={styles.label}>Loan Balance with Penalties:</Text> {formatAmountSync(Math.floor(LonBal1), userCode, ratesMap)}</Text>
               <Text style={styles.prodInfo}><Text style={styles.label}>Buyer Contact:</Text> {buyerContact}</Text>
             
                    </Pressable>

                    <View style = {styles.buttonRow}>
                    <Pressable
                      onPress={VwRpayments}
                      style = {styles.loanFriendButton}
                      >            
                        <Text style = {styles.buttonText}>ViewRpymnts</Text>            
                    </Pressable>
                    
                    
                    <Pressable
                      onPress={WaiveBiz2Biz}
                      style = {styles.redeemButton}>            
                        <Text style = {styles.buttonText}>Waive</Text>            
                    </Pressable>  
                   
                  
                    <Pressable
                      onPress={Blacklist}
                      style = {styles.loanFriendButton}>            
                        <Text style = {styles.buttonText}>BL/Penalise</Text>            
                    </Pressable> 
                     
                    </View>
        </View>
    );
}; 

export default CredSlrCvLnStts