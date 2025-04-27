let unsubscribeFunctions = [];

export function addUnsubscribe(fn) {
  unsubscribeFunctions.push(fn);
}

export async function unsubscribeAllListeners() {
  console.log("🧹 Unsubscribing all Firestore listeners...");

  for (const fn of unsubscribeFunctions) {
    try {
      fn();
    } catch (err) {
      console.error("Error unsubscribing listener:", err);
    }
  }

  unsubscribeFunctions = []; // Reset after clean
}
