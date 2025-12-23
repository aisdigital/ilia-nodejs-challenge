export type Transaction = {
	type: "credit" | "debit";
	amountMinor: number;
};

export function computeBalanceMinor(transactions: Transaction[]): number {
	return transactions.reduce((sum, tx) => {
		const amount = Number.isFinite(tx.amountMinor) ? tx.amountMinor : 0;
		if (tx.type === "credit") {
			return sum + amount;
		}
		return sum - amount;
	}, 0);
}

export function canDebit(balanceMinor: number, amountMinor: number): boolean {
	if (!Number.isFinite(balanceMinor) || !Number.isFinite(amountMinor)) {
		return false;
	}
	if (amountMinor < 0) {
		return false;
	}
	return balanceMinor - amountMinor >= 0;
}
