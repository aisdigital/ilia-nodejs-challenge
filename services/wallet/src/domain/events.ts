export type UserRegistered = {
	userId: string;
};

export function parseUserRegistered(payload: unknown): UserRegistered | null {
	if (!payload || typeof payload !== "object") {
		return null;
	}
	const record = payload as Record<string, unknown>;
	if (typeof record.userId !== "string" || record.userId.trim() === "") {
		return null;
	}
	return { userId: record.userId };
}
