import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text, ImageBackground, Pressable, TextInput, ScrollView} from 'react-native';
import styles from './styles';

import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';


export interface SMCvLnSttus {
    Loanee: {
        loanID:string,
        loaneePhn: string,
        amountgiven: number,
        amountexpected: number,
        amountrepaid: number,
        lonBala: number,
        repaymentPeriod: number,
        advregnu: string,
        loanername:string,
        status: string,
        description: string,
        createdAt:string,
        updatedAt:string,
        
    }}

const SMCvLnStts = (props:SMCvLnSttus) => {
   const {
    Loanee: {
        loanID,
    
    lonBala,
    
    loanername,
    
   }} = props ;

   const navigation = useNavigation();

   const SndChmMmbrMny = () => {
       navigation.navigate("RepayCovLnss", {loanID})
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
        <View 
       
        style = {styles.container}>             
            
            <View style = {{alignItems:"center"}}>
            <Text style = {styles.loanAdvert}>                       
                       {/*loaner details */}   
                       {loanername}               
                    </Text>
            </View>
           
                        
            <Text style = {styles.ownerName}>                       
                       {/*loaner details */}   
                       Loan Id: {loanID}                 
                    </Text>
                   
                    <Text style ={styles.amountoffered}>                       
                       {/* amount*/} 
                       Loan Balance (Ksh): {formatAmountSync(lonBala, userCode, ratesMap)}
                    </Text>                      
                    </View>
    );
}; 

export default SMCvLnStts