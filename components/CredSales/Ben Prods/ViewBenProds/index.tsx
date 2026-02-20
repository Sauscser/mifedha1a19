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
   

   const SndChmMmbrMny = () => {
       navigation.navigate("PlaceLnReq")
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
        
                  
            
            <View style = {styles.container}>              
                       
                        
                     <Text style = {styles.ownerName}>                       
                       {/*loaner details */}   
                      Product Creator: {creatorName}                 
                    </Text>
                                        
                    <Text style = {styles.repaymentPeriod}>                       
                       {/* repaymentPeriod*/}
                      Product Cost: {formatAmountSync(Math.floor(prodCost), userCode, ratesMap)}                  
                    </Text> 
                   
                    <Text style = {styles.repaymentPeriod}>                       
                       {/* repaymentPeriod*/}
                      Phone: {benefactorPhone}                  
                    </Text> 

                    <Text style = {styles.repaymentPeriod}>                       
                       {/* repaymentPeriod*/}
                      More Description: {prodDesc}                  
                    </Text> 

        </View >
    );
}; 

export default SMCvLnStts