import { StyleSheet, Dimensions } from 'react-native';
const styles = StyleSheet.create({
  adminImage: {
    width: '100%',
    height: "100%",
    resizeMode: 'cover',
    top: "2%"
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    width: '70%',
    marginLeft: 25,
    top: 5
  },
  loanFriendButton: {
    backgroundColor: '#064bfb',
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    width: Dimensions.get('screen').width - 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 100,
    zIndex: 10
  },
  chamaLoanAndCreditSalesButton: {
    backgroundColor: 'white',
    height: 60,
    borderRadius: 30,
    marginHorizontal: 30,
    width: Dimensions.get('screen').width - 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  ChamaLoanAndCreditSalesText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black'
  },
  loanAFriendText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white'
  },
  viewForPressables: {
    backgroundColor: 'green',
    marginHorizontal: 10,
    width: Dimensions.get('screen').width - 20,
    height: 200,
    borderRadius: 20,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  viewForSalesPressables: {
    backgroundColor: 'green',
    marginHorizontal: 4,
    width: Dimensions.get('screen').width - 8,
    height: 170,
    borderRadius: 20,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  SalesPressables: {
    backgroundColor: '#72ebd8',
    marginHorizontal: 20,
    width: Dimensions.get('screen').width - 40,
    height: 60,
    borderRadius: 20,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  salesPressableText: {
    color: 'white',
    fontSize: 13
  },
  viewForSalesText: {
    color: 'white',
    fontSize: 20,
    marginTop: 1,
    height: 50
  },
  salesText: {
    fontSize: 20,
    color: "blue",
    marginBottom: "1.5%"
  },
  viewForClientsPressables: {
    backgroundColor: 'pink',
    height: "100%",
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: "100%"
  },
  viewForClientsCategories: {
    backgroundColor: '#e58d29',
    marginTop: "5%",
    marginBottom: "5%",
    height: "100%",
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: "33%"
  },
  viewForClientsAndTitleMFNdogo: {
    backgroundColor: 'pink',
    width: "100%",
    height: "100%",
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  viewForClientsAndTitle: {
    backgroundColor: '#e58d29',
    width: "100%",
    height: "50%",
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  clientsView: {
    backgroundColor: '#e58d29',
    width: "100%",
    height: "21%",
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  ClientsPressables: {
    backgroundColor: '#72ebd8',
    width: "32%",
    marginLeft: "1%",
    marginRight: "1%",
    height: "50%",
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  clientsPressableText: {
    color: 'black',
    fontSize: 10,
    marginTop: 1
  },
  acEarningsView: {
    backgroundColor: '#e58d29',
    marginHorizontal: 5,
    width: Dimensions.get('screen').width - 10,
    height: 95,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: "2%"
  },
  viewForAcEarningsPressables: {
    backgroundColor: '#e58d29',
    marginHorizontal: 15,
    width: Dimensions.get('screen').width - 30,
    height: "60%",
    borderRadius: 20,
    marginTop: "0.5%",
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  earningsAcPressables: {
    backgroundColor: '#72ebd8',
    height: 60,
    borderRadius: 10,
    marginLeft: "1%",
    marginRight: "1%",
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: "23%"
  },
  earningsAcPressablesSMNErn: {
    backgroundColor: '#72ebd8',
    height: 60,
    borderRadius: 20,
    marginLeft: "10%",
    marginRight: "10%",
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: "26%"
  },
  earningsAcPressableText: {
    color: 'black',
    fontSize: 15,
    marginTop: 1
  }
});
// Modern button styles for professional redesign

const modernButton = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  backgroundColor: '#0984e3',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 12,
  marginBottom: 8,
  marginHorizontal: 2,
  minWidth: 100,
  justifyContent: 'center' as const,
  shadowColor: '#636e72',
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 2,
};
const modernButtonWide = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  backgroundColor: '#00b894',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 16,
  marginBottom: 10,
  marginHorizontal: 4,
  minWidth: 150,
  justifyContent: 'center' as const,
  shadowColor: '#636e72',
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 2,
};
const modernButtonText = {
  color: '#fff',
  fontWeight: 'bold' as const,
  fontSize: 15,
  marginLeft: 8,
};

export default {
  ...styles,
  modernButton,
  modernButtonWide,
  modernButtonText,
};