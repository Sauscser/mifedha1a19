import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';
import { ScrollView } from 'react-native-gesture-handler';
const MyLoanAccount = props => {
  const navigation = useNavigation();

  // Navigation functions for each button
  const SignIn2GrntLnReq = () => navigation.navigate('SignIn2GrntLnReq');
  const UpdateExRates = () => navigation.navigate('UpdateExRates2');

  const PalVw2GrantLnReq2 = () => navigation.navigate('PalVw2GrantLnReq2');
  const VwP2PMyLoaners = () => navigation.navigate('VwP2PMyLoaners');
  const VwP2PMyLoanees = () => navigation.navigate('VwP2PMyLoanees');
  const VwB2PMyLoaners = () => navigation.navigate('VwB2PMyLoaners');
  const SI2VwB2PLoanees = () => navigation.navigate('SI2VwB2PLoanees');
  const PalProdsRequest = () => navigation.navigate('PalProdsRequest');
  const SMDpsitsss = () => navigation.navigate('ElimDpstss');
  const ViewNonLnsRecs = () => navigation.navigate('ViewNonLnsRecs');
  const ViewNonLnsSents = () => navigation.navigate('ViewNonLnsSents');
  const SMWthdrwlsss = () => navigation.navigate('ElimWthdrwlss');
  const goWithdrwMny = () => navigation.navigate('WithdrawalOptions');
  const goToSMASndnonln = () => navigation.navigate('Vw2SelectChmBeneficiary');
  const LoanAds = () => navigation.navigate('LoanAds');
  const UpdateMainAc = () => navigation.navigate('UpdateMainAc');
  const SrchLoanAdz = () => navigation.navigate('SrchLoanAdz');
  const VwPlLn2Remove = () => navigation.navigate('VwPlLn2Remove');
  const BoostPalBenefits = () => navigation.navigate('BoostPalBenefits');
  const ViewBiznaShareRec = () => navigation.navigate('ViewBiznaShareRec');
  
  return <SafeAreaView style={{
    flex: 1
  }}>
      <ScrollView>
      <View style={styles.adminImage}>
        {/* Main Container */}
        <View style={styles.clientsView}>

          <View style={styles.viewForClientsPressables}>
            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={UpdateExRates}>
                <Text style={styles.clientsPressableText}>View Exchange Rates</Text>
              </Pressable>
            </LinearGradient>

           
          </View>
          
          {/* Loan Requests Section */}
          <Text style={styles.salesPressableText}>Loan Requests</Text>
          <View style={styles.viewForClientsPressables}>
            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={PalProdsRequest}>
                <Text style={styles.clientsPressableText}>Make Loan Requests</Text>
              </Pressable>
            </LinearGradient>

           
          </View>
          
            {/* Grant Loan Requests Section */}
          <Text style={styles.salesPressableText}>Grant Loan Requests</Text>
          <View style={styles.viewForClientsPressables}>
            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={SignIn2GrntLnReq}>
                <Text style={styles.clientsPressableText}>Biz2Pal</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={PalVw2GrantLnReq2}>
                <Text style={styles.clientsPressableText}>Pal2Pal</Text>
              </Pressable>
            </LinearGradient>
          </View>



          {/* BizLoanStatus Section */}
          <Text style={styles.salesPressableText}>BizLoanStatus</Text>
          <View style={styles.viewForClientsPressables}>
            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={SI2VwB2PLoanees}>
                <Text style={styles.clientsPressableText}>Company Loanees</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={VwB2PMyLoaners}>
                <Text style={styles.clientsPressableText}>Loaning Companies</Text>
              </Pressable>
            </LinearGradient>
          </View>

          {/* PalLoanStatus Section */}
          <Text style={styles.salesPressableText}>PalLoanStatus</Text>
          <View style={styles.viewForClientsPressables}>
            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={VwP2PMyLoanees}>
                <Text style={styles.clientsPressableText}>My Loanees</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={VwP2PMyLoaners}>
                <Text style={styles.clientsPressableText}>My Loaners</Text>
              </Pressable>
            </LinearGradient>
          </View>

           {/* Account */}
          <Text style={styles.salesPressableText}>Account</Text>
          <View style={styles.viewForClientsPressables}>
            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={SMDpsitsss}>
                <Text style={styles.clientsPressableText}>View Deposits</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={UpdateMainAc}>
                <Text style={styles.clientsPressableText}>Update Main Account</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={goToSMASndnonln}>
                <Text style={styles.clientsPressableText}>Send Cash</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={ViewNonLnsSents}>
                <Text style={styles.clientsPressableText}>View Cash sent to Pals or Transpoter</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={ViewBiznaShareRec}>
                <Text style={styles.clientsPressableText}>View Cash received from Biz</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={ViewNonLnsRecs}>
                <Text style={styles.clientsPressableText}>View Cash received from Pals</Text>
              </Pressable>
            </LinearGradient>
          </View>

           {/* Withdrawals */}
          <Text style={styles.salesPressableText}>Withdrawals</Text>
          <View style={styles.viewForClientsPressables}>
            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={goWithdrwMny}>
                <Text style={styles.clientsPressableText}>Withdraw Money</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={SMWthdrwlsss}>
                <Text style={styles.clientsPressableText}>View Withdrawn Money</Text>
              </Pressable>
            </LinearGradient>

            
          </View>

          {/* Other Operations */}
          <Text style={styles.salesPressableText}>Other Operations</Text>
          <View style={styles.viewForClientsPressables}>
             <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={BoostPalBenefits}>
                <Text style={styles.clientsPressableText}>Boost pooled Benefits</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={SrchLoanAdz}>
                <Text style={styles.clientsPressableText}>Search Loan Ads</Text>
              </Pressable>
            </LinearGradient> <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={LoanAds}>
                <Text style={styles.clientsPressableText}>Advertise</Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient colors={['#FF8C00', '#00BFFF']} start={{
              x: 0,
              y: 0
            }} end={{
              x: 1,
              y: 1
            }} style={styles.gradientPressable}>
              <Pressable onPress={VwPlLn2Remove}>
                <Text style={styles.clientsPressableText}>Delete Loan Ads</Text>
              </Pressable>
            </LinearGradient>

            
          </View>

 

        </View>
      </View>
      </ScrollView>
    </SafeAreaView>;
};
export default MyLoanAccount;