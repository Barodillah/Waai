import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem('waai_auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // In production this would point to the backend URL via env var
      // Karena backend ditaruh di subfolder /api dan rute di api.php otomatis ditambah /api, 
      // maka urlnya menjadi /api/api
      const baseUrl = 'https://wai.bewhy.id/api/api'; 
      const response = await fetch(`${baseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If token is invalid, remove it
        localStorage.removeItem('waai_auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserName = async (newName) => {
    const token = localStorage.getItem('waai_auth_token');
    if (!token || !user) return false;

    try {
      const baseUrl = 'https://wai.bewhy.id/api/api';
      const response = await fetch(`${baseUrl}/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update name:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUserName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
