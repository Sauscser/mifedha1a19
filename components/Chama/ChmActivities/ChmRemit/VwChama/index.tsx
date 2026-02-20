import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Communications from 'react-native-communications';
import { useNavigation } from '@react-navigation/core';




import React, {useEffect, useState} from 'react';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

import {
  updateGroupNonLoans,
  updateGroup,
  updateSMAccount,
  updateCompany,
  updateMiFedhaBankAdmin,
  updateChamaControlTable,
  updateChamaMembers
} from '../../../../../src/graphql/mutations';

import {
  getChamaMembers,
  getGroup,
  getCompany,
  getSMAccount,
  getMiFedhaBankAdmin,
  getChamaControlTable
} from '../../../../../src/graphql/queries';

import styles from './styles';

export interface ChamaRemitInfo {
  ChamaRemitDtls: {
    id: string;
    grpContact: string;
    recipientPhn: string;
    receiverName: string;
    memberId: string;
    amountSent: number;
    description: string;
    confirm1: string;
    confirm2: string;
    signatory2: string;
    signatory3: string;
    status: string;
    createdAt: string;
  };
}

const client = generateClient();

const ChmRemitInfo = ({ ChamaRemitDtls }: ChamaRemitInfo) => {
  const {
    id,
    confirm1,
    confirm2,
    memberId,
    recipientPhn,
    receiverName,
    status,
    amountSent,
    createdAt,
    description,
    signatory2,
    signatory3
  } = ChamaRemitDtls;

  const navigation = useNavigation();
  const [isLoading2, setIsLoading2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  

  // Signatory 2 confirmation
  const handleSignatory2 = async () => {
    setIsLoading(true);
    const attributes = await fetchUserAttributes();

    if (attributes.email !== signatory2) {
      Alert.alert("Unauthorised! You are not Signatory 2");
    } else if (confirm1 === "YES") {
      Alert.alert("You have already confirmed");
    } else {
      try {
        await client.graphql({
          query: updateGroupNonLoans,
          variables: { input: { id, confirm1: "YES" } }
        });
        Alert.alert("Signatory 2 confirmation successful!");
      } catch (error) {
        console.log(error);
        Alert.alert("Confirmation failed. Retry or update app");
      }
    }
    setIsLoading(false);
  };

  // Signatory 3 confirmation
  const handleSignatory3 = async () => {
    setIsLoading2(true);
    const attributes = await fetchUserAttributes();

    if (attributes.email !== signatory3) {
      Alert.alert("Unauthorised! You are not Signatory 3");
      setIsLoading2(false);
      return;
    } else if (confirm2 === "YES") {
      Alert.alert("You have already confirmed");
      setIsLoading2(false);
      return;
    } else if (confirm1 === "NO") {
      Alert.alert("Signatory 2 should first confirm");
      setIsLoading2(false);
      return;
    }

    try {
      // Fetch all necessary data and update balances
      const memberData: any = await client.graphql({
        query: getChamaMembers,
        variables: { ChamaNMember: memberId }
      });
      const member = memberData.data.getChamaMembers;

      const groupData: any = await client.graphql({
        query: getGroup,
        variables: { grpContact: member.groupContact }
      });
      const group = groupData.data.getGroup;

      const companyData: any = await client.graphql({
        query: getCompany,
        variables: { AdminId: "BaruchHabaB'ShemAdonai2" }
      });
      const company = companyData.data.getCompany;

      const receiverData: any = await client.graphql({
        query: getSMAccount,
        variables: { awsemail: member.memberContact }
      });
      const receiver = receiverData.data.getSMAccount;

      const bankAdminData: any = await client.graphql({
        query: getMiFedhaBankAdmin,
        variables: { nationalid: group.BankAdminAcNu }
      });
      const bankAdmin = bankAdminData.data.getMiFedhaBankAdmin;

      const controlData: any = await client.graphql({
        query: getChamaControlTable,
        variables: { id: "EQUITYTABLEID" }
      });
      const control = controlData.data.getChamaControlTable;

      // Calculate earnings
      const grossEarning = parseFloat(company.chmTransferFee) * amountSent;
      const bankAdminEarning = grossEarning * parseFloat(company.BankMifedhaSyncFee);
      const netCompanyEarning = grossEarning - bankAdminEarning;
      const totalTransaction = grossEarning + amountSent;

      // Validation checks
      if (group.status !== "AccountActive") { Alert.alert('Sender account is inactive'); setIsLoading2(false); return; }
      if (receiver.acStatus !== "AccountActive") { Alert.alert('Receiver account is inactive'); setIsLoading2(false); return; }
      if ((parseFloat(receiver.balance) + amountSent) > parseFloat(receiver.MaxAcBal)) { Alert.alert('Receiver wallet full'); setIsLoading2(false); return; }
      if (parseFloat(group.grpBal) < totalTransaction) { Alert.alert('Insufficient group balance'); setIsLoading2(false); return; }

      // Update confirmation
      await client.graphql({
        query: updateGroupNonLoans,
        variables: { input: { id, confirm2: "YES" } }
      });

      // Update sender group balances
      await client.graphql({
        query: updateGroup,
        variables: {
          input: {
            grpContact: member.groupContact,
            MemberDividendSync: (parseFloat(group.MemberDividendSync) + totalTransaction).toFixed(0),
            ttlNonLonsSentChm: (parseFloat(group.ttlNonLonsSentChm) + amountSent).toFixed(0),
            grpBal: (parseFloat(group.grpBal) - totalTransaction).toFixed(0)
          }
        }
      });

      // Update receiver balance
      await client.graphql({
        query: updateSMAccount,
        variables: {
          input: {
            awsemail: member.memberContact,
            balance: (parseFloat(receiver.balance) + amountSent).toFixed(0)
          }
        }
      });

      // Update company
      await client.graphql({
        query: updateCompany,
        variables: {
          input: {
            AdminId: company.AdminId,
            companyEarningBal: (parseFloat(company.companyEarningBal) + netCompanyEarning).toFixed(0),
            companyEarning: (parseFloat(company.companyEarning) + netCompanyEarning).toFixed(0),
            ttlNonLonssSentChm: (parseFloat(company.ttlNonLonssSentChm) + amountSent).toFixed(0)
          }
        }
      });

      // Update bank admin
      await client.graphql({
        query: updateMiFedhaBankAdmin,
        variables: {
          input: {
            nationalid: group.BankAdminAcNu,
            BankAdmBal: (parseFloat(bankAdmin.BankAdmBal) + bankAdminEarning).toFixed(0)
          }
        }
      });

      // Update control table
      await client.graphql({
        query: updateChamaControlTable,
        variables: {
          input: {
            id: "EQUITYTABLEID",
            DividendsEarnings: (parseFloat(control.DividendsEarnings) + bankAdminEarning).toFixed(0),
            BankAdminEarnings: (parseFloat(control.BankAdminEarnings) + bankAdminEarning).toFixed(0)
          }
        }
      });

      // Update member non-loan balance
      await client.graphql({
        query: updateChamaMembers,
        variables: {
          input: {
            ChamaNMember: memberId,
            NonLoanAcBal: (parseFloat(member.NonLoanAcBal) - amountSent).toFixed(0)
          }
        }
      });

      Alert.alert(`Amount ${formatAmountSync(Math.floor(amountSent), userCode, ratesMap)} sent successfully!`);
      Communications.textWithoutEncoding(receiver.phonecontact, `Hi ${receiver.name}, ${group.grpName} has sent you KES ${amountSent}. Contact the group admin if unclear.`);

    } catch (error) {
      console.log("Error!", error);
      Alert.alert("Error! Retry or update app");
    }

    setIsLoading2(false);
  };


  return (
    <View style={styles.pageContainer}>
      <View style={styles.card}>
        <Text style={styles.prodInfo}><Text style={styles.label}>Member Name: </Text>{receiverName}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Transaction ID: </Text>{id}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Amount: </Text> {formatAmountSync((amountSent), userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Time Sent: </Text>{createdAt}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Signatory 1 confirmation: </Text>{confirm1}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Signatory 2 confirmation: </Text>{confirm2}</Text>
        <Text style={styles.prodDesc}>{description}</Text>
      </View>

      <View style={styles.buttonRow}>
        <LinearGradient colors={['#e29d59', '#d18b4d']} style={styles.gradientButton}>
          <Pressable onPress={handleSignatory2} style={styles.pressableContent} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Signatory 2 Confirm</Text>}
          </Pressable>
        </LinearGradient>

        <LinearGradient colors={['#e29d59', '#d18b4d']} style={styles.gradientButton}>
          <Pressable onPress={handleSignatory3} style={styles.pressableContent} disabled={isLoading2}>
            {isLoading2 ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Signatory 3 Confirm</Text>}
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  );
};

export default ChmRemitInfo;
