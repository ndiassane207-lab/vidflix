import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const title = (form.get('title') as string || 'Sans titre').trim();
    const description = (form.get('description') as string || '').trim();

    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

    const maxSize = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSize) return NextResponse.json({ error: 'Fichier trop grand (max 100 Mo)' }, { status: 400 });

    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return NextResponse.json({ error: 'Format non supporté. Utilise MP4, WebM, MOV.' }, { status: 400 });
    }

    // Upload to 0x0.st (free file hosting, no account needed)
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('secret', '');

    const uploadRes = await fetch('https://0x0.st', {
      method: 'POST',
      body: uploadForm,
      signal: AbortSignal.timeout(60000),
    });

    if (!uploadRes.ok) throw new Error('Upload failed');

    const fileUrl = (await uploadRes.text()).trim();
    if (!fileUrl.startsWith('https://')) throw new Error('Invalid response');

    // Build share link
    const shareUrl = fileUrl;
    const slug = fileUrl.split('/').pop() || '';

    return NextResponse.json({
      success: true,
      shareUrl,
      slug,
      title,
      description,
      filename: file.name,
      size: file.size,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur upload. Réessaie.' }, { status: 500 });
  }
}
