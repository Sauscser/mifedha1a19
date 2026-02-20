import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { createCombContract, createMessages, sendNotification } from "../../../src/graphql/mutations";
import { getBizna, getSMAccount, listCombPersonels } from "../../../src/graphql/queries";
import { useExchange } from "../../../src/contexts/ExchangeContext";
import { formatAmountSync, convertKshToUserCurrency } from "../../../src/utils/exchange";
import { nationalityToCode } from "../../../src/utils/nationalityToCode";

/* ---------------- TYPES ---------------- */
type PartyType = "funderTypePal" | "funderTypeBiz";
type PartyType2 = "consumerTypePal" | "consumerTypeBiz";
type PrePostPay = "PREPAID" | "POSTPAID";
type PriceFlag = "NORMAL" | "ABOVE_REFERENCE" | "SUSPICIOUS" | "FRAUD_RISK" | "NO_MARKET_DATA";
type FormState = {
  consumerType: PartyType2;
  consumerEmail?: string;
  consumerOfficerEmail?: string;
  consumerAccount?: string;
  funderType: PartyType;
  funderEmail?: string;
  funderOfficerEmail?: string;
  funderAccount?: string;
  capConsumption: boolean;
  consumptionCapping?: string;
  consumptionMargin?: string;
  updateFrequency?: string;
  repaymentPeriod?: string;
  MiFedhaMarketDev?: string;
  allMarketDev?: string;
  pword?: string;
};

