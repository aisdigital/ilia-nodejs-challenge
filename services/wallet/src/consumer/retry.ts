export function nextRetryQueue(attempts: number): string | null {
	if (attempts <= 0) return "wallet.provision.retry.10s";
	if (attempts === 1) return "wallet.provision.retry.30s";
	if (attempts === 2) return "wallet.provision.retry.120s";
	return null;
}
