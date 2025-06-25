import * as bcrypt from 'bcrypt';

export const hashPassword = async (plainPassword: string) => {
  const saltOrRounds = 10;
  const hash = await bcrypt.hash(plainPassword, saltOrRounds);
  return hash;
};

export const comparedPassword = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
};
