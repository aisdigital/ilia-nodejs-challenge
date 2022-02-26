export const HOSTDB = process.env.HOSTDB;
export const PORTDB = process.env.PORTDB;
export const DBNAME = process.env.DBNAME;

export const URI = `mongodb://${HOSTDB}:${PORTDB}`;

export const WALLET = `http://${process.env.HOSTWALLET}:${process.env.PORTWALLET}`;
console.log(WALLET);
