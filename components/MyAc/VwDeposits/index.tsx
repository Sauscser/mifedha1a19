import React, {useEffect, useState} from 'react';
import { View, Text } from 'react-native';
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
        depositerid: string,
        agContact: string,
        amount: number,
        agentName: string,
        createdAt: string,
        updatedAt: string,
        nationality?: string,
    }
}

const ViewSMDeposts = (props: SMAccount) => {
    const {
        SMAc: {
            id,
            depositerid,
            agContact,
            amount,
            agentName,
            createdAt,
            updatedAt,
            nationality,
        }
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

    return (
        <View style={styles.pageContainer}>
            <View style={styles.card}>
                <Text style={styles.prodName}>
                    {/*loaner details */}
                    {agentName}
                </Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Transaction ID:</Text> {id}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Amount:</Text> {formatAmountSync(amount, userCode, ratesMap)}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>MFNdogo Number:</Text> {agContact}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Created At:</Text> {createdAt}</Text>
            </View>
        </View>
    );
};

export default ViewSMDeposts