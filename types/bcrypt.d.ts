declare module 'bcrypt' {
  /**
   * Synchronously generates a hash for the given string.
   * @param {string} data - The data to be encrypted.
   * @param {number} saltOrRounds - The salt to be used to hash the password or the number of rounds to use.
   * @returns {string} The hashed string.
   */
  export function hashSync(data: string, saltOrRounds: string | number): string;

  /**
   * Asynchronously generates a hash for the given string.
   * @param {string} data - The data to be encrypted.
   * @param {number} saltOrRounds - The salt to be used to hash the password or the number of rounds to use.
   * @returns {Promise<string>} A promise to be either resolved with the encrypted data salt or rejected with an Error.
   */
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;

  /**
   * Synchronously compares the given data against the given hash.
   * @param {string} data - The data to be compared.
   * @param {string} encrypted - The data to be compared to.
   * @returns {boolean} Whether the data and hash match.
   */
  export function compareSync(data: string, encrypted: string): boolean;

  /**
   * Asynchronously compares the given data against the given hash.
   * @param {string} data - The data to be compared.
   * @param {string} encrypted - The data to be compared to.
   * @returns {Promise<boolean>} A promise to be either resolved with the comparison result or rejected with an Error.
   */
  export function compare(data: string, encrypted: string): Promise<boolean>;

  /**
   * Synchronously generates a salt.
   * @param {number} rounds - The number of rounds to use. Default is 10.
   * @returns {string} The generated salt.
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * Asynchronously generates a salt.
   * @param {number} rounds - The number of rounds to use. Default is 10.
   * @returns {Promise<string>} A promise to be either resolved with the generated salt or rejected with an Error.
   */
  export function genSalt(rounds?: number): Promise<string>;
} 