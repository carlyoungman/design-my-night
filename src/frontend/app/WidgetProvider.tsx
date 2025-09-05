import React, { createContext, useContext, useReducer, useMemo } from 'react';
import {
  initialState,
  reducer,
  type State as WidgetState,
  type Action as WidgetAction,
} from './state';

export type RootProps = {
  venueGroup?: string;
  forcedVenueId?: string;
  corpThreshold?: number;
  corpEnquiryUrl?: string;
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
  // useReducer initializer keeps this tiny (no extra useMemo for boot state)
  const [state, dispatch] = useReducer(
    reducer,
    config,
    (cfg: Config): WidgetState => ({
      ...initialState,
      step: cfg.forcedVenueId ? 'venue' : 'venue',
      venueId: cfg.forcedVenueId ?? null,
    }),
  );

  // small memo so consumers don't re-render more than needed
  const value = useMemo(
    () => ({ state, dispatch, config }),
    [
      state,
      config.venueGroup,
      config.forcedVenueId,
      config.corpThreshold,
      config.corpEnquiryUrl,
      config.returnUrl,
    ],
  );

  return <WidgetCtx.Provider value={value}>{children}</WidgetCtx.Provider>;
}

/** Single hook */
export function useWidget() {
  const ctx = useContext(WidgetCtx);
  if (!ctx) throw new Error('useWidget must be used within <WidgetProvider>');
  return ctx;
}

/** Back-compat tiny helpers (optional) */
export const useWidgetState = () => useWidget().state;
export const useWidgetDispatch = () => useWidget().dispatch;
export const useWidgetConfig = () => useWidget().config;
