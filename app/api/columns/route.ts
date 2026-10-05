import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '../../lib/auth';
import {
  deleteColumn,
  getAllColumns,
  getColumnBySlug,
  saveColumn,
  type ColumnInput,
} from '../../lib/columns';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const column = getColumnBySlug(slug);
      if (!column) {
        return NextResponse.json({ error: '칼럼을 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json({ column });
    }

    const columns = getAllColumns();
    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Error fetching columns:', error);
    return NextResponse.json({ error: '칼럼 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: '권한이 없습니다. 관리자 로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as ColumnInput;
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: '칼럼 제목을 입력해 주세요.' }, { status: 400 });
    }
    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: '칼럼 본문 내용을 입력해 주세요.' }, { status: 400 });
    }

    const column = saveColumn(body);
    return NextResponse.json({ success: true, column }, { status: 201 });
  } catch (error) {
    console.error('Error creating column:', error);
    return NextResponse.json({ error: '칼럼 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: '권한이 없습니다. 관리자 로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as ColumnInput & { originalSlug?: string };
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: '칼럼 제목을 입력해 주세요.' }, { status: 400 });
    }

    // If slug was changed, remove old file
    if (body.originalSlug && body.slug && body.originalSlug !== body.slug) {
      deleteColumn(body.originalSlug);
    }

    const column = saveColumn(body);
    return NextResponse.json({ success: true, column });
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json({ error: '칼럼 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json(
      { error: '권한이 없습니다. 관리자 로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    let slug = searchParams.get('slug');

    if (!slug) {
      const body = await req.json().catch(() => ({}));
      slug = body?.slug;
    }

    if (!slug) {
      return NextResponse.json({ error: '삭제할 칼럼 슬러그(slug)가 필요합니다.' }, { status: 400 });
    }

    const success = deleteColumn(slug);
    if (!success) {
      return NextResponse.json({ error: '삭제할 칼럼을 찾을 수 없거나 삭제에 실패했습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: '칼럼이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('Error deleting column:', error);
    return NextResponse.json({ error: '칼럼 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
