import {useLocation} from 'react-router-dom';

type _State = {
  channel: string,
  dm?: boolean,
  except?: string[]
}

export type State = {
  channel: string,
  dm: boolean,
  except: string[],
  pathname: string
}

export const useChannelLocation = (): State => {
  const { pathname, state } = useLocation();
  let current = state as _State || {};
  return { pathname, except: current.except || [], dm: current.dm || false, channel: current.channel || "" };
}
