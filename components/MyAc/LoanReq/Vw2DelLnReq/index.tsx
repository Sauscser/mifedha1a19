import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { deleteReqLoan, updateReqLoan } from '../../../../src/graphql/mutations';
import { generateClient } from 'aws-amplify/api';
import { StyleSheet, Dimensions } from 'react-native';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import styles from './styles';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface SMAccount {
  SMAc: {
    id: string,
    status: string,
    loaneePhone: string,
    amount: number,
    repaymentAmt: number,
    repaymentPeriod: number,
    loaneeName: string,
  }
}

const client = generateClient();

const SMCvLnStts = (props: SMAccount) => {
  const {
    SMAc: {
      status,
      loaneePhone,
      amount,
      repaymentAmt,
      repaymentPeriod,
      loaneeName,
      id
    }
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const SndChmMmbrMny = () => {
    navigation.navigate("RepyChmNonCovLns", { id });
  };

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
         
         

  const updtRecAc2 = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await client.graphql({
        query: deleteReqLoan,
        variables: {
          input: {
            id: id,
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.pageContainer}>
      <Pressable onPress={updtRecAc2} style={styles.card}>
        <Text style={styles.prodName}>
          {/*loaner details */}
          Hi! it's {loaneeName}. Kindly Loan me  {formatAmountSync(amount, userCode, ratesMap)}. I
          commit to repay at a compound interest of {repaymentAmt}% per year within {repaymentPeriod} days.
          You can reach me through {loaneePhone}. {status}
        </Text>
      </Pressable>
    </View>
  );
};

export default SMCvLnStts;
