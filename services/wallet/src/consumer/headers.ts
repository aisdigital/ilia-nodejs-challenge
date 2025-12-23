type DeathHeader = {
	count?: number;
};

export function readDeathCount(headers: Record<string, unknown>): number {
	const deaths = headers["x-death"];
	if (!Array.isArray(deaths)) {
		return 0;
	}
	return deaths.reduce((sum, entry) => {
		if (
			entry &&
			typeof entry === "object" &&
			typeof (entry as DeathHeader).count === "number"
		) {
			return sum + (entry as DeathHeader).count;
		}
		return sum;
	}, 0);
}
