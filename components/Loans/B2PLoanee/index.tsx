import {View, Text,    ScrollView} from 'react-native';
import styles from './styles';

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import React, {useState, useEffect} from 'react';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
import {useExchange} from '../../../src/contexts/ExchangeContext';
import { formatAmountSync } from '../../../src/utils/exchange';
import { getSMAccount } from '../../../src/graphql/queries';


export interface SMCvLnSttus {
    Loanee: {
      loanID:string,
        loaneePhn: string,
        amountgiven: number,
        amountexpected: number,
        amountrepaid: number,
        lonBala: number,
        repaymentPeriod: number,
        advregnu: string,
        loaneename:string,
        status: string,
        description: string,
        createdAt:string,
        updatedAt:string,
        amountExpectedBackWthClrnc: number,
        DefaultPenaltySM2:number,
        
    }}

const SMCvLnStts = (props:SMCvLnSttus) => {
   const {
    Loanee: {
      loanID,
    loaneePhn,
    amountgiven,
    amountexpected,
    amountrepaid,
    lonBala,
    repaymentPeriod,
    advregnu,
    amountExpectedBackWthClrnc,
    DefaultPenaltySM2,
    loaneename,
    status,
    description,
    createdAt,
    updatedAt,
   }} = props ;

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
        <View style = {styles.pageContainer}>              
            
            <View style = {styles.card}>
                <Text style={styles.prodName}>{loaneename}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Loan Id:</Text> {loanID}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Loanee Contact:</Text> {loaneePhn}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Amount Given:</Text> {formatAmountSync(Math.floor(amountgiven), userCode, ratesMap)}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Amount Expected Back:</Text> {formatAmountSync(Math.floor(amountexpected), userCode, ratesMap)}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Amount Repaid:</Text> {formatAmountSync(Math.floor(amountrepaid), userCode, ratesMap)}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Balance if Blacklisted:</Text> {formatAmountSync(Math.floor(amountExpectedBackWthClrnc), userCode, ratesMap)}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Loaner Blacklisting Penalty:</Text> {formatAmountSync(Math.floor(DefaultPenaltySM2), userCode, ratesMap)}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Loan Balance:</Text> {formatAmountSync(Math.floor(lonBala), userCode, ratesMap)}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Repayment Period in days:</Text> {repaymentPeriod}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Advocate Registration Number:</Text> {advregnu}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Loan Status:</Text> {status}</Text>
                <Text style={styles.prodInfo}><Text style={styles.label}>Time contract entered:</Text> {createdAt}</Text>
                
        </View>
        </View>
    );
}; 

export default SMCvLnStts