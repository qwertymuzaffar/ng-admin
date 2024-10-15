export const getExpirationDate = (exp: number): Date => {
  const date = new Date(0);
  date.setUTCSeconds(exp);
  return date;
};
