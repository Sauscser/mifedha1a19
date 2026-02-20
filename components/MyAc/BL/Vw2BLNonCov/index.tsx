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


export interface SMCvLnSttus {
    Loanee: {
        id:string,
        loaneePhn: string,
        
        lonBala: number,
        createdAt:string,
        loaneename:string,
        
        
    }}

const SMCvLnStts = (props:SMCvLnSttus) => {
   const {
    Loanee: {
    id,
    loaneePhn,
    
    lonBala,
    createdAt,
    loaneename,
    
   }} = props ;

   const navigation = useNavigation();
   const SndChmMmbrMny = () => {
       navigation.navigate("BListSMLneeNonCovs", {id})
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
        <Pressable 
       onPress={SndChmMmbrMny}
       style = {styles.container}>  
            
            <View style = {{alignItems:"center"}}>
            <Text style = {styles.loanAdvert}>                       
                       {/*loaner details */}   
                       {loaneename}               
                    </Text>
            </View>
                  
            
           
                    <Text style = {styles.ownerName}>                       
                       {/*loaner details */}   
                       Loan Id: {id}                 
                    </Text>
                    <Text style = {styles.ownerName}>                       
                       {/*loaner details */}   
                       Loanee Contact: {loaneePhn}                 
                    </Text>
                    <Text style ={styles.amountoffered}>                       
                       {/* amount*/} 
                       Loan Balance : {formatAmountSync(lonBala, userCode, ratesMap)}
                    </Text>   

                    <Text style = {styles.amountoffered}>                       
                       {/*loaner details */}  
                     Time given: {createdAt}                
                    </Text>                       
        
        </Pressable>
    );
}; 

export default SMCvLnStts