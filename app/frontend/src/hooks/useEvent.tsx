import {useChatSocket} from 'store/chatSocket';
import {useCallback, useEffect} from 'react';

export const useEvent = (event: string, cb: (...args: any[]) => void, deps: any[]) => {
  const socket = useChatSocket();
  const handler = useCallback(cb, [...deps, cb]);

  useEffect(() => {
    if (socket)
    {
      socket.io.on(event, handler);
      return () => { socket.io.off(event, handler); }
    }
  }, [socket, event, handler]);
}
