interface ActiveSessionItem {
  id: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}
