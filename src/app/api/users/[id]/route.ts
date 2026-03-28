import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '@/lib/audit';


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const { fullName, email } = await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { fullName, email },
      select: { id: true, fullName: true, email: true, role: true },
    });

    await createAuditLog({
      tableName: 'user',
      recordId: id,
      action: 'UPDATE',
      oldData: { fullName: user.fullName, email: user.email },
      newData: { fullName, email },
      performedById: id,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Get user for audit log
    const oldUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!oldUser) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Prevent deleting the main admin if needed
    // Assuming ID 1 is the main admin
    if (id === 1) {
      return NextResponse.json({ error: 'Cannot delete the main administrator' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id }
    });

    // Create Audit Log
    await createAuditLog({
      tableName: 'user',
      recordId: id,
      action: 'DELETE',
      oldData: oldUser,
      performedById: 1, // Default to admin for now
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const { newPassword } = await req.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    await createAuditLog({
      tableName: 'user',
      recordId: id,
      action: 'UPDATE',
      oldData: { passwordChanged: true },
      newData: { passwordChanged: true },
      performedById: 1,
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
