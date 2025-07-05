import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'OFFLINE_QUEUE';

export async function getQueue() {
  const json = await AsyncStorage.getItem(QUEUE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function addToQueue(action) {
  const queue = await getQueue();
  queue.push(action);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function processQueue(processor) {
  const queue = await getQueue();
  for (const action of queue) {
    await processor(action);
  }
  await clearQueue();
}

// Action format: { type: 'add'|'update'|'delete', todo: {...} } for add/update, { type: 'delete', id: '...' } for delete 