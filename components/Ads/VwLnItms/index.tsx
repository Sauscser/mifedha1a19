import { useNavigation } from '@react-navigation/native';
import { Alert, Text, TouchableOpacity } from 'react-native';

import React, {useEffect, useState} from 'react';
import styles from './styles';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { deleteRafikiLnAd, deleteSokoAd } from '../../../src/graphql/mutations';



export interface SMAccount {
    SMAc: {
      sokokntct: string,
      
      id: string,
      sokoname:string,
      sokoprice: number,
      
    
      sokolnprcntg:number
      sokodesc:string,
      sokolpymntperiod:number,
              
    }}

const ViewSMDeposts = (props:SMAccount) => {
   const {
      SMAc: {
         
         sokokntct,  
         
         sokoname,
         sokoprice,
        
        id,
         sokodesc,  
         sokolnprcntg,
         sokolpymntperiod,

                 
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
   

   const navigation = useNavigation();
   const SndChmMmbrMny = () => {
      navigation.navigate ("DtldSalesInfo", {id})
   }
   
    return (
      <TouchableOpacity 
      onPress={SndChmMmbrMny}
      style = {styles.pageContainer}> 

      <Text style={styles.prodInfo}><Text style={styles.label}>Bizna Contact:</Text> {sokokntct}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Item Name:</Text> {sokoname}</Text>
           
            <Text style={styles.prodInfo}><Text style={styles.label}>Item Price:</Text> {formatAmountSync(Math.floor(sokoprice), userCode, ratesMap)}</Text>
            <Text style={styles.prodInfo}><Text style={styles.label}>Discount Percentage:</Text> {sokolnprcntg.toLocaleString()}</Text>
           <Text style={styles.prodDesc}>{sokodesc}</Text>   

                    </TouchableOpacity>
    );
}; 

export default ViewSMDeposts