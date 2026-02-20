import { useNavigation } from '@react-navigation/native';
import {View, Text,   ScrollView, Pressable} from 'react-native';


import styles from './styles';
import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../src/graphql/queries';

export interface SMAccount {
    SMAc: {
      groupContact:string,
      groupName:string,
      
      
    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        groupName,
        
        groupContact
   }} = props ;

   const[isLoading, setIsLoading] = useState(false);
   const navigation = useNavigation();
   

   const SndChmMmbrMny = () => {
       navigation.navigate("ChamaVw2GrantLnReqCov", {groupContact})

   }

   

    return (
        
                  
                  
            <Pressable onPress = {SndChmMmbrMny}
            style = {styles.pageContainer}
            >
        <Text style={styles.prodInfo}><Text style={styles.label}>Group Name:</Text> {groupName}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Group Contact:</Text> {groupContact}</Text>
              
            </Pressable>
            
                
        
    );
}; 

export default SMCvLnStts