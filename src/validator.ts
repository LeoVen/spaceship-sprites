
const validateInteger = (value: number, name: string) => {
    if (!Number.isInteger(value)) {
        throw new Error(`[Validator] Expected integer for ${name} but found ${value}`)
    }
}

const validatePositiveInteger = (value: number, name: string) => {
    validateInteger(value, name)
    if (value < 0.0) {
        throw new Error(`[Validator] Expected positive integer for ${name} but found ${value}`)
    }
}

const validatePercentage = (value: number, name: string) => {
    if (value < 0.0 || value > 1.0) {
        throw new Error(`[Validator] Expected percentage value for ${name} but found ${value}`)
    }
}

class Validator {
    static integer = validateInteger
    static positiveInteger = validatePositiveInteger
    static percentage = validatePercentage
}

export default Validator
