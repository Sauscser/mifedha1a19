import { useNavigation } from '@react-navigation/native';
import React, { useState , useEffect} from 'react';
import {View, Text,   ScrollView, Pressable} from 'react-native';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';


import styles from './styles';
import { TouchableOpacity } from 'react-native-gesture-handler';


export interface SMAccount {
    SMAc: {
      id:string,
      loaneeEmail:string,
      loaneePhone:string,
      amount:number,
      repaymentAmt:number,
      repaymentPeriod:number,
      loaneeName:string,
      installmentAmount:number,
      paymentFrequency:number,
    }}

const SMCvLnStts = (props:SMAccount) => {
   const {
      SMAc: {
        loaneeEmail,
        loaneePhone,
        amount,
        repaymentAmt,
        repaymentPeriod,
        loaneeName,
        installmentAmount,
        paymentFrequency,
        id,
   }} = props ;

   const[isLoading, setIsLoading] = useState(false);
   const navigation = useNavigation();
   

   const SndChmMmbrMny = () => {
       navigation.navigate("PalPalLn", {id})

   }

   const SndChmMmbrMny2 = () => {
    navigation.navigate("DeclPalLn", {id})

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

                  
                       
                      <View >
                      <Text style = {styles.card}>                       
                       {/*loaner details */}   
                      Hi! it's {loaneeName}. Kindly Loan me Ksh. {formatAmountSync(amount, userCode, ratesMap)}. I 
                      commit to repay at a compound interest of {repaymentAmt}% per year within {repaymentPeriod} days. 
                      Each Installment is {installmentAmount} after every {paymentFrequency} days.
                      You can reach me through {loaneePhone}.       
                    </Text>
                    </View>  
                     
                    <View style = {styles.buttonRow}>
                    
                    <Pressable
                      onPress={SndChmMmbrMny}
                      style = {styles.loanFriendButton}
                      >            
                        <Text>Accept</Text>            
                    </Pressable>
                   
                   
                    <Pressable
                      onPress={SndChmMmbrMny2}
                      style = {styles.redeemButton}>            
                        <Text>Decline</Text>            
                    </Pressable>  
                   
                     
                    </View>
            </View>
            
                
        
    );
}; 

export default SMCvLnStts