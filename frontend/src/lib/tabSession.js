const sessionKeys = ['authToken', 'userRole', 'userName', 'profilePhoto', 'userTheme'];

export function initializeTabSession() {
  if (!sessionStorage.getItem('authToken')) {
    sessionKeys.forEach((key) => {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue !== null) sessionStorage.setItem(key, legacyValue);
    });
  }

  sessionKeys.forEach((key) => localStorage.removeItem(key));
}
