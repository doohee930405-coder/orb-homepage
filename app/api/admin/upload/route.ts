import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '../../../lib/auth';

export async function POST(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: '권한이 없습니다. 관리자 로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드할 수 있습니다.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'images', 'columns');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sanitize filename
    const ext = path.extname(file.name) || '.jpg';
    const baseName = path.basename(file.name, ext)
      .replace(/[^a-zA-Z0-9가-힣_-]/g, '_')
      .slice(0, 30);
    const timestamp = Date.now();
    const finalFilename = `${timestamp}_${baseName}${ext}`;
    const destination = path.join(uploadDir, finalFilename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destination, buffer);

    const publicUrl = `/images/columns/${finalFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return NextResponse.json(
      { error: '이미지 업로드 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
