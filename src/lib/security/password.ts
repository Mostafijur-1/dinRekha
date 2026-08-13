import "server-only";

import {
  randomBytes,
  scrypt as scryptCallback,
  type ScryptOptions,
  timingSafeEqual,
} from "node:crypto";

const keyLength = 64;
const cost = 32_768;
const blockSize = 8;
const parallelization = 1;
const maxMemory = 64 * 1024 * 1024;

function scrypt(
  password: string,
  salt: Buffer,
  length: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, length, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, keyLength, {
    N: cost,
    r: blockSize,
    p: parallelization,
    maxmem: maxMemory,
  });

  return [
    "scrypt",
    cost,
    blockSize,
    parallelization,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  const [
    algorithm,
    rawCost,
    rawBlockSize,
    rawParallelization,
    encodedSalt,
    encodedKey,
  ] = encodedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !rawCost ||
    !rawBlockSize ||
    !rawParallelization ||
    !encodedSalt ||
    !encodedKey
  ) {
    return false;
  }

  const storedKey = Buffer.from(encodedKey, "base64url");
  const parsedCost = Number(rawCost);
  const parsedBlockSize = Number(rawBlockSize);
  const parsedParallelization = Number(rawParallelization);
  const salt = Buffer.from(encodedSalt, "base64url");
  if (
    storedKey.length !== keyLength ||
    salt.length !== 16 ||
    parsedCost < 16_384 ||
    parsedCost > 131_072 ||
    parsedBlockSize < 8 ||
    parsedBlockSize > 16 ||
    parsedParallelization < 1 ||
    parsedParallelization > 4
  ) {
    return false;
  }
  const derivedKey = await scrypt(password, salt, storedKey.length, {
    N: parsedCost,
    r: parsedBlockSize,
    p: parsedParallelization,
    maxmem: maxMemory,
  });

  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}
