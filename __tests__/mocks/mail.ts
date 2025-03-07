export const sendVerificationEmail = jest
  .fn()
  .mockImplementation(async (_email: string, _token: string) => {
    return Promise.resolve();
  });
