// Simulated authentication service
export const login = async (credentials) => {
    // In real implementation, this would call your backend API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
          localStorage.setItem('isAuthenticated', 'true');
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };
  
  export const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };
  
  export const logout = () => {
    localStorage.removeItem('isAuthenticated');
  };