/* ---------------- COMPONENT ---------------- */
const client = generateClient();
const CreateCombContractScreen: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    consumerType: "consumerTypePal",
    funderType: "funderTypePal",
    capConsumption: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerNationality, setSellerNationality] = useState<string | null>(null);
  const { nationality, ratesMap } = useExchange();
  const update = <K extends keyof FormState,>(k: K, v: FormState[K]) => setForm(p => ({
    ...p,
    [k]: v
  }));

  /* ---------------- FETCH SELLER NATIONALITY (when consumer changes) ---------------- */
  useEffect(() => {
    const fetchSellerNat = async () => {
      try {
        if (form.consumerType === "consumerTypePal" && form.consumerEmail) {
          const res: any = await client.graphql({
            query: getSMAccount,
            variables: { awsemail: form.consumerEmail }
          });
          setSellerNationality(res?.data?.getSMAccount?.nationality || null);
        } else if (form.consumerType === "consumerTypeBiz" && form.consumerAccount && form.consumerOfficerEmail) {
          const bizRes: any = await client.graphql({
            query: getBizna,
            variables: { BusKntct: form.consumerAccount }
          });
          const email = bizRes?.data?.getBizna?.email;
          if (email) {
            const smRes: any = await client.graphql({
              query: getSMAccount,
              variables: { awsemail: email }
            });
            setSellerNationality(smRes?.data?.getSMAccount?.nationality || null);
          } else {
            setSellerNationality(null);
          }
        } else {
          setSellerNationality(null);
        }
      } catch (err) {
        console.warn('Could not fetch seller nationality', err);
        setSellerNationality(null);
      }
    };
    fetchSellerNat();
  }, [form.consumerType, form.consumerEmail, form.consumerAccount, form.consumerOfficerEmail]);
  const getRequiredFields = (form: FormState) => {
    const required: {
      field: keyof FormState;
      label: string;
    }[] = [];
    if (form.consumerType === "consumerTypePal") {
      required.push({
        field: "consumerEmail",
        label: "Consumer Email"
      });
    } else {
      required.push({
        field: "consumerAccount",
        label: "Consumer Business Account"
      }, {
        field: "consumerOfficerEmail",
        label: "Consumer Officer Email"
      });
    }
    if (form.funderType === "funderTypeBiz") {
      required.push({
        field: "funderAccount",
        label: "Funder Business Account"
      }, {
        field: "funderOfficerEmail",
        label: "Funder Officer Email"
      });
    }
    required.push({
      field: "pword",
      label: "Main Account Password"
    });
    if (form.capConsumption) {
      required.push({
        field: "consumptionCapping",
        label: "Consumption Capping"
      }, {
        field: "consumptionMargin",
        label: "Consumption Margin"
      }, {
        field: "updateFrequency",
        label: "Update Frequency"
      }, {
        field: "repaymentPeriod",
        label: "Payment Period"
      }, {
        field: "MiFedhaMarketDev",
        label: "MiFedha Market Deviation Margin"
      }, {
        field: "allMarketDev",
        label: "All Market Deviation"
      });
    }
    return required;
  };
  const validateForm = (form: FormState) => {
    const required = getRequiredFields(form);
    for (const {
      field,
      label
    } of required) {
      if (!form[field] || form[field]?.toString().trim() === "") {
        Alert.alert("Missing Field", `${label} is required.`);
        return false;
      }
    }
    return true;
  };

  /* ---------------- CREATE CONTRACT ---------------- */
  const handleCreateContract = async () => {
    if (isLoading) return;
    setIsLoading(true);
    if (!validateForm(form)) {
      setIsLoading(false);
      return;
    }
    try {
      const userInfo = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      const loggedInEmail = attrs.email;

      /* ---------------- CONSUMER ---------------- */
      let consumerEmail = "";
      let consumerAccount = "";
      let consumerOfficerName = "";
      let consumerContact = "";
      let consumerName = "";
      if (form.consumerType === "consumerTypePal") {
        const res: any = await client.graphql({
          query: getSMAccount,
          variables: {
            awsemail: form.consumerEmail
          }
        });
        const acc = res?.data?.getSMAccount;
        if (!acc) throw new Error("Consumer account not found");
        consumerEmail = form.consumerEmail!;
        consumerAccount = form.consumerEmail!;
        consumerOfficerName = acc.name || "Officer";
        consumerContact = acc.phonecontact || "N/A";
        consumerName = acc.name || "Officer";
      } else {
        const bizRes: any = await client.graphql({
          query: getBizna,
          variables: {
            BusKntct: form.consumerAccount
          }
        });
        const biz = bizRes?.data?.getBizna;
        if (!biz) throw new Error("Consumer business not found");
        const officerRes: any = await client.graphql({
          query: getSMAccount,
          variables: {
            awsemail: form.consumerOfficerEmail
          }
        });
        const officer = officerRes?.data?.getSMAccount;
        if (!officer) throw new Error("Consumer officer not found");
        const personnelRes: any = await client.graphql({
          query: listCombPersonels,
          variables: {
            filter: {
              and: {
                phoneKontact: {
                  eq: form.consumerOfficerEmail
                },
                BusinessRegNo: {
                  eq: form.consumerAccount
                }
              }
            }
          }
        });
        if (!personnelRes?.data?.listCombPersonels?.items?.length) throw new Error("Consumer officer is not registered for this institution");
        consumerEmail = form.consumerOfficerEmail!;
        consumerAccount = form.consumerAccount!;
        consumerOfficerName = officer.name || "Officer";
        consumerContact = biz.bizContact || "N/A";
        consumerName = biz.busName || "N/A";
      }

      /* ---------------- FUNDER ---------------- */
      let funderEmail = "";
      let funderAccount = "";
      let funderOfficerName = "";
      let funderContact = "";
      let funderName = "";
      if (form.funderType === "funderTypePal") {
        const res: any = await client.graphql({
          query: getSMAccount,
          variables: {
            awsemail: loggedInEmail
          }
        });
        const acc = res?.data?.getSMAccount;
        if (!acc) throw new Error("Your funder account was not found");
        if (userInfo.userId !== acc.owner) throw new Error("This is not your account");
        if (form.pword !== acc.pw) throw new Error("Wrong main account password");
        funderEmail = loggedInEmail || '';
        funderAccount = loggedInEmail || ''; 
        funderOfficerName = acc.name || "Officer";
        funderContact = acc.phonecontact || "N/A";
        funderName = acc.name || "Officer";
      } else {
        const bizRes: any = await client.graphql({
          query: getBizna,
          variables: {
            BusKntct: form.funderAccount
          }
        });
        const biz = bizRes?.data?.getBizna;
        if (!biz) throw new Error("Funder business not found");
        const officerRes: any = await client.graphql({
          query: getSMAccount,
          variables: {
            awsemail: form.funderOfficerEmail
          }
        });
        const officer = officerRes?.data?.getSMAccount;
        if (!officer) throw new Error("Funder officer not found");
        if (userInfo.userId !== officer.owner) throw new Error("This is not your account");
        if (form.pword !== officer.pw) throw new Error("Wrong main account password");
        const personnelRes: any = await client.graphql({
          query: listCombPersonels,
          variables: {
            filter: {
              and: {
                phoneKontact: {
                  eq: form.funderOfficerEmail
                },
                BusinessRegNo: {
                  eq: form.funderAccount
                }
              }
            }
          }
        });
        if (!personnelRes?.data?.listCombPersonels?.items?.length) throw new Error("Funder officer is not registered for this institution");
        funderEmail = form.funderOfficerEmail!;
        funderAccount = form.funderAccount!;
        funderOfficerName = officer.name || "Officer";
        funderContact = biz.bizContact || "N/A";
        funderName = biz.busName || "Officer";
      }
      if (consumerAccount === funderAccount) throw new Error("Consumer and funder cannot be the same");

      /* ---------------- CONTRACT ---------------- */
      const isCapped = form.capConsumption;
      const prepostPay: PrePostPay = isCapped ? "POSTPAID" : "PREPAID";
      const input = {
        marketItemID: "SYSTEM",
        itemName: "SYSTEM",
        itemBrand: "SYSTEM",
        itemSpecifications: "SYSTEM",
        numberOfItems: 0,
        itemPrice: 0,
        marketConsumptionPrice: isCapped ? parseFloat(form.consumptionMargin || "0") : 0,
        marketConsumptionFrequency: isCapped ? parseFloat(form.MiFedhaMarketDev || "0") : 0,
        marketConsumptionTotal: isCapped ? parseFloat(form.allMarketDev || "0") : 0,
        consumerType: form.consumerType,
        consumerEmail,
        consumerAccount,
        consumerOfficerName,
        consumerContact,
        consumerName,
        funderType: form.funderType,
        funderEmail,
        funderAccount,
        funderOfficerName,
        funderContact,
        funderName,
        sellerName: "",
        sellerEmail: consumerEmail,
        sellerAccount: "None",
        sellerOfficerName: "",
        priceFlag: "NORMAL" as PriceFlag,
        marketConsumptionStatus: "Pending",
        accStatus: "Active",
        consumptionMarginStatus: isCapped ? "Active" : "Cancelled",
        consumptionCapping: isCapped ? parseFloat(form.consumptionCapping || "0") : 0,
        consumptionMargin: isCapped ? parseFloat(form.consumptionMargin || "0") : 0,
        updateFrequency: isCapped ? form.updateFrequency || "Daily" : "Daily",
        repaymentPeriod: isCapped ? parseFloat(form.repaymentPeriod || "0") : 0,
        prepostPay,
        lastUpdateTime: new Date().toISOString(),
        settlementTime: "None",
        referencePriceSource: "SYSTEM",
        priceDeviation: 0,
        referencePrice: 0,
        generalPriceDev: 0,
        createdAt: new Date().toISOString(),
        advertStatus: "Pending",
        sellerType: "sellerTypePal",
      };
      await client.graphql({
        query: createCombContract,
        variables: {
          input
        }
      });
      await client.graphql({
        query: createMessages,
        variables: {
          input: {
            senderEmail: consumerEmail,
            messageBody: "You have a COMB contract. Go to COMB and link a seller as per your funder's specifications."
          }
        }
      });
      await client.graphql({
        query: sendNotification,
        variables: {
          riderEmail: consumerEmail,
          title: "MiFedha: COMB Contract",
          body: "You have a COMB contract. Proceed to link a seller as per your funder's specifications."
        }
      });
      Alert.alert("Success", "COMB contract created successfully");
      setForm({
        consumerType: "consumerTypePal",
        funderType: "funderTypePal",
        capConsumption: false,
        pword: ""
      });
    } catch (err: any) {
      console.log(err);
      Alert.alert("Error", err.message || "Ensure you enter details correctly!");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
 return (
    <LinearGradient colors={["#e58d29", "skyblue"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create COMB Contract</Text>

        {/* Consumer Type */}
        <Text style={styles.label}>Consumer Type</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, form.consumerType === "consumerTypePal" && styles.chipActive]}
            onPress={() => update("consumerType", "consumerTypePal")}
          >
            <Text style={styles.chipText}>Individual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, form.consumerType === "consumerTypeBiz" && styles.chipActive]}
            onPress={() => update("consumerType", "consumerTypeBiz")}
          >
            <Text style={styles.chipText}>Business</Text>
          </TouchableOpacity>
        </View>

        {form.consumerType === "consumerTypePal" ? (
          <TextInput
            style={styles.input}
            placeholder="Consumer Email"
            value={form.consumerEmail}
            onChangeText={(v) => update("consumerEmail", v)}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Consumer Business Account"
              value={form.consumerAccount}
              onChangeText={(v) => update("consumerAccount", v)}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Consumer Officer Email"
              value={form.consumerOfficerEmail}
              onChangeText={(v) => update("consumerOfficerEmail", v)}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="username"   // distinct context
              autoComplete="off"           // disable autofill
            />
          </>
        )}

        {/* Funder Type */}
        <Text style={styles.label}>Funder Type</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.chip, form.funderType === "funderTypePal" && styles.chipActive]}
