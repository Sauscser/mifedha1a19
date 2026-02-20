import React, { useState, useEffect } from 'react';
import Communications from 'react-native-communications';
import { updateCompany, updateSMAccount, updateCvrdGroupLoans, updateGroup, updateChamaMembers, createMessages, sendNotification } from '../../../../src/graphql/mutations';
import { getCompany, getSMAccount, getCvrdGroupLoans, getGroup, getChamaMembers } from '../../../../src/graphql/queries';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import { formatAmountSync } from '../../../../src/utils/exchange';
import { nationalityToCode } from '../../../../src/utils/nationalityToCode';
import {useExchange} from '../../../../src/contexts/ExchangeContext';

import styles from './styles';
const client = generateClient();
const BLChmCovLoanee = () => {
  const navigation = useNavigation();
  const route = useRoute();
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


  const gtCompDtls = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const userInfo = await getCurrentUser();
      const attrs = await fetchUserAttributes();

      // 1️⃣ Fetch company details
      const companyResult: any = await client.graphql({
        query: getCompany,
        variables: {
          AdminId: "BaruchHabaB'ShemAdonai2"
        }
      });
      const company = companyResult.data.getCompany;
      const {
        ttlChmLnsInBlTymsCov,
        ttlChmLnsInBlAmtCov,
        userClearanceFee,
        ttlBLUsrs
      } = company;

      // 2️⃣ Fetch loan details
      const loanResult: any = await client.graphql({
        query: getCvrdGroupLoans,
        variables: {
          loanID: route.params.loanID
        }
      });
      const loan = loanResult.data.getCvrdGroupLoans;
      const {
        loaneePhn,
        grpContact,
        amountExpectedBack,
        amountRepaid,
        lonBala,
        interest,
        dfltUpdate,
        crtnDate,
        repaymentPeriod,
        status: loanStatus,
        memberId,
        DefaultPenaltyChm,
        paymentFrequency,
        installmentAmount
      } = loan;

      // 3️⃣ Calculate days up to date
      const today = new Date();
      const daysUpToDate = Date.now() / (1000 * 60 * 60 * 24);
      const tmDif = (daysUpToDate - dfltUpdate) / (1000 * 60 * 60 * 24);
      const tmDif2 = daysUpToDate - crtnDate / (1000 * 60 * 60 * 24);

      // 4️⃣ Loan balances
      const netLnBal = amountExpectedBack - amountRepaid;
      const LonBal1 = netLnBal * Math.pow(1 + parseFloat(interest) / 36500, tmDif2);
      const MmbrClrnceCosts = parseFloat(userClearanceFee) * amountExpectedBack + parseFloat(DefaultPenaltyChm);
      const LonBal4 = LonBal1 + MmbrClrnceCosts;
      const LonBal5 = LonBal1 + parseFloat(DefaultPenaltyChm);

      // 5️⃣ Fetch group details
      const groupResult: any = await client.graphql({
        query: getGroup,
        variables: {
          grpContact
        }
      });
      const group = groupResult.data.getGroup;
      const {
        grpName,
        tymsChmHvBL,
        objectionStatus,
        TtlBLLonsTmsLnrChmCov,
        TtlBLLonsAmtLnrChmCov
      } = group;

      // 6️⃣ Fetch loanee details
      const loaneeResult: any = await client.graphql({
        query: getSMAccount,
        variables: {
          awsemail: loaneePhn
        }
      });
      const loanee = loaneeResult.data.getSMAccount;
      const {
        acStatus,
        name: loaneeName,
        TtlBLLonsAmtLneeChmCov,
        TtlActvLonsAmtLneeChmCov
      } = loanee;

      // 7️⃣ Fetch member details
      const memberResult: any = await client.graphql({
        query: getChamaMembers,
        variables: {
          ChamaNMember: memberId
        }
      });
      const member = memberResult.data.getChamaMembers;
      const LnBalsss = member.LnBal;

      // 8️⃣ Validation checks
      if (parseFloat(lonBala) === 0) {
        Alert.alert("Loanee has cleared this loan");
        return;
      }
      if (acStatus === "AccountInactive") {
        Alert.alert("Loanee account has been deactivated");
        return;
      }
      if (objectionStatus === "Objected") {
        Alert.alert("Operations on this group have been stopped");
        return;
      }
      if (tmDif < parseFloat(paymentFrequency)) {
        Alert.alert("Time to Blacklist is not yet");
        return;
      }

      // ✅ Core logic
      if (tmDif2 > parseFloat(paymentFrequency) && amountRepaid < LonBal1 && tmDif2 < repaymentPeriod && loanStatus !== "LoanBL") {
        await applyPartialPenalty();
      } else if (tmDif2 > repaymentPeriod && loanStatus !== "LoanBL") {
        await blacklistLoan();
      } else if (parseFloat(paymentFrequency) < tmDif && loanStatus === "LoanBL") {
        await updateBlacklistedLoan();
      } else {
        Alert.alert("Retry or update app or call customer care");
      }

      // -------------------
      // Helper functions
      // -------------------

      async function applyPartialPenalty() {
        await updateCvrdGroupLoansAPI({
          amountExpectedBackWthClrnc: LonBal5.toFixed(0),
          lonBala: LonBal5.toFixed(0),
          dfltUpdate: daysUpToDate,
          blOfficer: attrs.email,
          DefaultPenaltyChm2: DefaultPenaltyChm.toFixed(0)
        });
        Alert.alert(`${grpName}, you have penalised ${loaneeName}`);

        await client.graphql({
                query: createMessages,
                variables: {
                  input: {
                    senderEmail: loanee.awsemail,
                    messageBody: `Hi ${loaneeName}, your loan of ID ${route.params.loanID} has been penalised after blacklisting by ${grpName}. Total repayable: Ksh. ${formatAmountSync(Math.floor(LonBal5), userCode, ratesMap)}.`
                  }
                }
              });
              await client.graphql({
                query: sendNotification,
                variables: {
                  riderEmail: loanee.awsemail,
                  title: 'MiFedha: Group Loan Penalty',
                  body: `You have been penalised for your loan of ID ${route.params.loanID} by ${grpName}. Total repayable: Ksh. ${formatAmountSync(Math.floor(LonBal5), userCode, ratesMap)}.`
                }
              });

  }
      async function blacklistLoan() {
        await updateCvrdGroupLoansAPI({
          amountExpectedBackWthClrnc: LonBal4.toFixed(0),
          lonBala: LonBal4.toFixed(0),
          status: "LoanBL",
          dfltUpdate: daysUpToDate,
          clearanceAmt: MmbrClrnceCosts.toFixed(0),
          blOfficer: attrs.email,
          DefaultPenaltyChm2: DefaultPenaltyChm.toFixed(0)
        });
        await client.graphql({
          query: updateChamaMembers,
          variables: {
            input: {
              ChamaNMember: memberId,
              LnBal: (parseFloat(LnBalsss) + MmbrClrnceCosts).toFixed(0),
              blStatus: "AccountBlackListed"
            }
          }
        });
        await client.graphql({
          query: updateSMAccount,
          variables: {
            input: {
              awsemail: loaneePhn,
              TtlBLLonsAmtLneeChmCov: (parseFloat(TtlBLLonsAmtLneeChmCov) + MmbrClrnceCosts).toFixed(0),
              TtlActvLonsAmtLneeChmCov: (parseFloat(TtlActvLonsAmtLneeChmCov) + parseFloat(userClearanceFee) * amountExpectedBack).toFixed(0),
              blStatus: "AccountBlackListed",
              loanStatus: "LoanActive"
            }
          }
        });
        await client.graphql({
          query: updateGroup,
          variables: {
            input: {
              grpContact,
              tymsChmHvBL: parseFloat(tymsChmHvBL) + 1,
              TtlBLLonsTmsLnrChmCov: parseFloat(TtlBLLonsTmsLnrChmCov) + 1,
              TtlBLLonsAmtLnrChmCov: (parseFloat(TtlBLLonsAmtLnrChmCov) + (parseFloat(userClearanceFee) * amountExpectedBack + parseFloat(DefaultPenaltyChm))).toFixed(0)
            }
          }
        });
        await client.graphql({
          query: updateCompany,
          variables: {
            input: {
              AdminId: "BaruchHabaB'ShemAdonai2",
              ttlChmLnsInBlTymsCov: parseFloat(ttlChmLnsInBlTymsCov) + 1,
              ttlChmLnsInBlAmtCov: (parseFloat(ttlChmLnsInBlAmtCov) + parseFloat(userClearanceFee) * amountExpectedBack).toFixed(0),
              ttlBLUsrs: parseFloat(ttlBLUsrs) + 1
            }
          }
        });

        // Notify loanee
        await client.graphql({
          query: createMessages,
          variables: {
            input: {
              senderEmail: loaneePhn,
              messageBody: `MiFedha: Hi ${loaneeName}, your loan of ID ${route.params.loanID} has been blacklisted by ${grpName}. Total repayable: Ksh. ${formatAmountSync(Math.floor(LonBal4), userCode, ratesMap)}.`
            }
          }
        });
        await client.graphql({
          query: sendNotification,
          variables: {
            riderEmail: loaneePhn,
            title: 'MiFedha: Loan Blacklisted',
            body: `Hi ${loaneeName}, your loan of ID ${route.params.loanID} has been blacklisted by ${grpName}. Total repayable: Ksh. ${formatAmountSync(Math.floor(LonBal4), userCode, ratesMap)}.`
          }
        });
        Alert.alert(`${grpName}, you have blacklisted ${loaneeName}`);
      }
      async function updateBlacklistedLoan() {
        await updateCvrdGroupLoansAPI({
          amountExpectedBackWthClrnc: LonBal5.toFixed(0),
          lonBala: LonBal5.toFixed(0),
          status: "LoanBL",
          dfltUpdate: daysUpToDate,
          blOfficer: attrs.email,
          DefaultPenaltyChm2: DefaultPenaltyChm.toFixed(0)
        });
        await client.graphql({
          query: updateChamaMembers,
          variables: {
            input: {
              ChamaNMember: memberId,
              LnBal: (parseFloat(LnBalsss) + parseFloat(userClearanceFee) * amountExpectedBack).toFixed(0),
              blStatus: "AccountBlackListed"
            }
          }
        });
        await client.graphql({
          query: updateSMAccount,
          variables: {
            input: {
              awsemail: loaneePhn,
              TtlBLLonsAmtLneeChmCov: (parseFloat(TtlBLLonsAmtLneeChmCov) + parseFloat(userClearanceFee) * amountExpectedBack).toFixed(0),
              TtlActvLonsAmtLneeChmCov: (parseFloat(TtlActvLonsAmtLneeChmCov) + parseFloat(userClearanceFee) * amountExpectedBack).toFixed(0),
              blStatus: "AccountBlackListed",
              loanStatus: "LoanActive"
            }
          }
        });
        Alert.alert(`${grpName}, you have penalised after blacklisting ${loaneeName}`);
        Communications.textWithoutEncoding(loaneePhn, `Hi ${loaneeName}, your loan of ID ${route.params.loanID} has been penalised after blacklisting by ${grpName}. Total repayable: Ksh. ${LonBal5.toFixed(0)}.`);
      }

      // General helper to update loan
      async function updateCvrdGroupLoansAPI(updateFields: any) {
        await client.graphql({
          query: updateCvrdGroupLoans,
          variables: {
            input: {
              loanID: route.params.loanID,
              ...updateFields
            }
          }
        });
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error! Access denied!");
    } finally {
      setIsLoading(false);
    }
  };
  return <View style={styles.image}>
      <ScrollView>
        <TouchableOpacity onPress={gtCompDtls} style={styles.sendLoanButton}>
          <Text style={styles.sendLoanButtonText}>Click to Black List</Text>
          {isLoading && <ActivityIndicator size="large" color="blue" />}
        </TouchableOpacity>
      </ScrollView>
    </View>;
};
export default BLChmCovLoanee;