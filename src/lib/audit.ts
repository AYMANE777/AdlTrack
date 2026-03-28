import prisma from './prisma';

export async function createAuditLog({
  tableName,
  recordId,
  action,
  oldData,
  newData,
  performedById,
}: {
  tableName: string;
  recordId: number;
  action: string;
  oldData?: any;
  newData?: any;
  performedById: number;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        tableName,
        recordId,
        action,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        performedById,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // We don't want to throw error here to avoid breaking the main operation
    return null;
  }
}
