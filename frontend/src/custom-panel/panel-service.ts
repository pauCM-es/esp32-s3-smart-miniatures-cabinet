import type { Hass } from "./panel-types.js";

export const publishMqtt = async (
	hass: Hass | null,
	topic: string,
	payload: Record<string, unknown>,
): Promise<void> => {
	if (!hass) return;
	await hass.callService("mqtt", "publish", {
		topic,
		payload: JSON.stringify(payload),
		qos: 0,
		retain: false,
	});
};
