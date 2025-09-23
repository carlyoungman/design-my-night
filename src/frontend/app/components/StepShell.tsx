import React from 'react';
import { useWidgetState } from '../WidgetProvider';

export const StepShell: React.FC<{ className: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  const state = useWidgetState();
  return (
    <div className={`step step--${className}`}>
      {/*{state.error && (*/}
      {/*  <p className="step__error" role="alert">*/}
      {/*    {state.error}*/}
      {/*  </p>*/}
      {/*)}*/}
      {children}
    </div>
  );
};
