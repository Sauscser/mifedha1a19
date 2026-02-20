import { useNavigation } from '@react-navigation/native';
import {View, Text,    Pressable} from 'react-native';
import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';


export interface ChmNonCvLnSttusSent {
    Loaner: {
      loanID:string,
        loaneeName: string,
        amountGiven: number,
        amountExpectedBack: number,
        amountRepaid: number,
        lonBala: number,
        repaymentPeriod: number,
        loaneePhn:string,
        status: string,
        grpContact:string,
        memberId:string,
        description: string,
        loanername:string,
        createdAt:string,
        updatedAt:string,
        amountExpectedBackWthClrnc:number,
        crtnDate: number,
      interest:number,
      clearanceAmt:number,
      DefaultPenaltyChm2: number,
      
        
    }}

const ChmNonCvLnSttsSent = (props:ChmNonCvLnSttusSent) => {
   const {
    Loaner: {
      loanID,
    loaneePhn,
    clearanceAmt,
    DefaultPenaltyChm2,
    amountRepaid,
    lonBala,
    amountExpectedBackWthClrnc,
    amountExpectedBack,
    status,
    loaneeName,
    memberId,
    description,
    
    createdAt,
    updatedAt,
    crtnDate,
         interest
   }} = props ;

   const navigation = useNavigation();
   const SndChmMmbrMny = () => {
      navigation.navigate ("ChmLoaneesDtls", {loanID})
   }

   const VwRpayments = () => {
      navigation.navigate ("ViewNonLnsRecChm", {loanID})
   }

   const Blacklist = () => {
      navigation.navigate ("BLChmMmberCovs", {loanID})
   }

   const WaiveChmCov = () => {
      navigation.navigate ("WaiveChmCov", {loanID})
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

              const nows = Date.now(); // current timestamp in ms
  const daysElapsed = (nows - crtnDate) / (1000 * 60 * 60 * 24); // ms → days



              const netLnBal = amountExpectedBack - amountRepaid
      
              const netLnBal2 = (netLnBal) * 
              ((Math.pow(1 + (interest)/36500, daysElapsed)))

              const LonBal1 = netLnBal2 + (clearanceAmt) +  (DefaultPenaltyChm2)

   

   
    return (
      <View style = {styles.pageContainer}>   
      <Pressable onPress={SndChmMmbrMny} style = {styles.card}>
         <Text style={styles.prodInfo}><Text style={styles.label}>Loanee Name:</Text> {loaneeName}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Loan Id:</Text> {loanID}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Loanee Contact:</Text> {loaneePhn}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>loan Balance with penalties:</Text> {formatAmountSync(Math.floor(LonBal1), userCode, ratesMap)}</Text>
       
             
              </Pressable>

              <View style = {styles.buttonRow}>
              <Pressable
                      onPress={VwRpayments}
                      style = {styles.loanFriendButton}
                      >            
                        <Text style = {styles.buttonText}>ViewRpymnts</Text>            
                    </Pressable>
                    
                    
                    <Pressable
                      onPress={WaiveChmCov}
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

export default ChmNonCvLnSttsSent