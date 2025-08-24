export interface StoredCertificateDataOnChain {
  studentName: string;
  courseTitle: string;
  issueDate: Date;
  issuerName: string;
  recipientWallet: string;
  grade?: string;
  fileUploader: string;
}

export interface StoredCertificateDataOffChain {
  studentName: string;
  courseTitle: string;
  issueDate: Date;
  issuerName: string;
  recipientWallet: string;
  fileUploader: string;
  grade?: string;
  tokenId: number;
  certificateDescription?: string;
  transactionHash: string;
  dataHash: string;
  organization: string;
}
