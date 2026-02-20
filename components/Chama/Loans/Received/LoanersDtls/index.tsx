import { View, Text } from 'react-native';
import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';

export interface SMCvLnSttus {
  Loanee: {
    loanID: string;
    loaneePhn: string;
    amountGiven: number;
    amountExpectedBack: number;
    amountExpectedBackWthClrnc: number;
    amountRepaid: number;
    lonBala: number;
    repaymentPeriod: number;
    loanerName: string;
    status: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    crtnDate: number; // timestamp in ms
    interest: number;
    clearanceAmt: number;
    DefaultPenaltyChm2: number;
    advRegNu: string;
  };
}

const SMCvLnStts = (props: SMCvLnSttus) => {
  const {
    Loanee: {
      loanID,
      loaneePhn,
      amountGiven,
      amountExpectedBack,
      amountExpectedBackWthClrnc,
      amountRepaid,
      lonBala,
      repaymentPeriod,
      loanerName,
      createdAt,
      updatedAt,
      status,
      description,
      crtnDate,
      interest,
      clearanceAmt,
      DefaultPenaltyChm2,
      advRegNu,
    },
  } = props;

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

  // ✅ Correct days elapsed
  const now = Date.now(); // current timestamp in ms
  const daysElapsed = (now - crtnDate) / (1000 * 60 * 60 * 24); // ms → days

  // ✅ Loan balance with interest
  const netLnBal = amountExpectedBack - amountRepaid;
  const netLnBal2 = netLnBal * Math.pow(1 + interest / 36500, daysElapsed);
  const LonBal1 = netLnBal2 + clearanceAmt + DefaultPenaltyChm2;

  return (
    <View style={styles.pageContainer}>
      <View style={styles.card}>
        <Text style={styles.prodName}>{loanerName}</Text>

        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Loan Id:</Text> {loanID}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Amount Given:</Text> {formatAmountSync(amountGiven, userCode, ratesMap)}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Amount Repaid:</Text> {formatAmountSync(amountRepaid, userCode, ratesMap)}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Loan Balance with penalties:</Text> {formatAmountSync(Math.floor(LonBal1), userCode, ratesMap)}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Repayment Period in days:</Text> {repaymentPeriod}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Member Contact:</Text> {loaneePhn}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Advocate Registration Number:</Text> {advRegNu}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Loan Status:</Text> {status}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Time Loan was taken:</Text> {createdAt}
        </Text>

        <Text style={styles.prodDesc}>{description}</Text>
      </View>
    </View>
  );
};

export default SMCvLnStts;
