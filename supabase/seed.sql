-- Motionix Admin Panel - Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor

-- ============================================================
-- 1. Seed Tools (8 tools from src/lib/tools.ts)
-- ============================================================

INSERT INTO tools (id, slug, name, engine, phase, status, glyph, tone, og_image, pricing, created_at, updated_at, published_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'background-remover', 'Background remover', 'image-onnx', 'functional', 'published', '✂', 'peach', 'background-remover-og.png', '{"type": "free"}', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000002', 'passport-photo-maker', 'Passport photo maker', 'photo-compliance', 'functional', 'published', '🪪', 'paper', 'passport-photo-maker-og.png', '{"type": "free"}', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000003', 'student-id-photo-maker', 'Student ID photo maker', 'photo-compliance', 'functional', 'published', '🎓', 'mint', 'student-id-photo-maker-og.png', '{"type": "free"}', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000004', 'resume-photo-maker', 'Resume & LinkedIn photo', 'image-canvas', 'functional', 'published', '👤', 'blush', 'resume-photo-maker-og.png', '{"type": "free"}', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000005', 'signature-maker', 'Signature maker', 'image-canvas', 'functional', 'published', '✍️', 'blush', 'signature-maker-og.png', '{"type": "free"}', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000006', 'photo-resizer', 'Photo resizer', 'image-resize', 'functional', 'published', '📐', 'sky', 'photo-resizer-og.png', '{"type": "free"}', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000007', 'image-compressor', 'Image compressor', 'image-compress', 'functional', 'published', '📸', 'ember', 'image-compressor-og.png', '{"type": "free"}', now(), now(), now()),
  ('a1000000-0000-0000-0000-000000000008', 'video-compressor', 'Video compressor', 'video-wasm', 'functional', 'published', '🎬', 'paper', 'video-compressor-og.png', '{"type": "free"}', now(), now(), now())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. Seed Tool SEO
-- ============================================================

INSERT INTO tool_seo (tool_id, locale, meta_title, meta_description, primary_keyword, secondary_keywords, search_intent) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'en', 'Free Background Remover — runs in your browser (Motionix)', 'Remove the background from a JPG, PNG, or WebP image in your browser. No upload, no account, no tracking.', 'background remover', '{"remove image background","AI background remover","remove background from photo","transparent background maker"}', 'Free online image background removal without uploading'),
  ('a1000000-0000-0000-0000-000000000002', 'en', 'Free Passport & Visa Photo Maker — country-correct on first try', 'Make a passport or visa photo that matches your country''s exact spec. Pick from US, UK, India, or Schengen.', 'passport photo maker', '{"passport photo online","visa photo maker","ID photo maker","passport photo requirements"}', 'Create compliant passport/visa photos online without visiting a studio'),
  ('a1000000-0000-0000-0000-000000000003', 'en', 'Student ID Photo Maker — exactly the right size (Motionix)', 'Make ID photos sized for the Common App, scholarship portals, and university admissions. Free, no signup.', 'student id photo maker', '{"student ID photo","school ID photo","college ID photo","exam photo maker"}', 'Create student ID photos for college portals and scholarship forms'),
  ('a1000000-0000-0000-0000-000000000004', 'en', 'Free Resume & LinkedIn Photo Tool — clean crops, recruiter-safe', 'Crop and reframe a headshot for LinkedIn, your resume, or a CV. Free, in your browser, no signup.', 'resume photo maker', '{"LinkedIn photo maker","resume headshot","CV photo","professional headshot online"}', 'Create professional headshot photos for resumes and LinkedIn'),
  ('a1000000-0000-0000-0000-000000000005', 'en', 'Free Signature Maker — transparent PNG, ready for contracts', 'Make a clean, transparent-PNG signature by drawing, typing, or uploading. Free, in your browser.', 'signature maker', '{"digital signature maker","electronic signature","create signature online","transparent PNG signature"}', 'Create digital signatures for PDFs, contracts, and email'),
  ('a1000000-0000-0000-0000-000000000006', 'en', 'Free Photo Resizer — exact pixel or KB targets', 'Resize photos to exact pixel dimensions or file-size targets. No signup, no upload, runs in your browser.', 'photo resizer', '{"resize photo online","image resizer","resize image to KB","photo size reducer"}', 'Resize photos to exact dimensions for portals or social media'),
  ('a1000000-0000-0000-0000-000000000007', 'en', 'Free Image Compressor — shrink JPG, PNG, WebP to a fraction of the size', 'Compress JPG, PNG, and WebP images for email, CMS, and the web. Quality-targeted, runs in your browser.', 'image compressor', '{"compress image online","compress JPG","compress PNG","image size reducer"}', 'Compress images to reduce file size while maintaining quality'),
  ('a1000000-0000-0000-0000-000000000008', 'en', 'Free Video Compressor — runs in your browser, no upload', 'Shrink an MP4, MOV, or WebM to email-able size in your browser. No upload, no server, powered by WebCodecs.', 'video compressor', '{"compress video online","compress MP4","reduce video size","video size reducer"}', 'Compress videos to reduce file size for email and messaging')
