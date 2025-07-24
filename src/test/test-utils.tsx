/* eslint-disable */
import { render as rtlRender, screen, waitForElementToBeRemoved, RenderOptions } from '@testing-library/react';
import AppProvider from 'providers/app';
import { FunctionComponent, ReactElement } from 'react';
import userEvent from '@testing-library/react';

/**
 * This file is a wrapper for react testing library's render function.
 * Add other stuff here you need to use in all tests, like providers, etc. 
 */
// const AllTheProviders = ({children}: any) => {
//   return (
//     <AppProvider>
//       {children}
//     </AppProvider>
//   )
// }

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, {wrapper: <AppProvider />, ...options})

export const waitForLoadingToFinish = () => {
  const loadingEls = [
    ...screen.queryAllByTestId(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ];
  if (loadingEls.length > 0) {
    return waitForElementToBeRemoved(() => loadingEls, { timeout: 4000 });
  }
  return Promise.resolve();
};

export const render = async (
  ui: any,
  { wrapper: AllTheProviders, route = '/', user, ...renderOptions }: Record<string, any> = {}
) => {
  // if you want to render the app unauthenticated then pass "null" as the user

  window.history.pushState({}, 'Test page', route);

  const returnValue = {
    ...rtlRender(ui, {
      wrapper: AppProvider as FunctionComponent<unknown>,
      ...renderOptions,
    }),
    user,
  };

  await waitForLoadingToFinish();

  return returnValue;
};

export * from '@testing-library/react';
export { userEvent, rtlRender, customRender };