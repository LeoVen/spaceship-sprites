
const validateInteger = (value: number, name: string) => {
    if (!Number.isInteger(value)) {
        throw new Error(`[Validator] Expected integer for ${name} but found ${value}`)
    }
}

const validatePositive = (value: number, name: string) => {
    if (value < 0.0) {
        throw new Error(`[Validator] Expected positive value for ${name} but found ${value}`)
    }
}

const validatePercentage = (value: number, name: string) => {
    if (value < 0.0 || value > 1.0) {
        throw new Error(`[Validator] Expected percentage value for ${name} but found ${value}`)
    }
}

const validatePositiveNonZero = (value: number, name: string) => {
    if (value <= 0.0) {
        throw new Error(`[Validator] Expected positive non-zero value for ${name} but found ${value}`)
    }
}

const validatePositiveInteger = (value: number, name: string) => {
    validateInteger(value, name)
    validatePositive(value, name)
}

class Validator {
    static integer = validateInteger
    static positive = validatePositive
    static positiveInteger = validatePositiveInteger
    static percentage = validatePercentage
    static positiveNonZero = validatePositiveNonZero
}

export default Validator
