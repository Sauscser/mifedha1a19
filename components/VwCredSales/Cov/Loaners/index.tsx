import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text,  Pressable,  } from 'react-native';
import styles from './styles';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';


export interface ChmCvLnSttusRec {
   Loanee: {
     id: string,
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
       
   }}

const CredByrCvLnStts = (props:ChmCvLnSttusRec) => {
  const {
   Loanee: {
     id,
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


   return (
       <View style = {styles.pageContainer}>              
            <View style = {styles.card}>
            <Text style = {styles.prodName}>                       
                       {/*loaner details */}   
                       {SellerName}               
                    </Text>

            <Text style={styles.prodInfo}><Text style={styles.label}>Transaction ID:</Text> {id}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Cash Price:</Text> {formatAmountSync(amountSold, userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Credit Sale Price:</Text> {formatAmountSync(amountexpectedBack, userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Amount Repaid:</Text> {formatAmountSync(amountRepaid, userCode, ratesMap)}</Text>
           <Text style={styles.prodInfo}><Text style={styles.label}>Loan Balance:</Text> {formatAmountSync(lonBala, userCode, ratesMap)}</Text>
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