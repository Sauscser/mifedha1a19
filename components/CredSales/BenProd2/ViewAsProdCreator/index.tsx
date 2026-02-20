import { useNavigation } from '@react-navigation/native';
import {View, Text,   ScrollView, Pressable} from 'react-native';


import styles from './styles';

import { formatAmountSync } from '../../../../src/utils/exchange';
import React, {useState, useEffect} from 'react';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';


export interface SMAccount {
    SMAc: {
      id: string,
benefactorAc: string,
benefactorPhone: string,
beneficiaryPhone:string,
prodName: string,
benefitStatus: string,
prodCost: number,
prodDesc: string,
createdAt: string,
benefitsAmount:number,
beneficiaryAc:string
creatorName:string

    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        id ,
        benefactorAc,
        benefactorPhone,
        beneficiaryPhone,
        prodName,
        benefitStatus,
        creatorName,
        prodCost,
        prodDesc,
        benefitsAmount,
        beneficiaryAc
    
   }} = props ;

   const navigation = useNavigation();
   
   const VwBenefactorContriDtls = () => {
    navigation.navigate("VwBenCreatorContriDtls", 
      {benefactorAc, benefactorPhone, beneficiaryAc, prodName})
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
        <View style={styles.pageContainer}>
            <View style={styles.card}>
              <Text style={styles.prodName}>{prodName}</Text>
              <Text style={styles.prodInfo}><Text style={styles.label}>Beneficiary Name:</Text> {beneficiaryPhone}</Text>
              <Text style={styles.prodInfo}><Text style={styles.label}>Benefactor Name:</Text> {creatorName}</Text>
             <Text style={styles.prodInfo}><Text style={styles.label}>Cost:</Text> {formatAmountSync(Math.floor(prodCost), userCode, ratesMap)}</Text>
              <Text style={styles.prodInfo}><Text style={styles.label}>Status:</Text> {benefitStatus}</Text>
             
              <Text style={styles.prodInfo}><Text style={styles.label}>Benefits Pooled:</Text> {formatAmountSync(Math.floor(benefitsAmount), userCode, ratesMap)}</Text>
              <Text style={styles.prodDesc}>{prodDesc}</Text>
            </View >
            <View style = {styles.buttonRow}>

            <Pressable
              onPress={VwBenefactorContriDtls}
              style = {styles.loanFriendButton}>
              <Text>View Client's Contributions</Text>            
            </Pressable>

            </View>
       </View> 

        
                
       
    );
}; 

export default SMCvLnStts