import { ValueObject } from "@domain/shared/value_object";

export enum FiscalDocumentStatus {
  DRAFT = "draft",
  ISSUED = "issued",
  CANCELLED = "cancelled",
  DENIED = "denied",
}

interface FiscalDocumentStatusProps {
  status: FiscalDocumentStatus;
  cancellationReason?: string;
  cancelledAt?: Date;
  deniedAt?: Date;
  denialReason?: string;
}

export class FiscalDocumentStatusVO extends ValueObject<FiscalDocumentStatusProps> {
  private constructor(props: FiscalDocumentStatusProps) {
    super(props);
  }

  static create(status: FiscalDocumentStatus): FiscalDocumentStatusVO {
    return new FiscalDocumentStatusVO({ status });
  }

  static createDraft(): FiscalDocumentStatusVO {
    return new FiscalDocumentStatusVO({ status: FiscalDocumentStatus.DRAFT });
  }

  static createIssued(): FiscalDocumentStatusVO {
    return new FiscalDocumentStatusVO({ status: FiscalDocumentStatus.ISSUED });
  }

  static createCancelled(reason: string): FiscalDocumentStatusVO {
    return new FiscalDocumentStatusVO({
      status: FiscalDocumentStatus.CANCELLED,
      cancellationReason: reason,
      cancelledAt: new Date(),
    });
  }

  static createDenied(reason: string): FiscalDocumentStatusVO {
    return new FiscalDocumentStatusVO({
      status: FiscalDocumentStatus.DENIED,
      denialReason: reason,
      deniedAt: new Date(),
    });
  }

  get status(): FiscalDocumentStatus {
    return this.props.status;
  }

  get cancellationReason(): string | undefined {
    return this.props.cancellationReason;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get deniedAt(): Date | undefined {
    return this.props.deniedAt;
  }

  get denialReason(): string | undefined {
    return this.props.denialReason;
  }

  isDraft(): boolean {
    return this.props.status === FiscalDocumentStatus.DRAFT;
  }

  isIssued(): boolean {
    return this.props.status === FiscalDocumentStatus.ISSUED;
  }

  isCancelled(): boolean {
    return this.props.status === FiscalDocumentStatus.CANCELLED;
  }

  isDenied(): boolean {
    return this.props.status === FiscalDocumentStatus.DENIED;
  }

  canCancel(): boolean {
    return this.isIssued();
  }

  canEdit(): boolean {
    return this.isDraft();
  }
}
