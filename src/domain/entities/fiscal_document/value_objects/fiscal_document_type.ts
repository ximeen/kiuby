import { ValueObject } from "@domain/shared/value_object";

export enum FiscalDocumentType {
  INPUT = "input",
  OUTPUT = "output",
}

export enum FiscalDocumentModel {
  NFE = "nfe",
  NFCE = "nfce",
  NFS = "nfs",
}

interface FiscalDocumentTypeProps {
  type: FiscalDocumentType;
  model: FiscalDocumentModel;
}

export class FiscalDocumentTypeVO extends ValueObject<FiscalDocumentTypeProps> {
  private constructor(props: FiscalDocumentTypeProps) {
    super(props);
  }

  static create(type: FiscalDocumentType, model: FiscalDocumentModel): FiscalDocumentTypeVO {
    return new FiscalDocumentTypeVO({ type, model });
  }

  static createInputNfe(): FiscalDocumentTypeVO {
    return new FiscalDocumentTypeVO({
      type: FiscalDocumentType.INPUT,
      model: FiscalDocumentModel.NFE,
    });
  }

  static createInputNfce(): FiscalDocumentTypeVO {
    return new FiscalDocumentTypeVO({
      type: FiscalDocumentType.INPUT,
      model: FiscalDocumentModel.NFCE,
    });
  }

  static createInputNfs(): FiscalDocumentTypeVO {
    return new FiscalDocumentTypeVO({
      type: FiscalDocumentType.INPUT,
      model: FiscalDocumentModel.NFS,
    });
  }

  static createOutputNfe(): FiscalDocumentTypeVO {
    return new FiscalDocumentTypeVO({
      type: FiscalDocumentType.OUTPUT,
      model: FiscalDocumentModel.NFE,
    });
  }

  static createOutputNfce(): FiscalDocumentTypeVO {
    return new FiscalDocumentTypeVO({
      type: FiscalDocumentType.OUTPUT,
      model: FiscalDocumentModel.NFCE,
    });
  }

  static createOutputNfs(): FiscalDocumentTypeVO {
    return new FiscalDocumentTypeVO({
      type: FiscalDocumentType.OUTPUT,
      model: FiscalDocumentModel.NFS,
    });
  }

  get type(): FiscalDocumentType {
    return this.props.type;
  }

  get model(): FiscalDocumentModel {
    return this.props.model;
  }

  isInput(): boolean {
    return this.props.type === FiscalDocumentType.INPUT;
  }

  isOutput(): boolean {
    return this.props.type === FiscalDocumentType.OUTPUT;
  }

  isNfe(): boolean {
    return this.props.model === FiscalDocumentModel.NFE;
  }

  isNfce(): boolean {
    return this.props.model === FiscalDocumentModel.NFCE;
  }

  isNfs(): boolean {
    return this.props.model === FiscalDocumentModel.NFS;
  }
}
