export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;
  protected _createdAt: Date;
  protected _updatedAt: Date;

  constructor(props: T, id?: string) {
    this._id = id ?? crypto.randomUUID();
    this.props = props;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }
  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  public equals(entity?: Entity<T>): boolean {
    if (!entity) return false;
    if (this === entity) return true;
    return this._id === entity._id;
  }
}
