"use strict";
exports.__esModule = true;
var alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
var base = alphabet.length;
var Base58 = {
    encode: function (enc) {
        if (typeof enc !== 'number')
            throw new Error('"encode" only accepts integers.');
        var encoded = '';
        while (enc) {
            var remainder = enc % base;
            enc = Math.floor(enc / base);
            encoded = alphabet[remainder].toString() + encoded;
        }
        return encoded;
    },
    decode: function (dec) {
        if (typeof dec !== 'string')
            throw new Error('"decode" only accepts strings.');
        var decoded = 0;
        while (dec) {
            var alphabetPosition = alphabet.indexOf(dec[0]);
            if (alphabetPosition < 0)
                throw new Error("\"decode\" can't find \"" + dec[0] + "\" in the alphabet: \"" + alphabet + "\"");
            var powerOf = dec.length - 1;
            decoded += alphabetPosition * (Math.pow(base, powerOf));
            dec = dec.substring(1);
        }
        return decoded;
    }
};
console.log(Base58.decode('43f690cab1a28d76fb20bbe49688b14c7cd614e39d27fc364238879c38050600'));
exports["default"] = Base58;
