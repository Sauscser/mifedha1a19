import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';

import styles from './styles';
import { createChamaDepositSync, createChamaDividendsSync, createChamaLoanSync, updateGroup } from '../../../src/graphql/mutations';
import { getGroup } from '../../../src/graphql/queries';
import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { generateClient } from 'aws-amplify/api';  
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';


export interface SMAccount {
  SMAc: {
    grpContact: string,
    grpName: string,
    signitoryContact: string,
    signitoryName: string,
    chamaBenSync: number
  }
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

const SMCvLnStts = (props: SMAccount & { onSyncComplete: () => void }) => {
  const {
    SMAc: { grpContact, grpName, signitoryContact, signitoryName, chamaBenSync },
    onSyncComplete,
  } = props;

  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);

  const MFBankAdmin = () => {
    navigation.navigate('SyncGrpBenefits');
  };

  const gtUsrDtls4AdminDtls = async () => {
    if (isLoading || isSynced) return;
    setIsLoading(true);

    try {
      const resp: any = await client.graphql({
        query: getGroup,
        variables: { grpContact }
      });
      if (!resp?.data?.getGroup) throw new Error("Group not found");

      const { BranchNu, SignatoryEmail, BankAdminEmail } = resp.data.getGroup;

      await client.graphql({
        query: updateGroup,
        variables: { input: { grpContact, chamaBenSync: 0 } }
      });

      await client.graphql({
        query: createChamaDepositSync,
        variables: {
          input: {
            amount: Number(chamaBenSync) || 0,
            GrpAc: grpContact,
            GrpAdmEmail: SignatoryEmail,
            BankAdminEmail,
            ChamaName: grpName,
            BankName: "Equity",
            BranchNu: BranchNu,
            transactionType: "chamaBenSync",
            status: "AccountActive",
          }
        }
      });

      setIsSynced(true);
      if (onSyncComplete) {
        onSyncComplete();
      }
      MFBankAdmin();
    } catch (error: any) {
      console.error("Sync error:", error);
      Alert.alert("Sync Failed", error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.card}>
        <Text style={styles.prodInfo}><Text style={styles.label}>Group Name:</Text> {grpName}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Group Account:</Text> {grpContact}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Group Admin Contact:</Text> {signitoryContact}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Group Admin Name:</Text> {signitoryName}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Sync Amount:</Text> {formatAmountSync(chamaBenSync, userCode, ratesMap)}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          onPress={gtUsrDtls4AdminDtls}
          style={[styles.loanFriendButton, isSynced && { backgroundColor: "gray" }]}
          disabled={isSynced || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="blue" />
          ) : (
            <Text>{isSynced ? "Synced" : "Click to sync"}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default SMCvLnStts;
