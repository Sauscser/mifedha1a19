import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text, ImageBackground, Pressable, TextInput, ScrollView} from 'react-native';
import styles from './styles';

import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../src/graphql/queries';
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
        dfltUpdate:number,
        crtnDate:number,
        amountExpectedBackWthClrncs:number,
        clearanceAmts:number,
        DefaultPenaltySM2s:number,
        interest:number
        
        
    }}

const SMCvLnStts = (props:SMCvLnSttus) => {
   const {
    Loanee: {
        loanID,
    
    lonBala,
    
    loanername,
    dfltUpdate,
        crtnDate,
        amountExpectedBackWthClrncs,
        clearanceAmts,
        DefaultPenaltySM2s,
        interest
    
   }} = props ;

   const navigation = useNavigation();

   const SndChmMmbrMny = () => {
       navigation.navigate("RpyPal2Pal", {loanID})
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

   const today = new Date();
              let hours = (today.getHours() < 10 ? '0' : '') + today.getHours();
              let minutes = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
              let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
              let years = (today.getFullYear() < 10 ? '0' : '') + today.getFullYear();
              let months = (today.getMonth() < 10 ? '0' : '') + today.getMonth();
              let months2 = parseFloat(months)
              let days = (today.getDate() < 10 ? '0' : '') + today.getDate();
              
              const now:any = years+ "-"+ "0"+months2 +"-"+ days+"T"+hours + ':' + minutes + ':' + seconds;

              const now1:any = "2024-05-20";
             
              const curYrs = parseFloat(years)*365;
              const curMnths = (months2)*30.4375;
              const daysUpToDate = curYrs + curMnths + parseFloat(days)

             

              

              const tmDif = daysUpToDate - dfltUpdate;
              const tmDif2 = daysUpToDate - crtnDate;




              const netLnBal = (amountExpectedBackWthClrncs) - 
              (clearanceAmts) -  (DefaultPenaltySM2s)
      
              const netLnBal2 = (netLnBal) * 
              ((Math.pow(1 + (interest)/36500, tmDif2)))

              const LonBal12 = (netLnBal2 + (clearanceAmts) +  (DefaultPenaltySM2s)).toFixed(0)
             const LonBal1 = parseFloat(LonBal12)
    return (
         <View style = {styles.pageContainer}>
        <Pressable 
        onPress={SndChmMmbrMny}
        style = {styles.card}>             
            
            

            <Text style={styles.prodInfo}><Text style={styles.label}>Loaner Name:</Text> {loanername}</Text>           
           <Text style={styles.prodInfo}><Text style={styles.label}>Loan ID:</Text> {loanID}</Text>           
           <Text style={styles.prodInfo}><Text style={styles.label}>Loan Balances:</Text> {formatAmountSync(LonBal1, userCode, ratesMap)}</Text>

                        
                    </Pressable>
                     </View>
        
    );
}; 

export default SMCvLnStts