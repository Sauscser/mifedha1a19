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
benefitStatus:string,
prodName: string,
creatorName: string,
prodCost: number,
prodDesc: string,
createdAt: string,
amount:number,
benefitsID:string

    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        id ,
        benefactorAc,
        benefactorPhone,
        beneficiaryPhone,
        prodName,
        creatorName,
        prodCost,
        prodDesc,
        benefitStatus,
        amount,
        benefitsID
    
   }} = props ;

   const navigation = useNavigation();
   
   const VwBenefactorContriDtls = () => {
    navigation.navigate("VwBenefactorContriDtls", 
      {benefactorAc, benefactorPhone, creatorName, prodName})
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
       <Text style={styles.prodInfo}><Text style={styles.label}>ProdCost:</Text> {formatAmountSync(prodCost, userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Contributer:</Text> {benefitsID}</Text>
       <Text style={styles.prodInfo}><Text style={styles.label}>Contributions Amount:</Text> {formatAmountSync(amount, userCode, ratesMap)}</Text>
       
       
       <Text style={styles.prodDesc}>{prodDesc}</Text>                   
        </View >      
       </View> 

    );
}; 

export default SMCvLnStts