const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base = alphabet.length;

const Base58 = {
  encode(enc: number) {
    if (typeof enc !== 'number') throw new Error('"encode" only accepts integers.');
    let encoded = '';
    while (enc) {
      const remainder = enc % base;
      enc = Math.floor(enc / base);
      encoded = alphabet[remainder].toString() + encoded;
    }
    return encoded;
  },
  decode(dec: string) {
    if (typeof dec !== 'string') throw new Error('"decode" only accepts strings.');
    let decoded = 0;
    while (dec) {
      const alphabetPosition = alphabet.indexOf(dec[0]);
      if (alphabetPosition < 0) throw new Error(`"decode" can't find "${dec[0]}" in the alphabet: "${alphabet}"`);
      const powerOf = dec.length - 1;
      decoded += alphabetPosition * (base ** powerOf);
      dec = dec.substring(1);
    }
    return decoded;
  },
};

console.log(Base58.decode('43f690cab1a28d76fb20bbe49688b14c7cd614e39d27fc364238879c38050600'));

export default Base58;
