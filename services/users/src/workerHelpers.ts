import type amqplib from "amqplib";

export function mapRoutingKey(type: string): string | null {
	if (type === "UserRegistered") {
		return "user.registered";
	}
	return null;
}

export function buildHeaders(
	payload: unknown,
): amqplib.MessagePropertyHeaders | undefined {
	if (
		payload &&
		typeof payload === "object" &&
		typeof (payload as { requestId?: unknown }).requestId === "string"
	) {
		return { "x-request-id": (payload as { requestId: string }).requestId };
	}
	return undefined;
}
