import { useNavigation } from '@react-navigation/native';
import { View, Text, Pressable } from 'react-native';
import styles from './styles';

import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';

export interface ChmCvLnSttusRec {
  Loanee: {
    loanID: string;
    grpContact: string;
    amountGiven: number;
    amountExpectedBack: number;
    amountExpectedBackWthClrnc: number;
    amountRepaid: number;
    lonBala: number;
    repaymentPeriod: number;
    advRegNu: string;
    status: string;
    description: string;
    LoanerName: string;
    createdAt: string;
    updatedAt: string;
    crtnDate: number; // timestamp in ms
    interest: number;
    clearanceAmt: number;
    DefaultPenaltyChm2: number;
  };
}

const ChmCvLnSttsRec = (props: ChmCvLnSttusRec) => {
  const {
    Loanee: {
      loanID,
      amountExpectedBack,
      clearanceAmt,
      DefaultPenaltyChm2,
      amountExpectedBackWthClrnc,
      amountRepaid,
      lonBala,
      repaymentPeriod,
      advRegNu,
      status,
      LoanerName,
      description,
      grpContact,
      createdAt,
      updatedAt,
      crtnDate,
      interest,
    },
  } = props;

  const navigation = useNavigation();

  const SndChmMmbrMny = () => {
    navigation.navigate('ChmLoanersDtls', { loanID });
  };

  const VwRpayments = () => {
    navigation.navigate('ViewNonLnsSntChm', { loanID });
  };

  const Repay = () => {
    navigation.navigate('RepyChmCovLns', { loanID });
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

  // ✅ Correct days elapsed calculation
  const now = Date.now(); // current timestamp in ms
  const daysElapsed = (now - crtnDate) / (1000 * 60 * 60 * 24); // ms → days

  // ✅ Loan balance with interest calculation
  const netLnBal = amountExpectedBack - amountRepaid;

  const netLnBal2 = netLnBal * Math.pow(1 + interest / 36500, daysElapsed);

  const LonBal1 = netLnBal2 + clearanceAmt + DefaultPenaltyChm2;

  return (
    <View style={styles.pageContainer}>
      <Pressable onPress={SndChmMmbrMny} style={styles.card}>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Group Name:</Text> {LoanerName}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Loan Id:</Text> {loanID}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Loan Balance with penalties:</Text>{' '}
          {formatAmountSync(Math.floor(LonBal1), userCode, ratesMap)}
        </Text>
      </Pressable>

      <View style={styles.buttonRow}>
        <Pressable onPress={VwRpayments} style={styles.loanFriendButton}>
          <Text>View Rpymnts</Text>
        </Pressable>

        <Pressable onPress={Repay} style={styles.loanFriendButton}>
          <Text>Repay</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ChmCvLnSttsRec;
