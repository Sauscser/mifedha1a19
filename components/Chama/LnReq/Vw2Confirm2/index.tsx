import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { deleteReqLoan, deleteReqLoanChama, updateReqLoan, updateReqLoanChama } from '../../../../src/graphql/mutations';
import { StyleSheet, Dimensions } from 'react-native';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../src/graphql/queries';

import styles from './styles';

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
        query: updateReqLoanChama,
        variables: {
          input: {
            id: id,
            WithdrawCnfrmtn: "YES"
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  return (
    <Pressable onPress={updtRecAc2} style={styles.pageContainer}>
      <Text style={styles.prodInfo}>
        {/*loaner details */}
        Hi! it's {loaneeName}. Kindly Loan me {formatAmountSync(Math.floor(amount), userCode, ratesMap)}. I
        commit to repay at a compound interest of {repaymentAmt}% per year within {repaymentPeriod} days.
        You can reach me through {loaneePhone}. {status}
      </Text>
    </Pressable>
  );
};

export default SMCvLnStts;
