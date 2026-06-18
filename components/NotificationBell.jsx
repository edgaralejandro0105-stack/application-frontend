import React, { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Bell, Check, Info } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { apiClient, extractList } from '@/lib/api-client';

export function NotificationBell({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (!res.error) {
        const notifs = extractList(res.data);
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const existingTitles = new Set(prev.map(n => n.title));
          const newNotifs = notifs
            .filter(n => {
              if (existingIds.has(n.id)) return false;
              if (n.title === 'Nueva Reservación Web' && existingTitles.has('Nueva Pre-reserva')) return false;
              return true;
            })
            .map(n => ({
              id: n.id,
              type: 'reservation',
              title: n.title,
              message: n.message,
              date: new Date(n.createdAt || n.created_at),
              read: n.read
            }));
          if (newNotifs.length === 0) return prev;
          return [...newNotifs, ...prev];
        });
      }
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    let backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    if (backendUrl.endsWith('/api')) {
      backendUrl = backendUrl.slice(0, -4);
    }
    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('Socket conectado al backend para notificaciones');
      setSocketStatus('connected');
    });

    socket.on('connect_error', (err) => {
      console.error('Error de conexión socket:', err.message);
      setSocketStatus('error');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket desconectado:', reason);
      setSocketStatus(reason === 'io server disconnect' ? 'disconnected' : 'error');
    });

    socket.on('new_reservation', (data) => {
      let dateStr = 'fecha por confirmar';
      if (data?.event_date) {
        const parts = data.event_date.split('-');
        if (parts.length === 3) {
          dateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          dateStr = new Date(data.event_date).toLocaleDateString();
        }
      }
      
      const newNotif = {
        id: data?.id || Date.now(),
        type: 'reservation',
        title: 'Nueva Pre-reserva',
        message: `Evento programado para ${dateStr}`,
        date: new Date(),
        read: false
      };

      setNotifications(prev => [newNotif, ...prev]);
    });

    socket.on('new_notification', (data) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === data.id)) return prev;
        return [{
          id: data.id,
          type: data.type === 'info' ? 'reservation' : (data.type || 'info'),
          title: data.title || 'Notificación',
          message: data.message || '',
          date: new Date(),
          read: data.read || false
        }, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [loadNotifications]);

  // Polling periódico SIEMPRE (respaldo por si el socket falla)
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Marcar todas como leídas
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
    if (open) {
      // Refrescar al abrir el popover
      loadNotifications();
    }
  };

  const handleNotificationClick = (notif) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate("events");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button 
          className="relative flex items-center justify-center p-2 rounded-xl outline-none hover:bg-accent/20 transition-colors"
          aria-label="Notificaciones"
          title={socketStatus === 'connected' ? 'Notificaciones en tiempo real' : socketStatus === 'error' ? 'Error de conexión - usando respaldo' : 'Reconectando...'}
        >
          <Bell className={`h-5 w-5 transition-colors ${socketStatus === 'error' ? 'text-red-500/80' : 'text-foreground/80'}`} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {unreadCount === 0 && socketStatus === 'error' && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0 rounded-xl border-border/50 bg-popover/95 backdrop-blur-md shadow-lg overflow-hidden z-50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          <div className="flex items-center gap-2">
            {socketStatus !== 'connected' && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <span className={`h-1.5 w-1.5 rounded-full ${socketStatus === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                {socketStatus === 'error' ? 'Sin conexión' : 'Reconectando'}
              </span>
            )}
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </div>
        </div>
        
        <ScrollArea className="h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Bell className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No tienes notificaciones</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Te avisaremos cuando suceda algo.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif, index) => (
                <button
                  key={`${notif.id}-${index}`} 
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "flex gap-3 p-4 border-b border-border/40 hover:bg-muted/50 transition-colors w-full text-left outline-none",
                    !notif.read && "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    notif.type === 'reservation' ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
                  )}>
                    {notif.type === 'reservation' ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                      {notif.title}
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-primary inline-block"></span>}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {notif.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
