"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";
import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";
import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    const banks = await getBanks({ userId });

    if (!banks?.length) {
      return parseStringify({
        data: [],
        totalBanks: 0,
        totalCurrentBalance: 0,
      });
    }

    const accounts = await Promise.all(
      banks.map(async (bank: Bank) => {
        try {
          const accountsResponse = await plaidClient.accountsGet({
            access_token: bank.accessToken,
          });
          const accountData = accountsResponse.data.accounts[0];

          const institution = await getInstitution({
            institutionId: accountsResponse.data.item.institution_id!,
          });

          return {
            id: accountData.account_id,
            availableBalance: accountData.balances.available ?? 0,
            currentBalance: accountData.balances.current ?? 0,
            institutionId: institution?.institution_id,
            name: accountData.name,
            officialName: accountData.official_name,
            mask: accountData.mask ?? "****",
            type: accountData.type,
            subtype: accountData.subtype ?? "unknown",
            appwriteItemId: bank.$id,
            shareableId: bank.shareableId,
          };
        } catch (error) {
          console.error(`Error fetching account for bank ${bank.$id}:`, error);
          return null;
        }
      })
    );

    const validAccounts = accounts.filter(Boolean);
    const totalBanks = validAccounts.length;
    const totalCurrentBalance = validAccounts.reduce(
      (total, account) => total + (account?.currentBalance ?? 0),
      0
    );

    return parseStringify({
      data: validAccounts,
      totalBanks,
      totalCurrentBalance,
    });
  } catch (error) {
    console.error("Error in getAccounts:", error);
    throw error;
  }
};

// Get transactions with proper error handling and cursor-based pagination
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  try {
    let hasMore = true;
    let allTransactions: any[] = [];
    let cursor: string | undefined = undefined;

    while (hasMore) {
      try {
        const response = await plaidClient.transactionsSync({
          access_token: accessToken,
          cursor, // Now properly typed as string | undefined
        });

        const { added, has_more, next_cursor } = response.data;

        const newTransactions = added.map((transaction) => ({
          id: transaction.transaction_id,
          name: transaction.name,
          paymentChannel: transaction.payment_channel,
          type: transaction.payment_channel,
          accountId: transaction.account_id,
          amount: transaction.amount,
          pending: transaction.pending,
          category: transaction.category?.[0] ?? "Uncategorized",
          date: transaction.date,
          image: transaction.logo_url,
        }));

        allTransactions = [...allTransactions, ...newTransactions];
        hasMore = has_more;
        // Handle the cursor type properly
        cursor = next_cursor || undefined;
      } catch (error: any) {
        if (
          error?.response?.data?.error_code === "ADDITIONAL_CONSENT_REQUIRED"
        ) {
          console.log("Additional consent required for transactions");
          return [];
        }
        throw error;
      }
    }

    return parseStringify(allTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    const bank = await getBank({ documentId: appwriteItemId });
    if (!bank) {
      throw new Error("Bank account not found");
    }

    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];

    // Get transfer transactions
    let transferTransactions = [];
    try {
      const transferTransactionsData = await getTransactionsByBankId({
        bankId: bank.$id,
      });

      if (transferTransactionsData?.documents) {
        transferTransactions = transferTransactionsData.documents.map(
          (transferData: Transaction) => ({
            id: transferData.$id,
            name: transferData.name ?? "Transfer",
            amount: transferData.amount ?? 0,
            date: transferData.$createdAt,
            paymentChannel: transferData.channel ?? "online",
            category: transferData.category ?? "Transfer",
            type: transferData.senderBankId === bank.$id ? "debit" : "credit",
          })
        );
      }
    } catch (error) {
      console.error("Error fetching transfer transactions:", error);
      transferTransactions = [];
    }

    // Get institution info
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    // Get Plaid transactions
    let plaidTransactions = [];
    try {
      plaidTransactions = await getTransactions({
        accessToken: bank.accessToken,
      });
    } catch (error) {
      console.error("Error fetching Plaid transactions:", error);
      plaidTransactions = [];
    }

    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available ?? 0,
      currentBalance: accountData.balances.current ?? 0,
      institutionId: institution?.institution_id,
      name: accountData.name,
      officialName: accountData.official_name,
      mask: accountData.mask ?? "****",
      type: accountData.type,
      subtype: accountData.subtype ?? "unknown",
      appwriteItemId: bank.$id,
    };

    // Combine and sort transactions
    const allTransactions = [...plaidTransactions, ...transferTransactions]
      .filter(Boolean)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error) {
    console.error("Error in getAccount:", error);
    throw error;
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    return parseStringify(response.data.institution);
  } catch (error) {
    console.error("Error getting institution:", error);
    throw error;
  }
};