ON CONFLICT (tool_id, locale) DO NOTHING;

-- ============================================================
-- 3. Seed Tool Content
-- ============================================================

INSERT INTO tool_content (tool_id, locale, introduction, features, limitations, privacy, h1, content_updated_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'en',
   'Remove backgrounds from photos instantly — right in your browser. No uploads, no signup, no watermarks.',
   '{"100% browser-based processing","AI-powered ISNet model","Supports JPG, PNG, WebP, HEIC, AVIF","Download as transparent PNG or custom background","No watermarks, no quality loss"}',
   '{"Maximum file size: 10MB","Maximum dimensions: 4096px","Fine details like hair may have fuzzy edges","Not suitable for video or GIFs"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Free Background Remover — runs in your browser', '2026-08-08'),
  ('a1000000-0000-0000-0000-000000000002', 'en',
   'Create passport and visa photos that meet official requirements — right in your browser.',
   '{"Country-specific presets for US, UK, India, Schengen","Automatic head positioning","Strict mode: no pixel editing","Print-ready JPEG at correct DPI","100% browser-based"}',
   '{"Currently supports US, UK, India, Schengen","Requires face-forward photo with plain background","Glasses not recommended","Maximum file size: 10MB"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Free Passport & Visa Photo Maker', '2026-08-08'),
  ('a1000000-0000-0000-0000-000000000003', 'en',
   'Make ID photos sized for college portals, scholarship forms, and exam applications — right in your browser.',
   '{"Common App, scholarship, exam-day presets","Custom pixel dimensions","Browser-based processing","No watermarks, no signup","Supports JPG and PNG"}',
   '{"Requires face-forward photo with decent lighting","Maximum file size: 10MB","Maximum dimensions: 4096px"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Student ID Photo Maker', '2026-08-08'),
  ('a1000000-0000-0000-0000-000000000004', 'en',
   'Create polished resume and LinkedIn photos — right in your browser. No uploads, no signup, no watermarks.',
   '{"1:1 LinkedIn crop, 3:4 resume header","Background swap to white or brand colors","Browser-based processing","No watermarks, no signup","Export at 1400x1400 for LinkedIn"}',
   '{"Requires face-forward photo with decent lighting","Maximum file size: 10MB","Background swap limited to flat solid colors"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Free Resume & LinkedIn Photo Tool', '2026-08-08'),
  ('a1000000-0000-0000-0000-000000000005', 'en',
   'Draw, type, or upload a signature and get a transparent PNG instantly. Perfect for PDF contracts and email signatures.',
   '{"Draw with mouse, trackpad, or finger","Type a signature with multiple font styles","Upload a paper scan and auto-remove background","Download as transparent PNG or SVG","100% browser-based"}',
   '{"Drawing quality depends on input device","Maximum file size for uploads: 10MB","No cryptographic/legal validity"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Free Signature Maker — transparent PNG', '2026-08-08'),
  ('a1000000-0000-0000-0000-000000000006', 'en',
   'Resize photos to exact pixel dimensions or file-size targets — right in your browser.',
   '{"Exact pixel dimensions or KB target","Aspect-ratio lock","Bicubic and nearest-neighbor resampling","Supports JPG, PNG, WebP, HEIC, AVIF","100% browser-based"}',
   '{"Maximum input: 4096px, 10MB","Upscaling introduces softness","KB target may be unreachable at certain dimensions"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Free Photo Resizer — exact pixel or KB targets', '2026-08-08'),
  ('a1000000-0000-0000-0000-000000000007', 'en',
   'Compress JPG, PNG, and WebP images to a fraction of their size — visually identical.',
   '{"Quality-targeted compression","Side-by-side before/after comparison","Supports JPG, PNG, WebP, HEIC, AVIF","Target KB or percentage reduction","100% browser-based"}',
   '{"Maximum file size: 10MB","Very aggressive compression may introduce artifacts","PNG compression varies by content type"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Free Image Compressor — shrink JPG, PNG, WebP', '2026-08-08'),
  ('a1000000-0000-0000-0000-000000000008', 'en',
   'Shrink MP4, MOV, or WebM videos to email-able size — right in your browser. No upload, no server.',
   '{"Target file size or quality percentage","H.264 hardware-accelerated encoding","Supports MP4, MOV, MKV, WebM","Up to 200MB input files","100% browser-based"}',
   '{"Maximum file size: 200MB","Requires WebCodecs support","Audio re-encoded to AAC","Subtitles are dropped"}',
   '{"processing":"browser","uploadRequired":false,"retention":"No retention — files processed locally"}',
   'Free Video Compressor — runs in your browser', '2026-08-08')
