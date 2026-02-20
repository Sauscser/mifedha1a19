import {View, Text,    ScrollView} from 'react-native';

import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';


export interface ChmCvLnSttusSent {
    Loaner: {
      loanID:string,
        loaneeName: string,
        amountGiven: number,
        amountExpectedBack: number,
        amountRepaid: number,
        lonBala: number,
        repaymentPeriod: number,
        advRegNu: string,
        status: string,
        description: string,
        loaneePhn:string,
        memberId:string,
        createdAt:string,
        updatedAt:string,
        grpContact:string,
        amountExpectedBackWthClrnc:number,
        crtnDate: number,
      interest:number,
      clearanceAmt:number,
      DefaultPenaltyChm2: number
        
    }}

const ChmCvLnSttsSent = (props:ChmCvLnSttusSent) => {
   const {
    Loaner: {
      loanID,
      amountExpectedBackWthClrnc,
    amountGiven,
    amountExpectedBack,
    amountRepaid,
    lonBala,
    repaymentPeriod,
    advRegNu,
    status,
    loaneeName,
    memberId,
    description,
    loaneePhn,
    grpContact,
    createdAt,
    updatedAt,
    crtnDate,
         interest,
         clearanceAmt,
    DefaultPenaltyChm2,
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


              const dayselapsed = (crtnDate - daysElapsed) *(-1)

              const netLnBal = amountExpectedBack - amountRepaid
      
              const netLnBal2 = (netLnBal) * 
              ((Math.pow(1 + (interest)/36500, daysElapsed)))

              const LonBal1 = netLnBal2 + (clearanceAmt) +  (DefaultPenaltyChm2)


    return (
        <View style = {styles.pageContainer}>              
            <View style = {styles.card}>

               <Text style={styles.prodName}>{loaneeName}</Text>

        <Text style={styles.prodInfo}><Text style={styles.label}>Loan Id:</Text> {loanID}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Member Chama ID:</Text> {memberId}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Amount Given:</Text> {formatAmountSync(amountGiven, userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Amount Repaid:</Text> {formatAmountSync(amountRepaid, userCode, ratesMap)}</Text>
       
       <Text style={styles.prodInfo}><Text style={styles.label}>Loan Balance with penalties:</Text> {formatAmountSync(LonBal1, userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Repayment Period in days:</Text> {repaymentPeriod}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Member Contact:</Text> {loaneePhn}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Advocate Registration Number:</Text> {advRegNu}</Text>
      
        <Text style={styles.prodInfo}><Text style={styles.label}>Loan Status:</Text> {status}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Time Loan was taken:</Text> {createdAt}</Text>
       
     <Text style={styles.prodDesc}>{description}</Text>
                    
                    
        </View>
                
        </View>
    );
}; 

export default ChmCvLnSttsSent