onPress={() => {
  update("funderType", "funderTypePal");
  update("funderEmail", undefined);
}}
          >
            <Text style={styles.chipText}>Individual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, form.funderType === "funderTypeBiz" && styles.chipActive]}
            onPress={() => update("funderType", "funderTypeBiz")}
          >
            <Text style={styles.chipText}>Institution/Business</Text>
          </TouchableOpacity>
        </View>

       {form.funderType === "funderTypePal" ? (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ color: "#fff", fontStyle: "italic" }}>
      Using your logged-in account as the funder
    </Text>
  </View>
) : (

          <>
            <TextInput
              style={styles.input}
              placeholder="Funder Institution/Business Account"
              value={form.funderAccount}
              onChangeText={(v) => update("funderAccount", v)}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Funder Officer Email"
              value={form.funderOfficerEmail}
              onChangeText={(v) => update("funderOfficerEmail", v)}
              autoCapitalize="none"
              keyboardType="email-address"

  /* 🔒 Disable autofill & predictions */
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              autoCorrect={false}        // disable autofill
            />
          </>
        )}

        {/* Consumption Mode */}
        <Text style={styles.label}>Consumption Mode</Text>
        <View style={styles.row}>
         <TouchableOpacity
            style={[styles.chip, !form.capConsumption && styles.chipActive]}
            onPress={() => update("capConsumption", false)}
          >
            <Text style={styles.chipText}>No Capping (Spoil'em)</Text>
          </TouchableOpacity>
          
           <TouchableOpacity
            style={[styles.chip, form.capConsumption && styles.chipActive]}
            onPress={() => update("capConsumption", true)}
          >
            <Text style={styles.chipText}>Set Capping</Text>
          </TouchableOpacity>
          
        </View>

        {form.capConsumption && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Consumption Capping: KSH"
              keyboardType="numeric"
              value={form.consumptionCapping}
              onChangeText={(v) => update("consumptionCapping", v)}
            />
            {form.consumptionCapping && sellerNationality && (
              <View style={{ backgroundColor: '#f5f5f5', padding: 8, borderRadius: 6, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                  💰 Seller Currency ({sellerNationality}): {formatAmountSync(Number(form.consumptionCapping), nationalityToCode(sellerNationality), ratesMap || {})}
                </Text>
                <Text style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  (Backend stored as: KES {form.consumptionCapping})
                </Text>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Seller Price Deviation Margin: %"
              keyboardType="numeric"
              value={form.consumptionMargin}
              onChangeText={(v) => update("consumptionMargin", v)}
            />

             <TextInput
              style={styles.input}
              placeholder="MiFedha Price Market Deviation Margin %"
              value={form.MiFedhaMarketDev}
              onChangeText={(v) => update("MiFedhaMarketDev", v)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="All Markets Price Deviation Margin %"
              keyboardType="numeric"
              value={form.allMarketDev}
              onChangeText={(v) => update("allMarketDev", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Voucher Update Frequency in days"
              value={form.updateFrequency}
              onChangeText={(v) => update("updateFrequency", v)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Payment Period"
              keyboardType="numeric"
              value={form.repaymentPeriod}
              onChangeText={(v) => update("repaymentPeriod", v)}
            />

          </>
        )}

        <Text style={{marginTop:10}}>
                  Main Account Password
                </Text>
                <View style={styles.passwordRow}>
                            <TextInput
                              style={[styles.input, { flex: 1 }]}
                              value={form.pword}
                              placeholder='Main Account Password'
                              onChangeText={(v) => update("pword", v)}
                              secureTextEntry={!showPassword}
                              autoCapitalize="none"
                            />
                            <TouchableOpacity
                              style={styles.eyeButton}
                              onPress={() => setShowPassword((p) => !p)}
                            >
                              <Text style={{ color: "#fff", fontSize: 14 }}>
                                {showPassword ? "Hide" : "Show"}
                              </Text>
                            </TouchableOpacity>
                          </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateContract}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Contract</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};


/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    padding: 18
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12
  },
  label: {
    color: "#fff",
    marginBottom: 6
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  passwordRow: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center"
  },
  eyeButton: {
    marginLeft: 8,
    backgroundColor: "#e58d29",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  chip: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  chipActive: {
    backgroundColor: "#1b6cff"
  },
  chipText: {
    color: "#000"
  },
  button: {
    backgroundColor: "#1b6cff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  }
});
export default CreateCombContractScreen;