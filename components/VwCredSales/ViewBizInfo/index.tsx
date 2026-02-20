
import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text,  Pressable,  } from 'react-native';
import styles from './styles';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';


export interface ChmaInfo {
    ChmDtls: {
      
      BusKntct: string,
      netEarnings: number,
      busName: string,
      TtlEarnings: number,
      earningsBal: number
      benefitsAmount:number,
      description: string,
        
    }}

const ChmInfo = (props:ChmaInfo) => {
   const {
      ChmDtls: {
        
         benefitsAmount,
      netEarnings,
      busName,
      TtlEarnings,
      earningsBal,
      
      description,
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
                       Business Info          
                    </Text>
                

                   <Text style={styles.prodInfo}><Text style={styles.label}>Business Name:</Text> {busName}</Text>
                   <Text style={styles.prodInfo}><Text style={styles.label}>Business Balance:</Text> {formatAmountSync(Math.floor(netEarnings), userCode, ratesMap)}</Text>
                   <Text style={styles.prodInfo}><Text style={styles.label}>Pooled Benefits:</Text> {formatAmountSync(Math.floor(benefitsAmount), userCode, ratesMap)}</Text>
                   <Text style={styles.prodDesc} > {description} </Text>     
                     </View>
                
        </View>
    );
}; 

export default ChmInfo