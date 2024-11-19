import HeaderBox from "@/components/HeaderBox";
import { Pagination } from "@/components/Pagination";
import TransactionsTable from "@/components/TransactionsTable";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeftRight, AlertCircle, Wallet, Building2 } from "lucide-react";
import Link from "next/link";

const TransactionHistory = async ({
  searchParams: { id, page },
}: SearchParamProps) => {
  try {
    const currentPage = Number(page as string) || 1;

    // Get logged in user
    const loggedIn = await getLoggedInUser();
    if (!loggedIn) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please{" "}
            <Link href="/sign-in" className="underline">
              sign in
            </Link>{" "}
            to view your transactions.
          </AlertDescription>
        </Alert>
      );
    }

    // Get all accounts
    const accounts = await getAccounts({
      userId: loggedIn.$id,
    });

    if (!accounts?.data || accounts.data.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Accounts Found</AlertTitle>
          <AlertDescription>
            Please connect a bank account to view transactions.
            <Link href="/connect-bank" className="block mt-2 underline">
              Connect Bank Account
            </Link>
          </AlertDescription>
        </Alert>
      );
    }

    const accountsData = accounts.data;
    const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

    if (!appwriteItemId) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Selection</AlertTitle>
          <AlertDescription>
            Invalid account selected. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    // Get specific account details
    const account = await getAccount({ appwriteItemId });

    if (!account?.data) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Account</AlertTitle>
          <AlertDescription>
            Unable to load account details. Please try again later.
          </AlertDescription>
        </Alert>
      );
    }

    const transactions = account.transactions || [];
    const rowsPerPage = 10;
    const totalPages = Math.ceil(transactions.length / rowsPerPage);

    const indexOfLastTransaction = currentPage * rowsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;

    const currentTransactions = transactions.slice(
      indexOfFirstTransaction,
      indexOfLastTransaction
    );

    return (
      <div className="transactions space-y-6 p-4">
        <div className="transactions-header">
          <HeaderBox
            title="Transaction History"
            subtext="See your bank details and transactions."
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="transactions-account grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">{account.data.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {account.data.officialName}
                  </p>
                  <p className="text-sm font-mono tracking-wider">
                    ●●●● ●●●● ●●●● {account.data.mask}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-lg">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold">
                    {formatAmount(account.data.currentBalance)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center gap-4">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    No Transactions Found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    There are no transactions available for this account yet.
                    {account.data.type === "depository" &&
                      " New transactions will appear here as they occur."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <TransactionsTable transactions={currentTransactions} />
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination totalPages={totalPages} page={currentPage} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error in TransactionHistory:", error);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          An error occurred while loading your transaction history. Please try
          again later.
        </AlertDescription>
      </Alert>
    );
  }
};

export default TransactionHistory;
