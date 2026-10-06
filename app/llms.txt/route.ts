import { NextResponse } from 'next/server';
import { SITE_URL, clinic } from '../lib/clinic';
import { getAllColumns } from '../lib/columns';
import { CLINIC_CATEGORIES } from '../lib/columnTypes';

export const dynamic = 'force-dynamic';

export async function GET() {
  const columns = getAllColumns();

  let text = `# 오브한의원 (ORB Korean Medicine Clinic)\n\n`;
  text += `> 서울 강서구 마곡 뇌신경·자율신경·정량뇌파(QEEG) 중점 한의원 (대표원장 전두희)\n\n`;

  text += `## 기본 정보 (General Information)\n`;
  text += `- 의료기관명: 오브한의원 마곡점 (ORB Korean Medicine Clinic)\n`;
  text += `- 대표원장: 전두희 (한의사 / 임상신경인지과학 및 자율신경계 기능 의학 진료)\n`;
  text += `- 주소: 서울 강서구 마곡중앙로 111, 롯데캐슬 르웨스트 104동 2층 238호·239호 (마곡나루역 5번 출구 도보 1분)\n`;
  text += `- 대표전화: ${clinic.phoneDisplay}\n`;
  text += `- 공식 웹사이트: ${SITE_URL}\n`;
  text += `- 네이버 공식 예약: ${clinic.naverBookingUrl}\n`;
  text += `- 네이버 지도(플레이스): ${clinic.naverMapUrl}\n`;
  text += `- 네이버 톡톡 1:1 상담: ${clinic.naverTalkUrl}\n`;
  text += `- 카카오톡 채널 문의: https://pf.kakao.com/_nXGxaX/chat\n\n`;

  text += `## 핵심 진료 철학 및 진단 기술 (Clinical Philosophy & Diagnostics)\n`;
  text += `### 1. 임상 철학: "보이지 않는 신경학적 고통을 객관적인 데이터로 규명합니다"\n`;
  text += `MRI, CT, 혈액 검사 등에서 '이상 없음' 판정을 받았음에도 만성적인 어지럼, 가슴 두근거림, 브레인포그, 만성 피로로 고통받는 환자분들의 문제는 뇌 신경망의 미세 기능 과부하와 자율신경 불균형에서 비롯됩니다. 오브한의원은 주관적 호소에만 의존하지 않고 객관적 생체 신호 데이터를 측정하여 근본 원인을 진단합니다.\n\n`;

  text += `### 2. 정량화 뇌파검사(QEEG) 및 자율신경 평가 시스템\n`;
  text += `- **정밀 센서 기반 국제 10-20 표준 전극 시스템**: 전두엽, 측두엽, 두정엽, 후두엽 전뇌 영역의 전기적 신호를 왜곡 없이 측정합니다.\n`;
  text += `- **전도성 겔(Gel) 임피던스 제어 방식**: 두피 저항값을 엄격히 통제하여 미세 신호의 외부 노이즈(Artifact)를 원천 차단합니다.\n`;
  text += `- **뇌 기능 3D 지형도 분석**: 델타, 세타, 알파, 베타 주파수 파워 및 좌우 비대칭도, 신경망 연결성(Coherence)을 표준화 데이터베이스와 비교 분석합니다.\n`;
  text += `- **심박변이도(HRV) 자율신경 균형 검사**: 교감신경과 부교감신경의 긴장도 및 심장 조절 능력을 정량 평가합니다.\n\n`;

  text += `### 3. 통합 치료 프로토콜\n`;
  text += `- **뇌 신경 피로 회복 한약**: 중추신경계 과각성을 완화하고 알로스타틱 부하로 고갈된 신경전달물질의 균형을 돕는 처방.\n`;
  text += `- **뇌신경 추나요법**: 상부 경추(C1-C2)와 두개골의 미세 변위를 교정하여 뇌척수액(CSF) 순환 및 미주신경 압박 해소.\n`;
  text += `- **자율신경 조절 약침 & 침구 치료**: 교감신경절 주변의 신경 긴장을 해소하고 뇌 혈류를 안정화.\n`;
  text += `- **퀀텀핏 심부 열대사 고주파 치료**: 온다(ONDA) 리프팅과 동일한 심부 열대사 기술로 자율신경 실조로 인한 냉증, 림프 순환 부전, 대사 저하를 치료.\n\n`;

  text += `## 중점 진료 분야 및 전문 칼럼 아카이브 (Clinical Columns by Category)\n`;
  text += `오브한의원 대표원장이 직접 집필한 8대 중점 진료 분야별 임상 칼럼 색인입니다.\n\n`;

  for (const category of CLINIC_CATEGORIES) {
    const categoryColumns = columns.filter((c) => c.category === category);
    if (categoryColumns.length === 0) continue;

    text += `### ${category} (${categoryColumns.length}편)\n`;
    for (const col of categoryColumns) {
      const colUrl = `${SITE_URL}/columns/${col.slug}`;
      text += `- [${col.title}](${colUrl}): ${col.summary}\n`;
    }
    text += `\n`;
  }

  // Any remaining columns if category differs
  const otherColumns = columns.filter((c) => !CLINIC_CATEGORIES.includes(c.category as any));
  if (otherColumns.length > 0) {
    text += `### 기타 임상 칼럼 (${otherColumns.length}편)\n`;
    for (const col of otherColumns) {
      const colUrl = `${SITE_URL}/columns/${col.slug}`;
      text += `- [${col.title}](${colUrl}): ${col.summary}\n`;
    }
    text += `\n`;
  }

  return new NextResponse(text, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
