import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPrint from 'react-native-print';
import { LinearGradient } from 'expo-linear-gradient';
import { listAuditors, listCombContractVouchers, getBizna, getSMAccount } from '../../../src/graphql/queries';
import { updateCombContractVoucher } from '../../../src/graphql/mutations';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useExchange } from '../../../src/contexts/ExchangeContext';
import { formatAmountSync } from '../../../src/utils/exchange';
import { nationalityToCode } from '../../../src/utils/nationalityToCode';
const client = generateClient();
const AuditorVoucherCard = ({
  voucher,
  selected,
  toggleSelect,
  funderNationality,
  funderCurrency
}: any) => {
  const { ratesMap } = useExchange();
  const [expanded, setExpanded] = useState(false);
  const policyExceeded = voucher.priceDeviation > voucher.marketConsumptionPrice || voucher.referencePrice > voucher.marketConsumptionFrequency || voucher.generalPriceDev > voucher.marketConsumptionTotal;
  const funderNat = funderNationality || 'UNKNOWN';
  const funderCurr = funderCurrency || 'UNKNOWN';
  const totalAmount = Number(voucher.itemPrice) * Number(voucher.numberOfItems);

  return <TouchableOpacity onPress={() => setExpanded(!expanded)}>
    <View style={[styles.voucherCard, {
      borderColor: selected ? 'darkblue' : '#ddd'
    }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <TouchableOpacity onPress={() => toggleSelect(voucher.id)} style={{ width: 20, height: 20, borderWidth: 1, borderColor: '#000', marginRight: 8, backgroundColor: selected ? 'darkblue' : 'white' }} />
        <Text style={styles.title}>{voucher.itemName} ({voucher.itemBrand})</Text>
      </View>
      <View style={{ backgroundColor: '#f9f9f9', padding: 6, borderRadius: 4, marginVertical: 4 }}>
        <Text style={{ fontSize: 11, marginVertical: 2 }}>
          💳 Funder ({funderNat}): {formatAmountSync(totalAmount, funderCurr, ratesMap)}
        </Text>
      </View>
      <Text>Time Settled: {new Date(voucher.settlementTime).toLocaleString()}</Text>
      {expanded && <>
        <Text>Specifications: {voucher.itemSpecifications || '-'}</Text>
        <View style={{ backgroundColor: '#f0f0f0', padding: 6, borderRadius: 4, marginVertical: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Unit Price in Funder Currency:</Text>
          <Text style={{ fontSize: 11, marginTop: 4 }}>
            💳 Funder ({funderNat}): {formatAmountSync(Number(voucher.itemPrice), funderCurr, ratesMap)}
          </Text>
        </View>
        <Text>Number of Items: {voucher.numberOfItems}</Text>
        <Text style={styles.section}>💳 Funder ({funderNat})</Text>
        <Text>{voucher.funderName} — {voucher.funderAccount}</Text>
        <Text style={styles.section}>Pricing Deviations</Text>
        <Text>Seller Deviation: {voucher.priceDeviation}% | Policy: {voucher.marketConsumptionPrice}%</Text>
        <Text>MiFedha Reference: {voucher.referencePrice}% | Policy: {voucher.marketConsumptionFrequency}%</Text>
        <Text>General Market: {voucher.generalPriceDev}% | Policy: {voucher.marketConsumptionTotal}%</Text>
        <Text style={{ color: policyExceeded ? 'red' : 'green', fontWeight: 'bold', marginTop: 4 }}>
          Policy Status: {policyExceeded ? 'EXCEEDED POLICY' : 'WITHIN POLICY'}
        </Text>
      </>}
    </View>
  </TouchableOpacity>;
};
const MemoizedAuditorVoucherCard = React.memo(AuditorVoucherCard, (prevProps, nextProps) => {
  return prevProps.voucher.id === nextProps.voucher.id &&
         prevProps.selected === nextProps.selected &&
         prevProps.sellerNationality === nextProps.sellerNationality &&
         prevProps.funderNationality === nextProps.funderNationality &&
         prevProps.consumerNationality === nextProps.consumerNationality &&
         prevProps.auditorNationality === nextProps.auditorNationality &&
         prevProps.toggleSelect === nextProps.toggleSelect;
});

const AuditorVoucherScreen = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [sellerFilter, setSellerFilter] = useState('');
  const [consumerFilter, setConsumerFilter] = useState('');
  const [funderFilter, setFunderFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [auditorVerified, setAuditorVerified] = useState(false);
  const [auditorNationality, setAuditorNationality] = useState<string | null>(null);
  const [auditorOrganization, setAuditorOrganization] = useState<string | null>(null);
  const [selectedVouchers, setSelectedVouchers] = useState<Record<string, boolean>>({});
  const { nationality, ratesMap } = useExchange();

  // Verify auditor with v6 auth
  const verifyAuditor = async () => {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const email = attributes.email;
      const res: any = await client.graphql({
        query: listAuditors,
        variables: {
          filter: {
            email: {
              eq: email
            }
          }
        }
      });
      const auditor = res?.data?.listAuditors?.items?.[0];
      if (!auditor || !auditor.active) {
        Alert.alert('Unauthorized', 'You are not registered as an auditor.');
        return;
      }
      setAuditorOrganization(auditor.organization || null);
      // Fetch auditor's nationality
      try {
        const smRes: any = await client.graphql({ query: getSMAccount, variables: { awsemail: email } });
        const auditorNat = smRes?.data?.getSMAccount?.nationality || null;
        setAuditorNationality(auditorNat);
      } catch (e) {
        console.warn('Could not fetch auditor nationality', e);
      }
      setAuditorVerified(true);
      fetchVouchers();
    } catch (error) {
      Alert.alert('Error', 'Failed to verify auditor.');
    }
  };
  const fetchVouchers = async (token?: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const res: any = await client.graphql({
        query: listCombContractVouchers,
        variables: {
          filter: {
            accStatus: {
              eq: 'Cleared'
            }
          },
          limit: 50,
          nextToken: token
        }
      });
      const items = res?.data?.listCombContractVouchers?.items || [];
      
      // Fetch nationalities for all three parties (seller, funder, consumer)
      const fetchNationality = async (account: string, type: string) => {
        try {
          // Bizna: account is Bizna account number, getBizna then getSMAccount(email)
          if (type === 'sellerTypeBiz' || type === 'funderTypeBiz') {
            const bizRes: any = await client.graphql({ query: getBizna, variables: { BusKntct: account } });
            const email = bizRes?.data?.getBizna?.email;
            if (email) {
              const smRes: any = await client.graphql({ query: getSMAccount, variables: { awsemail: email } });
              return smRes?.data?.getSMAccount?.nationality ;
            }
            return null;
          } else {
            // Pal: account is email
            const smRes: any = await client.graphql({ query: getSMAccount, variables: { awsemail: account } });
            return smRes?.data?.getSMAccount?.nationality;
          }
        } catch (e) {
          console.warn(`Could not fetch nationality for ${account}`, e);
          return null;
        }
      };
      
      await Promise.all(items.map(async i => {
        const seller = await fetchNationality(i.sellerAccount, i.sellerType);
        const funder = await fetchNationality(i.funderAccount, i.funderType);
        const consumer = await fetchNationality(i.consumerAccount, i.consumerType);
        // ...existing code...
      }));
      // Replace natMap/enriched logic
      const natMapNew = new Map<string, { sellerNationality: string | null; funderNationality: string | null; funderCurrency: string; consumerNationality: string | null }>();
      await Promise.all(items.map(async i => {
        const sellerNationality = await fetchNationality(i.sellerAccount, i.sellerType);
        const funderNationality = await fetchNationality(i.funderAccount, i.funderType);
        // Consumer: always Pal
        const smRes: any = await client.graphql({ query: getSMAccount, variables: { awsemail: i.consumerAccount } });
        const consumerNationality = smRes?.data?.getSMAccount?.nationality || null;
        const funderCurrency = nationalityToCode(funderNationality) || 'Ksh';
        natMapNew.set(i.id, {
          sellerNationality,
          funderNationality,
          funderCurrency,
          consumerNationality
        });
      }));
      const enriched = items.map(i => {
        const nats = natMapNew.get(i.id) || { sellerNationality: null, funderNationality: null, funderCurrency: 'Ksh', consumerNationality: null };
        return {
          ...i,
          sellerNationality: nats.sellerNationality,
          funderNationality: nats.funderNationality,
          funderCurrency: nats.funderCurrency,
          consumerNationality: nats.consumerNationality
        };
      });
      
      setVouchers(prev => {
        const map = new Map(prev.map(v => [v.id, v]));
        enriched.forEach(v => map.set(v.id, v));
        return Array.from(map.values());
      });
      setNextToken(res?.data?.listCombContractVouchers?.nextToken || null);
    } catch (error) {
      Alert.alert('Error', 'Failed to load vouchers.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    verifyAuditor();
  }, []);
  const toggleSelect = (id: string) => setSelectedVouchers(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
  const filteredVouchers = vouchers.filter(v => {
    // Only show vouchers where funderAccount matches auditor's organization
    if (auditorOrganization && v.funderAccount !== auditorOrganization) {
      return false;
    }
    return (
      v.sellerAccount?.toLowerCase().includes(sellerFilter.toLowerCase()) &&
      v.consumerAccount?.toLowerCase().includes(consumerFilter.toLowerCase()) &&
      v.funderAccount?.toLowerCase().includes(funderFilter.toLowerCase()) &&
      (!startDate || new Date(v.settlementTime) >= startDate) &&
      (!endDate || new Date(v.settlementTime) <= endDate)
    );
  });
  // Group vouchers by seller nationality and compute per-currency summaries
  const groupedSummary = (() => {
    const map = new Map<string, {
      totalCleared: number;
      withinCount: number;
      exceededCount: number;
      totalMoney: number;
      withinMoney: number;
      exceededMoney: number;
    }>();
    filteredVouchers.forEach(v => {
      const key = v.sellerNationality || 'UNKNOWN';
      const g = map.get(key) || {
        totalCleared: 0,
        withinCount: 0,
        exceededCount: 0,
        totalMoney: 0,
        withinMoney: 0,
        exceededMoney: 0
      };
      const amount = Number(v.itemPrice || 0) * Number(v.numberOfItems || 0);
      g.totalCleared += 1;
      const isExceeded = v.priceDeviation > v.marketConsumptionPrice || v.referencePrice > v.marketConsumptionFrequency || v.generalPriceDev > v.marketConsumptionTotal;
      if (isExceeded) {
        g.exceededCount += 1;
        g.exceededMoney += amount;
      } else {
        g.withinCount += 1;
        g.withinMoney += amount;
      }
      g.totalMoney += amount;
      map.set(key, g);
    });
    return map;
  })();
  const exportPDF = async () => {
    const vouchersToExport = filteredVouchers.filter(v => selectedVouchers[v.id]);
    if (!vouchersToExport.length) return Alert.alert('No vouchers selected');
    try {
      // build grouped summary for selected vouchers
      const selGroup = (() => {
        const map = new Map();
        vouchersToExport.forEach(v => {
          const key = v.sellerNationality || 'UNKNOWN';
          const g = map.get(key) || { totalCleared: 0, withinCount: 0, exceededCount: 0, totalMoney: 0, withinMoney: 0, exceededMoney: 0 };
          const amount = Number(v.itemPrice || 0) * Number(v.numberOfItems || 0);
          g.totalCleared += 1;
          const isExceeded = v.priceDeviation > v.marketConsumptionPrice || v.referencePrice > v.marketConsumptionFrequency || v.generalPriceDev > v.marketConsumptionTotal;
          if (isExceeded) {
            g.exceededCount += 1;
            g.exceededMoney += amount;
          } else {
            g.withinCount += 1;
            g.withinMoney += amount;
          }
          g.totalMoney += amount;
          map.set(key, g);
        });
        return map;
      })();
      const summaryHtml = Array.from(selGroup.entries()).map(([nat, g]) => {
        const displayNat = nat === 'UNKNOWN' ? nationality : nat;
        const total = g.totalCleared || 0;
        const withinPct = total ? g.withinCount / total * 100 : 0;
        const exceededPct = total ? g.exceededCount / total * 100 : 0;
        return `<div style="margin-bottom:6px;"><strong>${displayNat}</strong><div>Total Cleared: ${g.totalCleared} || ${formatAmountSync(Number(g.totalMoney), nationalityToCode(displayNat), ratesMap)}</div><div style="color:green">Within: ${g.withinCount} || ${withinPct.toFixed(1)}% || ${formatAmountSync(Number(g.withinMoney), nationalityToCode(displayNat), ratesMap)}</div><div style="color:red">Exceeded: ${g.exceededCount} || ${exceededPct.toFixed(1)}% || ${formatAmountSync(Number(g.exceededMoney), nationalityToCode(displayNat), ratesMap)}</div></div>`;
      }).join('');

      const html = `
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial; font-size:12px; padding:10px; }
            table { width:100%; border-collapse:collapse; margin-bottom:10px; }
            th, td { border:1px solid #aaa; padding:4px; }
            th { background:#eee; }
            .exceeded { color:red; font-weight:bold; }
            .within { color:green; font-weight:bold; }
          </style>
        </head>
        <body>
          <h2>MiFedha COMB Auditor Voucher Report</h2>
          ${summaryHtml}
          ${vouchersToExport.map(v => {
        const policyExceeded = v.priceDeviation > v.marketConsumptionPrice || v.referencePrice > v.marketConsumptionFrequency || v.generalPriceDev > v.marketConsumptionTotal;
        const sellerNat = v.sellerNationality || nationality;
        const funderNat = v.funderNationality || nationality;
        const consumerNat = v.consumerNationality || nationality;
        const totalAmount = Number(v.itemPrice) * Number(v.numberOfItems);
        return `
              <table>
                <tr><th colspan="2">${v.itemName} (${v.itemBrand})</th></tr>
                <tr><td>Total Amount</td><td>🏪 Seller (${sellerNat}): ${formatAmountSync(totalAmount, nationalityToCode(sellerNat), ratesMap)} || 💳 Funder (${funderNat}): ${formatAmountSync(totalAmount, nationalityToCode(funderNat), ratesMap)}</td></tr>
                <tr><td>Unit Price</td><td>🏪 ${formatAmountSync(Number(v.itemPrice), nationalityToCode(sellerNat), ratesMap)} || 💳 ${formatAmountSync(Number(v.itemPrice), nationalityToCode(funderNat), ratesMap)}</td></tr>
                <tr><td>Specifications</td><td>${v.itemSpecifications || '-'}</td></tr>
                <tr><td>Number of Items</td><td>${v.numberOfItems}</td></tr>
                <tr><td>Time Settled</td><td>${new Date(v.settlementTime).toLocaleString()}</td></tr>
                <tr><th colspan="2">👤 Consumer (${consumerNat})</th></tr>
                <tr><td>Name & Account</td><td>${v.consumerName} — ${v.consumerAccount}</td></tr>
                <tr><th colspan="2">🏪 Seller (${sellerNat})</th></tr>
                <tr><td>Name & Account</td><td>${v.sellerName} — ${v.sellerAccount}</td></tr>
                <tr><th colspan="2">💳 Funder (${funderNat})</th></tr>
                <tr><td>Name & Account</td><td>${v.funderName} — ${v.funderAccount}</td></tr>
                <tr><th colspan="2">Pricing Deviations</th></tr>
                <tr><td>Seller Deviation</td><td>${v.priceDeviation}% | Policy: ${v.marketConsumptionPrice}%</td></tr>
                <tr><td>MiFedha Reference</td><td>${v.referencePrice}% | Policy: ${v.marketConsumptionFrequency}%</td></tr>
                <tr><td>General Market</td><td>${v.generalPriceDev}% | Policy: ${v.marketConsumptionTotal}%</td></tr>
                <tr><td>Policy Status</td><td class="${policyExceeded ? 'exceeded' : 'within'}">${policyExceeded ? 'EXCEEDED POLICY' : 'WITHIN POLICY'}</td></tr>
              </table>
            `;
      }).join('')}
        </body>
        </html>`;
      await RNPrint.print({
        html
      });

      // Update each exported voucher to 'Completed' status
      try {
        await Promise.all(vouchersToExport.map(v =>
          client.graphql({
            query: updateCombContractVoucher,
            variables: {
              input: {
                id: v.id,
                accStatus: 'Completed'
              }
            }
          })
        ));
        
        // Clear selections and reload list for fresh vouchers
        setSelectedVouchers({});
        setVouchers([]); // Clear current list
        setNextToken(null); // Reset pagination
        await fetchVouchers(); // Reload fresh vouchers
        
        Alert.alert('Success', 'Vouchers exported and updated. Loading fresh vouchers...');
      } catch (updateError) {
        console.error('Failed to update vouchers:', updateError);
        Alert.alert('Warning', 'PDF exported but failed to update voucher statuses. Please try refreshing.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to generate PDF');
    }
  };
  if (!auditorVerified) return <ActivityIndicator size="large" style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }} />;
  return <KeyboardAvoidingView style={{
    flex: 1
  }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
      <View style={{
      flex: 1,
      padding: 10
    }}>
        <TouchableOpacity onPress={exportPDF} style={{
        padding: 10,
        backgroundColor: 'darkblue',
        borderRadius: 6,
        marginBottom: 10
      }}>
          <Text style={{
          color: '#fff',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>Export Selected PDF ({Object.values(selectedVouchers).filter(v => v).length})</Text>
        </TouchableOpacity>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.summaryContainer}>
            <Text style={{
            fontWeight: 'bold'
          }}>Voucher Compliance Summary (by Seller Currency)</Text>
            {Array.from(groupedSummary.entries()).map(([nat, g]) => {
              const displayNat = nat === 'UNKNOWN' ? nationality : nat;
              const auditorNat = auditorNationality || nationality;
              const total = g.totalCleared || 0;
              const withinPct = total ? g.withinCount / total * 100 : 0;
              const exceededPct = total ? g.exceededCount / total * 100 : 0;
              return <View key={nat} style={{
                marginTop: 8
              }}>
                  <Text style={{
                  fontWeight: 'bold'
                }}>{displayNat}</Text>
                  <Text>👤 Auditor ({auditorNat}): {formatAmountSync(Number(g.totalMoney), nationalityToCode(auditorNat), ratesMap)} || 🏪 Seller ({displayNat}): {formatAmountSync(Number(g.totalMoney), nationalityToCode(displayNat), ratesMap)}</Text>
                  <Text style={{
                  color: 'green'
                }}>Within Limit: {g.withinCount} ({withinPct.toFixed(1)}%) | 👤 {formatAmountSync(Number(g.withinMoney), nationalityToCode(auditorNat), ratesMap)} || 🏪 {formatAmountSync(Number(g.withinMoney), nationalityToCode(displayNat), ratesMap)}</Text>
                  <Text style={{
                  color: 'red'
                }}>Exceeded Limit: {g.exceededCount} ({exceededPct.toFixed(1)}%) | 👤 {formatAmountSync(Number(g.exceededMoney), nationalityToCode(auditorNat), ratesMap)} || 🏪 {formatAmountSync(Number(g.exceededMoney), nationalityToCode(displayNat), ratesMap)}</Text>
                </View>;
            })}
          </View>

          <TextInput style={styles.input} placeholder="Filter by Seller" value={sellerFilter} onChangeText={setSellerFilter} />
          <TextInput style={styles.input} placeholder="Filter by Consumer" value={consumerFilter} onChangeText={setConsumerFilter} />
          <TextInput style={styles.input} placeholder="Filter by Funder" value={funderFilter} onChangeText={setFunderFilter} />

          <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 6
        }}>
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}><Text>From: {startDate ? startDate.toLocaleDateString() : 'Select'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}><Text>To: {endDate ? endDate.toLocaleDateString() : 'Select'}</Text></TouchableOpacity>
          </View>

          {showStartPicker && <DateTimePicker value={startDate || new Date()} mode="date" display="calendar" onChange={(e, d) => {
          setShowStartPicker(false);
          if (d) setStartDate(d);
        }} />}
          {showEndPicker && <DateTimePicker value={endDate || new Date()} mode="date" display="calendar" onChange={(e, d) => {
          setShowEndPicker(false);
          if (d) setEndDate(d);
        }} />}

          <Text style={{
          fontWeight: 'bold',
          marginBottom: 6,
          textAlign: 'center'
        }}>Select Voucher to Export PDF</Text>
        </ScrollView>

        {loading && vouchers.length === 0 ? <ActivityIndicator size="large" /> : filteredVouchers.length === 0 ? <Text style={{
        textAlign: 'center'
      }}>No cleared vouchers found.</Text> : <FlatList data={filteredVouchers} keyExtractor={item => item.id} renderItem={({
        item
      }) => <MemoizedAuditorVoucherCard
        voucher={item}
        selected={!!selectedVouchers[item.id]}
        toggleSelect={toggleSelect}
        funderNationality={item.funderNationality}
        funderCurrency={item.funderCurrency}
      />}
      onEndReached={() => {
        if (nextToken && !loading) fetchVouchers(nextToken);
      }}
      onEndReachedThreshold={0.5}
      keyboardShouldPersistTaps="handled"
      />}
    </View>
  </KeyboardAvoidingView>;
};

const styles = StyleSheet.create({
  voucherCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15
  },
  section: {
    marginTop: 6,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4
  },
  dateButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#ccc',
    flex: 1,
    marginHorizontal: 4
  },
  summaryContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#f5f5f5'
  }
});
export default AuditorVoucherScreen;