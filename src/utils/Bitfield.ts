


export default class Bitfield {
    bits: number
    constructor(bits?: Array<number>) {
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

    

}