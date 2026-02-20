import React, {useEffect, useState} from 'react';
import { useNavigation, useRoute } from '@react-navigation/core';

import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatAmountSync } from '../../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../../src/contexts/ExchangeContext';
import {fetchUserAttributes} from 'aws-amplify/auth';

import { generateClient } from 'aws-amplify/api';  
import Communications from 'react-native-communications';
import {
  
  
  updateCompany,
  
  updateSMAccount,
  updateGroup,
  
  createGroupNonLoans,
  updateChamaMembers,
  updateMiFedhaBankAdmin,
  updateChamaControlTable,
  
} from '../../../../../src/graphql/mutations';

import {
  
  getChamaControlTable,
  getChamaMembers,
  getCompany,
  getGroup,
  
  getMiFedhaBankAdmin,
  
  getSMAccount,
  
} from '../../../../../src/graphql/queries';




import styles from './styles';


export interface ChamaMmbrshpInfo {
  ChamaMmbrshpDtls: {
    MembaId: string;
    ChamaNMember: string;
    memberContact: string;
    memberName: string;
    memberNatId: string;
    GrossLnsGvn: number;
    LonAmtGven: number;
    AmtRepaid: number;
    LnBal: number;
    NonLoanAcBal: number;
    ttlNonLonAcBal: number;
    AcStatus: string;
    loanStatus: string;
    blStatus: string;
    createdAt: string;
    subscriptionFrequency: number;
    subscriptionAmt: number;
    lateSubscriptionPenalty: number;
    ttlLateSubs: number;
    timeCrtd: number;
    subscribedAmt: number;
    totalSubAmt: number;
    
  };
}

const ChmMbrShpInfo = (props: ChamaMmbrshpInfo) => {
  const {
    ChamaMmbrshpDtls: {
      MembaId,
      ChamaNMember,
      memberNatId,
      memberContact,
      memberName,
      loanStatus,
      blStatus,
      GrossLnsGvn,
      LonAmtGven,
      AmtRepaid,
      LnBal,
      NonLoanAcBal,
      ttlNonLonAcBal,
      createdAt,
      AcStatus,
      subscribedAmt,
      totalSubAmt,
      subscriptionFrequency,
      subscriptionAmt,
      lateSubscriptionPenalty,
      ttlLateSubs,
      timeCrtd,
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

  const today = new Date();
  let hours = (today.getHours() < 10 ? '0' : '') + today.getHours();
  let minutes = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
  let seconds = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds();
  let years = today.getFullYear();
  let months = today.getMonth() + 1;
  let days = today.getDate();

  const curYrs = years * 365;
  const curMnths = months * 30.4375;
  const daysUpToDate = curYrs + curMnths + parseFloat(days.toString());
  const tmDif = daysUpToDate - timeCrtd;
  const subFreq = tmDif / subscriptionFrequency;
  const Amt2HvBnSub = subFreq * subscriptionAmt;
  const ttlArrears = (ttlLateSubs + Amt2HvBnSub).toFixed(0);

  const navigation = useNavigation();
   const [SenderNatId, setSenderNatId] = useState('');
    
    const [SnderPW, setSnderPW] = useState("");
    
    const [amounts, setAmount] = useState("");
    
    const [Desc, setDesc] = useState("");
   
    const[isLoading, setIsLoading] = useState(false);
   
    const route = useRoute();
  const Penalise = () => navigation.navigate('PenaliseMember', { ChamaNMember });
  const ViewMmberDtls = () => navigation.navigate('ChamaDtls', { ChamaNMember });
  const ViewSubs = () => navigation.navigate('VwMbrSubsDirectly', { ChamaNMember });
  const SendNonLoans = () => navigation.navigate('SndMbrsMnys', { ChamaNMember });

  const ApproveMembaTransport = async () => {
            if(isLoading){
              return;
            }
            setIsLoading(true);
            try{
              const approval =  await client.graphql ({
                query: updateChamaMembers,
                variables: {
                  input: {
             
                      ChamaNMember:ChamaNMember,
                      transportApproved:"ChamaTransportApprovedYes"
                    }
                  }}
                )
        if (approval?.data?.updateChamaMembers) 
        {
          Alert.alert("Transport approved")
        }
                
            }
            catch(error){if (error){
              Alert.alert("Disapproval unsuccessful; Retry")
              return
            } }
            setIsLoading(false);          
           
          } 
  
          const DisapproveMembaTransport = async () => {
                    if(isLoading){
                      return;
                    }
                    setIsLoading(true);
                    try{
                      const disapprove =  await client.graphql({
                        query: updateChamaMembers,
                        variables: {
                          input: {
                    
                              ChamaNMember:ChamaNMember,
                              transportApproved:"ChamaTransportApprovedNo"
                            }
                          }}
                        )
                if (disapprove?.data?.updateChamaMembers) 
        {
          Alert.alert("Transport disapproved successfully")
        }
                
                        
                    }
                    catch(error){if (error){
                      Alert.alert("Disapproval unsuccessful; Retry")
                      return
                    } }
                    setIsLoading(false);          
                    
                  } 
          
  return (
    <View style={styles.pageContainer}>
      <Pressable onPress={ViewMmberDtls} style={styles.card}>
        <Text style={styles.prodName}>{memberName}</Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Member Chama Number:</Text> {MembaId}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Subscription up to date:</Text> {formatAmountSync(Math.floor(subscribedAmt), userCode, ratesMap)}
        </Text>
        <Text style={styles.prodInfo}>
          <Text style={styles.label}>Subscription with Penalties:</Text> {formatAmountSync(Math.floor(parseFloat(ttlArrears)), userCode, ratesMap)}
        </Text>
      </Pressable>

    <View style={styles.buttonRow}>
  <LinearGradient colors={['#FFA500', '#FF8C00']} style={styles.gradientButton}>
    <Pressable onPress={ViewSubs} style={styles.pressableContent}>
      <Text style={styles.buttonText}>View Subscriptions</Text>
    </Pressable>
  </LinearGradient>

  <LinearGradient colors={['#00BFFF', '#1E90FF']} style={styles.gradientButton}>
    <Pressable onPress={Penalise} style={styles.pressableContent}>
      <Text style={styles.buttonText}>Penalise</Text>
    </Pressable>
  </LinearGradient>

  <LinearGradient colors={['#FFA500', '#FF8C00']} style={styles.gradientButton}>
    <Pressable onPress={SendNonLoans} style={styles.pressableContent}>
      <Text style={styles.buttonText}>SendNonLoans/Dividends</Text>
    </Pressable>
  </LinearGradient>

   <LinearGradient colors={['#FFA500', '#FF8C00']} style={styles.gradientButton}>
    <Pressable onPress={ApproveMembaTransport} style={styles.pressableContent}>
      <Text style={styles.buttonText}>Approve Transport</Text>
    </Pressable>
  </LinearGradient>

   <LinearGradient colors={['#FFA500', '#FF8C00']} style={styles.gradientButton}>
    <Pressable onPress={DisapproveMembaTransport} style={styles.pressableContent}>
      <Text style={styles.buttonText}>Disapprove Transport</Text>
    </Pressable>
  </LinearGradient>

</View>

    </View>
  );
};

export default ChmMbrShpInfo;
