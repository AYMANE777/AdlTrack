import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '@/lib/audit';


export async function GET() {
// ...
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const sanitizedUsers = users.map(user => {
      const { password, ...rest } = user;
      return {
        id: rest.id.toString(),
        name: rest.fullName,
        username: rest.email,
        role: rest.role.toLowerCase() === 'admin' ? 'admin' : 'user'
      };
    });

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, username, role, password = 'password123' } = await req.json();

    if (!name || !username) {
      return NextResponse.json({ error: 'Name and username are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: name,
        email: username,
        password: hashedPassword,
        role: role === 'admin' ? 'ADMIN' : 'CLERK',
        isActive: true
      }
    });

    // Create Audit Log
    await createAuditLog({
      tableName: 'user',
      recordId: user.id,
      action: 'CREATE',
      newData: user,
      performedById: 1, // Default to admin for now
    });

    const { password: _, ...userInfo } = user;
    return NextResponse.json({
      id: userInfo.id.toString(),
      name: userInfo.fullName,
      username: userInfo.email,
      role: userInfo.role.toLowerCase() === 'admin' ? 'admin' : 'user'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
