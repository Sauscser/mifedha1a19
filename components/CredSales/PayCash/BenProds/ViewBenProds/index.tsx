import { useNavigation } from '@react-navigation/native';
import {View, Text,   ScrollView, Pressable} from 'react-native';


import styles from './styles';

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import React, {useState, useEffect} from 'react';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { getSMAccount } from '../../../../../src/graphql/queries';


export interface SMAccount {
    SMAc: {
      id: string,
benefactorAc: string,
benefactorPhone: string,
prodName: string,
creatorName: string,
prodCost: number,
prodDesc: string,
createdAt: string
    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        id ,
        benefactorAc,
        benefactorPhone,
        prodName,
        creatorName,
        prodCost,
        prodDesc,
        createdAt
    
   }} = props ;

   const navigation = useNavigation();
   

   const LinkPalBeneficiary = () => {
    navigation.navigate("LinkPalBeneficiary", {id});
  }

  const LinkBizBeneficiary = () => {
    navigation.navigate("LinkBizBeneficiary", {id});
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
        
             <View style = {styles.pageContainer}>
            <View style = {styles.card}>              
                <Text style={styles.prodInfo}><Text style={styles.label}>Product Creator:</Text> {creatorName}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Product Cost:</Text> {formatAmountSync(prodCost, userCode, ratesMap)}</Text>
                <Text style={styles.prodDesc}>{prodDesc}</Text> 
                        
                    
        </View >
        <View style = {styles.buttonRow}>       
         
<Pressable
onPress={LinkPalBeneficiary}
style = {styles.loanFriendButton}
>            
  <Text>Link Pal Beneficiary </Text>            
</Pressable>

<Pressable
onPress={LinkBizBeneficiary}
style = {styles.redeemButton}>            
  <Text>Link Biz Beneficiary </Text>            
</Pressable>  
</View>
</View>
       
    );
}; 

export default SMCvLnStts