import { ValueObject } from "@domain/shared/value_object";

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  static create(amount: number, currency = "BRL"): Money {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }

    return new Money({ amount, currency });
  }
  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(money: Money): Money {
    this.ensureSameCurrency(money);
    return Money.create(this.amount + money.amount, this.currency);
  }

  subtract(money: Money): Money {
    this.ensureSameCurrency(money);
    return Money.create(this.amount - money.amount, this.currency);
  }

  multiply(multiplier: number): Money {
    return Money.create(this.amount * multiplier, this.currency);
  }

  isGreaterThan(money: Money): boolean {
    this.ensureSameCurrency(money);
    return this.amount > money.amount;
  }

  private ensureSameCurrency(money: Money): void {
    if (this.currency !== money.currency) {
      throw new Error("Cannot operate on different currencies");
    }
  }
}
