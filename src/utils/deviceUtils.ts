import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'aetherwave_device_id';

export function generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `user_${timestamp}_${randomPart}`;
}

export async function getDeviceId(): Promise<string> {
    try {
        let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

        if (!deviceId) {
            deviceId = generateUserId();
            await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
        }

        return deviceId;
    } catch (error) {
        console.error('Failed to get device ID:', error);
        return generateUserId();
    }
}
