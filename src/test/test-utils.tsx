import { render as rtlRender, screen, waitForElementToBeRemoved, RenderOptions } from '@testing-library/react';
import AppProvider from 'providers/app';
import { FunctionComponent, ReactElement } from 'react';
import userEvent from '@testing-library/react';

/**
 * This file is a wrapper for react testing library's render function.
 * Add other stuff here you need to use in all tests, like providers, etc. 
 */

const AllTheProviders = ({children}: any) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, {wrapper: AllTheProviders, ...options})

export const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(
    () => [...screen.queryAllByTestId(/loading/i), ...screen.queryAllByText(/loading/i)],
    { timeout: 4000 }
  );

// eslint-disable-next-line import/export
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

// eslint-disable-next-line import/export
export * from '@testing-library/react';
export { userEvent, rtlRender, customRender };