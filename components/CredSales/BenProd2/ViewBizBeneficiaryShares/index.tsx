import { useNavigation } from '@react-navigation/native';
import {View, Text,   ScrollView, Pressable} from 'react-native';


import styles from './styles';

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import React, {useState, useEffect} from 'react';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { getSMAccount } from '../../../../src/graphql/queries';


export interface SMAccount {
    SMAc: {
      id: string,
benefactorAc: string,
benefactorPhone: string,
beneficiaryPhone:string,
prodName: string,
creatorName: string,
prodCost: number,
prodDesc: string,
createdAt: string,
benefitsAmount:number,
beneficiaryAc:string,
benefitStatus:string,
beneficiaryType:string

    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        id ,
        benefitStatus,
        beneficiaryAc,
        benefactorAc,
        benefactorPhone,
        beneficiaryPhone,
        prodName,
        creatorName,
        beneficiaryType,
        prodCost,
        prodDesc,
        benefitsAmount
    
   }} = props ;

   const navigation = useNavigation();
   
   const VwBenefactorContriDtls = () => {
    navigation.navigate("VwBeneficiaryContriDtls", 
      {beneficiaryAc, 
        benefactorAc, 
      
        prodName}
    )
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
        <Text style={styles.prodInfo}><Text style={styles.label}>Benefactor Name:</Text> {creatorName}</Text>
          <Text style={styles.prodInfo}><Text style={styles.label}>Benefactor Account:</Text> {benefactorAc}</Text>
       <Text style={styles.prodInfo}><Text style={styles.label}>Product Creator Account:</Text> {benefactorPhone}</Text>
      <Text style={styles.prodInfo}><Text style={styles.label}>Beneficiary Name:</Text> {beneficiaryPhone}</Text>
         <Text style={styles.prodInfo}><Text style={styles.label}>Status:</Text> {benefitStatus}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Cost:</Text> {formatAmountSync(Math.floor(prodCost), userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Benefits Pooled:</Text> {formatAmountSync((benefitsAmount), userCode, ratesMap)}</Text>
       <Text style={styles.prodDesc}>{prodDesc}</Text> 
                        
                    
        </View >
        <View style = {styles.buttonRow}>

<Pressable
onPress={VwBenefactorContriDtls}
style = {styles.loanFriendButton}
>            
  <Text>View My Contributions</Text>            
</Pressable>
</View>   


</View>
     
    );
}; 

export default SMCvLnStts