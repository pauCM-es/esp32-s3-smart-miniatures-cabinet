export const publishMqtt = async (hass, topic, payload) => {
	if (!hass) return;
	await hass.callService("mqtt", "publish", {
		topic,
		payload: JSON.stringify(payload),
		qos: 0,
		retain: false,
	});
};
