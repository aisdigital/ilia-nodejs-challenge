export class InvalidAmountError extends Error {
  constructor(message: number) {
    super(`Amount must be a positive integer gratre than zero. Received: ${message}`)
    this.name = 'InvalidAmountError'
  }
}

export class Amount {
  private readonly value: number

  private constructor(value: number) {
    this.value = value
  }

  public static create(value: number): Amount | InvalidAmountError {
    if (!Number.isInteger(value) || value <= 0) {
      return new InvalidAmountError(value)
    }
    return new Amount(value)
  }

  public getValue(): number {
    return this.value
  }
}