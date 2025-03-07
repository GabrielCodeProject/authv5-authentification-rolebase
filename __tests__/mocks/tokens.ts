export const generateVerificationToken = jest.fn().mockResolvedValue({
  email: "test@example.com",
  token: "mock-token",
  expires: new Date(),
});