ON CONFLICT (tool_id, locale) DO NOTHING;

-- ============================================================
-- 4. Seed Blog Clusters
-- ============================================================

INSERT INTO blog_clusters (id, slug, name, description, pillar_slug, tool_slug, status) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'background-removal', 'Background Removal', 'Everything about removing image backgrounds with AI', 'privacy-first-image-tools', 'background-remover', 'active'),
  ('b1000000-0000-0000-0000-000000000002', 'passport-photos', 'Passport Photos', 'Country-specific passport and visa photo requirements', 'passport-photo-rules-2026', 'passport-photo-maker', 'active'),
  ('b1000000-0000-0000-0000-000000000003', 'video-compression', 'Video Compression', 'Browser-based video compression technology', 'webcodecs-vs-ffmpeg-wasm', 'video-compressor', 'active'),
  ('b1000000-0000-0000-0000-000000000004', 'privacy-security', 'Privacy & Security', 'How Motionix protects user privacy', NULL, NULL, 'active'),
  ('b1000000-0000-0000-0000-000000000005', 'image-formats', 'Image Formats', 'Understanding image formats and compression', NULL, NULL, 'active'),
  ('b1000000-0000-0000-0000-000000000006', 'image-compression', 'Image Compression', 'Image compression techniques and best practices', NULL, 'image-compressor', 'active'),
  ('b1000000-0000-0000-0000-000000000007', 'photo-resizing', 'Photo Resizing', 'How to resize photos for any platform', NULL, 'photo-resizer', 'active'),
  ('b1000000-0000-0000-0000-000000000008', 'digital-signatures', 'Digital Signatures', 'Creating and using digital signatures', NULL, 'signature-maker', 'active'),
  ('b1000000-0000-0000-0000-000000000009', 'student-academic', 'Student & Academic', 'Photos and tools for students', NULL, 'student-id-photo-maker', 'active'),
  ('b1000000-0000-0000-0000-000000000010', 'resume-career', 'Resume & Career', 'Professional photos for career documents', NULL, 'resume-photo-maker', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. Seed Blog Posts
-- ============================================================

INSERT INTO blog_posts (id, slug, cluster_id, locale, title, description, author, published_at, updated_at, status, reading_minutes, primary_keyword, secondary_keywords, search_intent, related_tools) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'privacy-first-image-tools', 'b1000000-0000-0000-0000-000000000001', 'en',
   'Privacy-first image tools: why we still process in your browser',
   'Server-side image manipulation used to be the default. Browser-native tooling now means we never see your file.',
   'Motionix', '2026-07-04', '2026-07-04', 'published', 5,
   'privacy-first image tools', '{"browser-based processing","image privacy","client-side tools"}', 'Understanding how privacy-first image tools work',
   '{"background-remover","image-compressor"}'),

  ('c1000000-0000-0000-0000-000000000002', 'passport-photo-rules-2026', 'b1000000-0000-0000-0000-000000000002', 'en',
   'Passport photos that pass: US, UK, India, and Schengen rules (2026)',
   'Passport photo rules are country-by-country, regular as taxes, and quietly changed in 2024-25. We walk through what each country actually wants.',
   'Motionix', '2026-06-22', '2026-06-22', 'published', 6,
   'passport photo rules', '{"passport photo requirements","visa photo rules","passport photo size"}', 'Country-specific passport photo requirements',
   '{"passport-photo-maker"}'),

  ('c1000000-0000-0000-0000-000000000003', 'webcodecs-vs-ffmpeg-wasm', 'b1000000-0000-0000-0000-000000000003', 'en',
   'WebCodecs vs ffmpeg.wasm: why we switched our video compressor',
   'A side-by-side comparison of WebCodecs and ffmpeg.wasm for in-browser video compression in 2025-26.',
   'Motionix', '2026-06-15', '2026-06-15', 'published', 7,
   'WebCodecs vs ffmpeg.wasm', '{"video compression","browser video","WebCodecs performance"}', 'Understanding browser video compression technology',
   '{"video-compressor"}'),

  ('c1000000-0000-0000-0000-000000000004', 'how-motionix-stays-free', 'b1000000-0000-0000-0000-000000000004', 'en',
   'How Motionix stays free: a cost-first build story',
   'Most AI tools burn investor cash on server GPUs. We''re profitable from day one because nearly everything runs in the browser.',
   'Motionix', '2026-06-08', '2026-06-08', 'published', 5,
   'how motionix stays free', '{"free image tools","browser-based tools","cost-efficient SaaS"}', 'Understanding how Motionix stays free',
   NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 6. Seed Keywords
-- ============================================================

INSERT INTO keywords (keyword, locale, search_volume, keyword_difficulty, intent, tool_slug, target_url, country) VALUES
  ('background remover', 'en', 45000, 45, 'informational', 'background-remover', '/tools/background-remover', 'US'),
  ('remove background from photo', 'en', 33000, 42, 'informational', 'background-remover', '/tools/background-remover', 'US'),
  ('passport photo maker', 'en', 18000, 38, 'transactional', 'passport-photo-maker', '/tools/passport-photo-maker', 'US'),
  ('passport photo online', 'en', 14000, 35, 'transactional', 'passport-photo-maker', '/tools/passport-photo-maker', 'US'),
  ('image compressor', 'en', 27000, 40, 'informational', 'image-compressor', '/tools/image-compressor', 'US'),
  ('compress image online', 'en', 12000, 32, 'transactional', 'image-compressor', '/tools/image-compressor', 'US'),
  ('video compressor', 'en', 30000, 48, 'informational', 'video-compressor', '/tools/video-compressor', 'US'),
  ('compress video online', 'en', 15000, 40, 'transactional', 'video-compressor', '/tools/video-compressor', 'US'),
  ('photo resizer', 'en', 22000, 30, 'informational', 'photo-resizer', '/tools/photo-resizer', 'US'),
  ('resize image online', 'en', 18000, 28, 'transactional', 'photo-resizer', '/tools/photo-resizer', 'US'),
  ('signature maker', 'en', 12000, 25, 'transactional', 'signature-maker', '/tools/signature-maker', 'US'),
  ('digital signature maker', 'en', 8000, 22, 'transactional', 'signature-maker', '/tools/signature-maker', 'US'),
  ('resume photo maker', 'en', 5000, 18, 'transactional', 'resume-photo-maker', '/tools/resume-photo-maker', 'US'),
  ('student id photo', 'en', 4500, 15, 'transactional', 'student-id-photo-maker', '/tools/student-id-photo-maker', 'US')
ON CONFLICT (keyword, locale) DO NOTHING;

-- ============================================================
-- 7. Seed Tool FAQs
-- ============================================================

INSERT INTO tool_faqs (tool_id, locale, question, answer, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'en', 'Is it actually free?', 'Yes. There is no paid tier for the background remover and we do not show ads.', 1),
  ('a1000000-0000-0000-0000-000000000001', 'en', 'Where does the photo go?', 'Nowhere. The AI model runs entirely on your CPU or GPU. The image bytes never touch a server.', 2),
  ('a1000000-0000-0000-0000-000000000001', 'en', 'How big can the image be?', 'Up to 10 MB and 4096 pixels on the long side.', 3),
  ('a1000000-0000-0000-0000-000000000002', 'en', 'Will my photo get rejected?', 'If you submit a sharp, well-lit face-forward photo, our output follows each consulate''s published spec.', 1),
  ('a1000000-0000-0000-0000-000000000002', 'en', 'Does it edit my face?', 'Strict mode (the default) does not edit a single pixel of your face — it only crops and places the image.', 2),
  ('a1000000-0000-0000-0000-000000000002', 'en', 'Can I use this for visas?', 'Yes — use the Schengen preset for any Schengen/EU visa.', 3),
  ('a1000000-0000-0000-0000-000000000008', 'en', 'Why is this faster than online compressors?', 'Because we never upload your file. The transcoder runs on your machine via WebCodecs.', 1),
  ('a1000000-0000-0000-0000-000000000008', 'en', 'Is audio re-encoded too?', 'Yes — we keep audio at AAC. If your source has multiple tracks we keep the first one.', 2),
  ('a1000000-0000-0000-0000-000000000008', 'en', 'Why no file over 200 MB?', 'Browser tab memory limits. A 4 GB file would crash most tabs.', 3);
