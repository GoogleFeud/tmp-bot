


export default class Bitfield {
    bits: number
    constructor(...bits: Array<number>) {
        this.bits = bits ? bits.reduce((acc, val) => acc | val, 0):0;
    }

    add(...bits: Array<number>) : void {
        let total = 0;
        for (const bit of bits) {
            total |= bit;
        }
        this.bits |= total;
    }

    remove(...bits: Array<number>) : void {
        let total = 0;
        for (const bit of bits) {
            total |= bit;
        }
        this.bits &= ~total;
    }

    has(bit: number) : boolean {
        return (this.bits & bit) === bit;
    }

    static empty() : Bitfield {
        return new this();
    }

    static MUST_BE_HOST = 1 << 0
    static CANT_BE_HOST = 1 << 1
    static MUST_BE_GHOST = 1 << 2
    static CANT_BE_GHOST = 1 << 3
    static MUST_BE_DEAD = 1 << 5
    static CANT_BE_DEAD = 1 << 4
    static CANT_BE_IN_GAME = 1 << 5
    static MUST_BE_IN_GAME = 1 << 6
    static GAME_MUST_BE_STARTED = 1 << 7
    static GAME_CANT_BE_STARTED = 1 << 8
}