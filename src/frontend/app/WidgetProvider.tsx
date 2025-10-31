import React, { createContext, useContext, useReducer, useMemo } from 'react';
import {
  initialState,
  reducer,
  type State as WidgetState,
  type Action as WidgetAction,
} from './state';

export type RootProps = {
  venueGroup?: string;
  defaultVenueId?: string;
  returnUrl?: string;
  children?: React.ReactNode;
};

type Config = Omit<RootProps, 'children'>;

type WidgetContextValue = {
  state: WidgetState;
  dispatch: React.Dispatch<WidgetAction>;
  config: Config;
};

const WidgetCtx = createContext<WidgetContextValue | null>(null);

export function WidgetProvider({ children, ...config }: RootProps) {
  const [state, dispatch] = useReducer(
    reducer,
    config,
    (cfg: Config): WidgetState => ({
      ...initialState,
      // lock beats prefill
      venueId: cfg.defaultVenueId ?? null,
    }),
  );

  const value = useMemo(
    () => ({ state, dispatch, config }),
    [state, config.venueGroup, config.defaultVenueId, config.returnUrl],
  );

  return <WidgetCtx.Provider value={value}>{children}</WidgetCtx.Provider>;
}

export function useWidget() {
  const ctx = useContext(WidgetCtx);
  if (!ctx) throw new Error('useWidget must be used within <WidgetProvider>');
  return ctx;
}

export const useWidgetState = () => useWidget().state;
export const useWidgetDispatch = () => useWidget().dispatch;
export const useWidgetConfig = () => useWidget().config;
