import { useNavigation } from '@react-navigation/native';

import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import styles from './styles'; // adjust path as necessary
import { updateBizna, updateLinkBeneficiary2 } from '../../../../src/graphql/mutations';
import { getLinkBeneficiary2, getSMAccount } from '../../../../src/graphql/queries';

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import React, {useState, useEffect} from 'react';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';
import { formatAmountSync } from '../../../../src/utils/exchange';

export interface SMAccount {
  SMAc: {
    beneficiaryID: string;
    benefactorAc: string;
    benefactorPhone: string;
    beneficiaryPhone: string;
    prodName: string;
    creatorName: string;
    prodCost: number;
    prodDesc: string;
    createdAt: string;
    benefitsAmount: number;
    benefitsID: string;
    beneficiaryAc: string;
    benefitStatus: string;
    beneficiaryType: string;
  };
}

const client = generateClient();

const SMCvLnStts = ({ SMAc }: SMAccount) => {
  const {
    beneficiaryID,
    benefactorAc,
    benefactorPhone,
    beneficiaryPhone,
    prodName,
    creatorName,
    beneficiaryType,
    prodCost,
    prodDesc,
    benefitsAmount,
    beneficiaryAc,
    benefitStatus
  } = SMAc;

  const navigation = useNavigation();
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

  const VwBenefactorContriDtls = () => {
    navigation.navigate("VwBenefactorContriDtls", {
      benefactorAc,
      benefactorPhone,
      beneficiaryAc,
    });
  };

  const updtSendrAc = async () => {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();

    if (isLoading) {
      return;
    } else {
      setIsLoading(true);
    }

    try {
      const result2: any = await client.graphql({
        query: getLinkBeneficiary2,
        variables: { beneficiaryID }
      });

      const usrDtlz: any = await client.graphql({
        query: getSMAccount,
        variables: { awsemail: attributes.email }
      });

      const userDtl = usrDtlz.data.getSMAccount;

      const benefitStatusz = result2.data.getLinkBeneficiary2.benefitStatus;
      const benefitsAmountz = result2.data.getLinkBeneficiary2.benefitsAmount;
      const owners = result2.data.getLinkBeneficiary2.owner;

      const now = new Date();
      const currentDate = now.toLocaleDateString();
      const currentTime = now.toLocaleTimeString();
      const dateTime = `${currentDate} ${currentTime}`;

      if (owners !== userDtl.name) {
        Alert.alert("You are not the owner of this Business");
      } else if (benefitsAmountz === 0) {
        Alert.alert("Benefits at zero");
      } else {
        const result: any = await client.graphql({
          query: updateLinkBeneficiary2,
          variables: {
            input: {
              beneficiaryID,
              benefitStatus: benefitStatusz + ", Redeemed at KES " + benefitsAmount + " on " + dateTime,
              benefitsAmount: 0
            }
          }
        });

        const updateResult = result?.data?.updateLinkBeneficiary2;

        if (updateResult) {
          Alert.alert("Successful! Beneficiary may collect item");
        } else {
          Alert.alert("Redemption was unsuccessful");
        }
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert("Update app or call customer care");
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.card}>
        <Text style={styles.prodName}>{prodName}</Text>

        <Text style={styles.prodInfo}><Text style={styles.label}>Benefactor Name:</Text> {creatorName}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Beneficiary Phone:</Text> {beneficiaryPhone}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Status:</Text> {benefitStatus}</Text>

        <Text style={styles.prodInfo}><Text style={styles.label}>Cost:</Text> {formatAmountSync(Math.floor(prodCost), userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Benefits Pooled:</Text> {formatAmountSync(Math.floor(benefitsAmount), userCode, ratesMap)}</Text>
        <Text style={styles.prodDesc}>{prodDesc}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable onPress={VwBenefactorContriDtls} style={styles.loanFriendButton}>
          <Text style={styles.buttonText}>View My Contributions</Text>
        </Pressable>

        <Pressable onPress={updtSendrAc} style={styles.loanFriendButton}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Redeem Benefits</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default SMCvLnStts;
