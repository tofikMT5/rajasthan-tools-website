import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = userSchema.parse(body);

    if (!validated.password) {
      return NextResponse.json({ error: 'Password is required for new user' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { username: validated.username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const user = await db.user.create({
      data: {
        username: validated.username,
        fullName: validated.fullName,
        email: validated.email || null,
        phone: validated.phone || null,
        passwordHash,
        role: validated.role,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
