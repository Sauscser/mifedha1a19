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
      benefitsID:string,
benefactorAc: string,
benefactorPhone: string,
beneficiaryPhone:string,
beneficiaryAc:string,
prodName: string,
creatorName: string,
prodCost: number,
prodDesc: string,
createdAt: string,
amount: number,
beneficiaryType:string

    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        id ,
        beneficiaryType,
        benefactorAc,
        beneficiaryPhone,
        creatorName,
        beneficiaryAc,
        benefactorPhone,
        prodDesc,
        createdAt,
        amount,
        benefitsID
    
   }} = props ;

   const navigation = useNavigation();
   
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

        <Text style={styles.prodInfo}><Text style={styles.label}>Contribution ID:</Text> {id}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Benefactor Account:</Text> {benefactorAc}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Contributor Account:</Text> {beneficiaryType}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}> Contributor Name:</Text> {benefitsID}</Text>

        <Text style={styles.prodInfo}><Text style={styles.label}>Product Creator Account:</Text> {beneficiaryPhone}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Contribution Amount:</Text> {formatAmountSync(amount, userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Contribution Time:</Text> {createdAt}</Text>

</View>
       </View> 

    );
}; 

export default SMCvLnStts