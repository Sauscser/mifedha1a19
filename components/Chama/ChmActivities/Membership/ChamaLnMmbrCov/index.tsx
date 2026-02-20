import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {Text,  Pressable,  } from 'react-native';

import styles from './styles';

import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import {fetchUserAttributes} from 'aws-amplify/auth';

import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../../src/graphql/queries';


export interface ChamaMmbrshpInfo {
    ChamaMmbrshpDtls: {
      id: string,
      
      memberName:string,
      
      
    }}

const ChmMbrShpInfo = (props:ChamaMmbrshpInfo) => {
   const {
      ChamaMmbrshpDtls: {
         id,
         
         memberName,
         
       
   }} = props ;

   const navigation = useNavigation();
    
   const SndChmMmbrMny = () => {
      navigation.navigate("ChmCovLons", {id})
   }
   
    return (
       <Pressable 
       onPress={SndChmMmbrMny}
       style = {styles.pageContainer}>          
         <Text style={styles.prodInfo}><Text style={styles.label}>Member Chama ID:</Text> {id}</Text>
         <Text style={styles.prodInfo}><Text style={styles.label}>Member Name:</Text> {memberName}</Text>
           
        </Pressable>
    );
}; 

export default ChmMbrShpInfo