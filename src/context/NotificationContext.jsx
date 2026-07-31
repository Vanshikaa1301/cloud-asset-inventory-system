import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

let nextId = 1;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = nextId++;
    setNotifications((prev) => [{ id, timestamp: new Date().toISOString(), ...notification }, ...prev]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm animate-slide-in ${
              n.type === 'success' ? 'bg-green-500' :
              n.type === 'error' ? 'bg-red-500' :
              n.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            onClick={() => removeNotification(n.id)}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
