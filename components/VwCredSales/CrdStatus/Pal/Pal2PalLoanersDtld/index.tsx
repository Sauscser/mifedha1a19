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
 
     sellerContact: string,
     
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
     crtnDate: number,
      interest:number,
      amountExpectedBackWthClrnc:number,
      DefaultPenaltyCredSl2:number,
      clearanceAmt:number
       
   }}

const CredByrCvLnStts = (props:ChmCvLnSttusRec) => {
  const {
   Loanee: {
      loanID,
     itemName,
     
     sellerContact,
     
     SellerName,
  
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
     interest,
     amountExpectedBackWthClrnc,
      DefaultPenaltyCredSl2,
      clearanceAmt,
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

  const dayselapsed = (crtnDate - daysUpToDate) *(-1)
  const netLnBal = (amountExpectedBackWthClrnc) - 
  (clearanceAmt) -  (DefaultPenaltyCredSl2)

  const netLnBal2 = (netLnBal) * 
  ((Math.pow(1 + (interest)/36500, dayselapsed)))

  const LonBal1 = netLnBal2 + (clearanceAmt) +  (DefaultPenaltyCredSl2)




   return (
       
       <View style = {styles.pageContainer}>              
           <View style = {styles.card}>
           <Text style = {styles.prodName}>                       
                      {/*loaner details */}   
                      {SellerName}               
                   </Text>
          
          <Text style={styles.prodInfo}><Text style={styles.label}>Loan ID:</Text> {loanID}</Text>
         <Text style={styles.prodInfo}><Text style={styles.label}>Cash Price:</Text> {formatAmountSync(Math.floor(amountSold), userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Credit Sale Price:</Text> {formatAmountSync(Math.floor(amountexpectedBack), userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Amount Repaid:</Text> {formatAmountSync((amountRepaid), userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Loan Balance with Penalties:</Text> {formatAmountSync(Math.floor(LonBal1), userCode, ratesMap)}</Text>
                 <Text style={styles.prodInfo}><Text style={styles.label}>Repayment Period in days:</Text> {repaymentPeriod}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Seller Contact:</Text> {sellerContact}</Text>
             <Text style={styles.prodInfo}><Text style={styles.label}>Advocate Registration Number:</Text> {advregnu}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Item Name(s):</Text> {itemName}</Text>
             <Text style={styles.prodInfo}><Text style={styles.label}>Loan Status:</Text> {status}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Created At:</Text> {createdAt}</Text>
            <Text style={styles.prodDesc} > {description} </Text>     
                   
                   </View>               
       </View>
       
   );
}; 

export default CredByrCvLnStts