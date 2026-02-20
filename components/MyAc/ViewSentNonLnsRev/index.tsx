import { useNavigation } from '@react-navigation/core';
import React, {useEffect, useState} from 'react';
import {View, Text,  Pressable,  } from 'react-native';
import styles from './styles';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { getSMAccount } from '../../../src/graphql/queries';
import {fetchUserAttributes} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';


export interface SMAccount {
  SMAc: {
    id: string,
    SenderName: string,
    recPhn: string,
    RecName: string,
    amount: number,
    description: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    nationality?: string,
  }
}

const SMNonLnSnt = (props: SMAccount) => {
  const {
    SMAc: {
      id,
      recPhn,
      RecName,
      SenderName,
      amount,
      description,
      status,
      createdAt,
      updatedAt,
      nationality,
    }
  } = props;

  const navigation = useNavigation();
  const SndChmMmbrMny = () => {
    navigation.navigate('SendNonLonsRev', { id });
  };

  const code = nationalityToCode(nationality);

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
    <View style={styles.pageContainer}>
      <Pressable onPress={SndChmMmbrMny} style={styles.card}>
        <Text style={styles.prodName}>
          {/*loaner details */}
          {RecName}
        </Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Transaction ID:</Text> {id}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Amount:</Text> {formatAmountSync(amount, userCode, ratesMap)}</Text>
        <Text style={styles.prodInfo}><Text style={styles.label}>Created At:</Text> {createdAt}</Text>
      </Pressable>
    </View>
  );
};


export default SMNonLnSnt