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

-- ============================================================
-- 8. Seed Analytics Snapshots (30 days)
-- ============================================================

INSERT INTO analytics_snapshots (date, locale, page_url, impressions, clicks, ctr, avg_position, indexed_count) VALUES
  (CURRENT_DATE - INTERVAL '29 days', 'en', '/en/tools/background-remover', 1200, 85, 0.071, 4.2, 1),
  (CURRENT_DATE - INTERVAL '29 days', 'en', '/en/tools/passport-photo-maker', 950, 62, 0.065, 5.8, 1),
  (CURRENT_DATE - INTERVAL '29 days', 'en', '/en/tools/image-compressor', 800, 45, 0.056, 6.3, 1),
  (CURRENT_DATE - INTERVAL '28 days', 'en', '/en/tools/background-remover', 1250, 90, 0.072, 4.0, 1),
  (CURRENT_DATE - INTERVAL '28 days', 'en', '/en/tools/passport-photo-maker', 980, 68, 0.069, 5.5, 1),
  (CURRENT_DATE - INTERVAL '28 days', 'en', '/en/tools/image-compressor', 820, 48, 0.059, 6.1, 1),
  (CURRENT_DATE - INTERVAL '27 days', 'en', '/en/tools/background-remover', 1180, 82, 0.069, 4.3, 1),
  (CURRENT_DATE - INTERVAL '27 days', 'en', '/en/tools/video-compressor', 650, 35, 0.054, 7.2, 1),
  (CURRENT_DATE - INTERVAL '26 days', 'en', '/en/tools/background-remover', 1300, 95, 0.073, 3.8, 1),
  (CURRENT_DATE - INTERVAL '26 days', 'en', '/en/tools/passport-photo-maker', 1020, 72, 0.071, 5.2, 1),
  (CURRENT_DATE - INTERVAL '25 days', 'en', '/en/tools/background-remover', 1280, 92, 0.072, 3.9, 1),
  (CURRENT_DATE - INTERVAL '25 days', 'en', '/en/tools/photo-resizer', 700, 40, 0.057, 6.8, 1),
  (CURRENT_DATE - INTERVAL '24 days', 'en', '/en/tools/background-remover', 1350, 98, 0.073, 3.7, 1),
  (CURRENT_DATE - INTERVAL '24 days', 'en', '/en/tools/signature-maker', 550, 30, 0.055, 8.1, 1),
  (CURRENT_DATE - INTERVAL '23 days', 'en', '/en/tools/background-remover', 1400, 102, 0.073, 3.5, 1),
  (CURRENT_DATE - INTERVAL '23 days', 'en', '/en/tools/passport-photo-maker', 1100, 78, 0.071, 4.9, 1),
  (CURRENT_DATE - INTERVAL '22 days', 'en', '/en/tools/background-remover', 1380, 100, 0.072, 3.6, 1),
  (CURRENT_DATE - INTERVAL '22 days', 'en', '/en/tools/image-compressor', 880, 52, 0.059, 5.8, 1),
  (CURRENT_DATE - INTERVAL '21 days', 'en', '/en/tools/background-remover', 1420, 105, 0.074, 3.4, 1),
  (CURRENT_DATE - INTERVAL '21 days', 'en', '/en/tools/video-compressor', 720, 42, 0.058, 6.9, 1),
  (CURRENT_DATE - INTERVAL '20 days', 'en', '/en/tools/background-remover', 1450, 108, 0.074, 3.3, 1),
  (CURRENT_DATE - INTERVAL '20 days', 'en', '/en/tools/passport-photo-maker', 1150, 82, 0.071, 4.7, 1),
  (CURRENT_DATE - INTERVAL '19 days', 'en', '/en/tools/background-remover', 1480, 112, 0.076, 3.2, 1),
  (CURRENT_DATE - INTERVAL '19 days', 'en', '/en/tools/photo-resizer', 750, 45, 0.060, 6.5, 1),
  (CURRENT_DATE - INTERVAL '18 days', 'en', '/en/tools/background-remover', 1500, 115, 0.077, 3.1, 1),
  (CURRENT_DATE - INTERVAL '18 days', 'en', '/en/tools/image-compressor', 920, 58, 0.063, 5.5, 1),
  (CURRENT_DATE - INTERVAL '17 days', 'en', '/en/tools/background-remover', 1520, 118, 0.078, 3.0, 1),
  (CURRENT_DATE - INTERVAL '17 days', 'en', '/en/tools/signature-maker', 600, 35, 0.058, 7.8, 1),
  (CURRENT_DATE - INTERVAL '16 days', 'en', '/en/tools/background-remover', 1550, 120, 0.077, 3.0, 1),
  (CURRENT_DATE - INTERVAL '16 days', 'en', '/en/tools/passport-photo-maker', 1200, 88, 0.073, 4.5, 1),
  (CURRENT_DATE - INTERVAL '15 days', 'en', '/en/tools/background-remover', 1580, 125, 0.079, 2.9, 1),
  (CURRENT_DATE - INTERVAL '15 days', 'en', '/en/tools/video-compressor', 780, 48, 0.062, 6.5, 1),
  (CURRENT_DATE - INTERVAL '14 days', 'en', '/en/tools/background-remover', 1600, 128, 0.080, 2.8, 1),
  (CURRENT_DATE - INTERVAL '14 days', 'en', '/en/tools/image-compressor', 960, 62, 0.065, 5.2, 1),
  (CURRENT_DATE - INTERVAL '13 days', 'en', '/en/tools/background-remover', 1620, 130, 0.080, 2.8, 1),
  (CURRENT_DATE - INTERVAL '13 days', 'en', '/en/tools/passport-photo-maker', 1250, 92, 0.074, 4.3, 1),
  (CURRENT_DATE - INTERVAL '12 days', 'en', '/en/tools/background-remover', 1650, 135, 0.082, 2.7, 1),
  (CURRENT_DATE - INTERVAL '12 days', 'en', '/en/tools/photo-resizer', 800, 50, 0.063, 6.2, 1),
  (CURRENT_DATE - INTERVAL '11 days', 'en', '/en/tools/background-remover', 1680, 138, 0.082, 2.6, 1),
  (CURRENT_DATE - INTERVAL '11 days', 'en', '/en/tools/signature-maker', 650, 40, 0.062, 7.5, 1),
  (CURRENT_DATE - INTERVAL '10 days', 'en', '/en/tools/background-remover', 1700, 140, 0.082, 2.6, 1),
  (CURRENT_DATE - INTERVAL '10 days', 'en', '/en/tools/image-compressor', 1000, 68, 0.068, 5.0, 1),
  (CURRENT_DATE - INTERVAL '9 days', 'en', '/en/tools/background-remover', 1720, 142, 0.083, 2.5, 1),
  (CURRENT_DATE - INTERVAL '9 days', 'en', '/en/tools/passport-photo-maker', 1300, 98, 0.075, 4.1, 1),
  (CURRENT_DATE - INTERVAL '8 days', 'en', '/en/tools/background-remover', 1750, 148, 0.085, 2.4, 1),
  (CURRENT_DATE - INTERVAL '8 days', 'en', '/en/tools/video-compressor', 850, 55, 0.065, 6.2, 1),
  (CURRENT_DATE - INTERVAL '7 days', 'en', '/en/tools/background-remover', 1780, 152, 0.085, 2.4, 1),
  (CURRENT_DATE - INTERVAL '7 days', 'en', '/en/tools/image-compressor', 1050, 72, 0.069, 4.8, 1),
  (CURRENT_DATE - INTERVAL '6 days', 'en', '/en/tools/background-remover', 1800, 155, 0.086, 2.3, 1),
  (CURRENT_DATE - INTERVAL '6 days', 'en', '/en/tools/passport-photo-maker', 1350, 102, 0.076, 3.9, 1),
  (CURRENT_DATE - INTERVAL '5 days', 'en', '/en/tools/background-remover', 1820, 158, 0.087, 2.3, 1),
  (CURRENT_DATE - INTERVAL '5 days', 'en', '/en/tools/photo-resizer', 850, 55, 0.065, 5.9, 1),
  (CURRENT_DATE - INTERVAL '4 days', 'en', '/en/tools/background-remover', 1850, 162, 0.088, 2.2, 1),
  (CURRENT_DATE - INTERVAL '4 days', 'en', '/en/tools/signature-maker', 700, 45, 0.064, 7.2, 1),
  (CURRENT_DATE - INTERVAL '3 days', 'en', '/en/tools/background-remover', 1880, 165, 0.088, 2.2, 1),
  (CURRENT_DATE - INTERVAL '3 days', 'en', '/en/tools/image-compressor', 1100, 78, 0.071, 4.6, 1),
  (CURRENT_DATE - INTERVAL '2 days', 'en', '/en/tools/background-remover', 1900, 168, 0.088, 2.1, 1),
  (CURRENT_DATE - INTERVAL '2 days', 'en', '/en/tools/passport-photo-maker', 1400, 108, 0.077, 3.7, 1),
  (CURRENT_DATE - INTERVAL '1 day', 'en', '/en/tools/background-remover', 1920, 172, 0.090, 2.0, 1),
  (CURRENT_DATE - INTERVAL '1 day', 'en', '/en/tools/video-compressor', 900, 60, 0.067, 5.8, 1),
  (CURRENT_DATE, 'en', '/en/tools/background-remover', 1950, 175, 0.090, 2.0, 1),
  (CURRENT_DATE, 'en', '/en/tools/passport-photo-maker', 1450, 112, 0.077, 3.6, 1),
  (CURRENT_DATE, 'en', '/en/tools/image-compressor', 1150, 82, 0.071, 4.5, 1);

-- ============================================================
-- 9. Seed Tool Usage Events
-- ============================================================

INSERT INTO tool_usage_events (tool_slug, event_type, locale, browser, device, file_size, file_format, processing_time_ms, error_type, created_at) VALUES
  ('background-remover', 'tool_start', 'en', 'Chrome', 'desktop', 2400000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '2 hours'),
  ('background-remover', 'tool_complete', 'en', 'Chrome', 'desktop', 2400000, 'image/jpeg', 1850, NULL, NOW() - INTERVAL '2 hours'),
  ('passport-photo-maker', 'tool_start', 'en', 'Safari', 'mobile', 1800000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '3 hours'),
  ('passport-photo-maker', 'tool_complete', 'en', 'Safari', 'mobile', 1800000, 'image/jpeg', 920, NULL, NOW() - INTERVAL '3 hours'),
  ('image-compressor', 'tool_start', 'en', 'Firefox', 'desktop', 5200000, 'image/png', NULL, NULL, NOW() - INTERVAL '4 hours'),
  ('image-compressor', 'tool_complete', 'en', 'Firefox', 'desktop', 5200000, 'image/png', 3200, NULL, NOW() - INTERVAL '4 hours'),
  ('video-compressor', 'tool_start', 'en', 'Chrome', 'desktop', 85000000, 'video/mp4', NULL, NULL, NOW() - INTERVAL '5 hours'),
  ('video-compressor', 'tool_complete', 'en', 'Chrome', 'desktop', 85000000, 'video/mp4', 45000, NULL, NOW() - INTERVAL '5 hours'),
  ('photo-resizer', 'tool_start', 'en', 'Edge', 'desktop', 3100000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '6 hours'),
  ('photo-resizer', 'tool_complete', 'en', 'Edge', 'desktop', 3100000, 'image/jpeg', 450, NULL, NOW() - INTERVAL '6 hours'),
  ('signature-maker', 'tool_start', 'en', 'Chrome', 'desktop', NULL, NULL, NULL, NULL, NOW() - INTERVAL '7 hours'),
  ('signature-maker', 'tool_complete', 'en', 'Chrome', 'desktop', NULL, 'image/png', 120, NULL, NOW() - INTERVAL '7 hours'),
  ('student-id-photo-maker', 'tool_start', 'en', 'Safari', 'mobile', 2200000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '8 hours'),
  ('student-id-photo-maker', 'tool_complete', 'en', 'Safari', 'mobile', 2200000, 'image/jpeg', 780, NULL, NOW() - INTERVAL '8 hours'),
  ('resume-photo-maker', 'tool_start', 'en', 'Chrome', 'desktop', 2800000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '9 hours'),
  ('resume-photo-maker', 'tool_complete', 'en', 'Chrome', 'desktop', 2800000, 'image/jpeg', 1100, NULL, NOW() - INTERVAL '9 hours'),
  ('background-remover', 'tool_start', 'de', 'Chrome', 'desktop', 3200000, 'image/png', NULL, NULL, NOW() - INTERVAL '10 hours'),
  ('background-remover', 'tool_complete', 'de', 'Chrome', 'desktop', 3200000, 'image/png', 2100, NULL, NOW() - INTERVAL '10 hours'),
  ('image-compressor', 'tool_start', 'fr', 'Safari', 'mobile', 4800000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '11 hours'),
  ('image-compressor', 'tool_complete', 'fr', 'Safari', 'mobile', 4800000, 'image/jpeg', 2800, NULL, NOW() - INTERVAL '11 hours'),
  ('background-remover', 'tool_start', 'en', 'Chrome', 'desktop', 15000000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '12 hours'),
  ('background-remover', 'tool_error', 'en', 'Chrome', 'desktop', 15000000, 'image/jpeg', NULL, 'file_too_large', NOW() - INTERVAL '12 hours'),
  ('video-compressor', 'tool_start', 'ja', 'Chrome', 'mobile', 120000000, 'video/mp4', NULL, NULL, NOW() - INTERVAL '13 hours'),
  ('video-compressor', 'tool_complete', 'ja', 'Chrome', 'mobile', 120000000, 'video/mp4', 62000, NULL, NOW() - INTERVAL '13 hours'),
  ('passport-photo-maker', 'tool_start', 'hi', 'Chrome', 'desktop', 2000000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '14 hours'),
  ('passport-photo-maker', 'tool_complete', 'hi', 'Chrome', 'desktop', 2000000, 'image/jpeg', 880, NULL, NOW() - INTERVAL '14 hours'),
  ('photo-resizer', 'tool_start', 'zh-cn', 'Chrome', 'desktop', 4500000, 'image/png', NULL, NULL, NOW() - INTERVAL '15 hours'),
  ('photo-resizer', 'tool_complete', 'zh-cn', 'Chrome', 'desktop', 4500000, 'image/png', 520, NULL, NOW() - INTERVAL '15 hours'),
  ('image-compressor', 'tool_start', 'en', 'Firefox', 'desktop', 8200000, 'image/png', NULL, NULL, NOW() - INTERVAL '16 hours'),
  ('image-compressor', 'tool_complete', 'en', 'Firefox', 'desktop', 8200000, 'image/png', 4100, NULL, NOW() - INTERVAL '16 hours'),
  ('signature-maker', 'tool_start', 'de', 'Chrome', 'mobile', NULL, NULL, NULL, NULL, NOW() - INTERVAL '17 hours'),
  ('signature-maker', 'tool_complete', 'de', 'Chrome', 'mobile', NULL, 'image/png', 95, NULL, NOW() - INTERVAL '17 hours'),
  ('background-remover', 'tool_start', 'en', 'Safari', 'mobile', 2600000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '18 hours'),
  ('background-remover', 'tool_complete', 'en', 'Safari', 'mobile', 2600000, 'image/jpeg', 2400, NULL, NOW() - INTERVAL '18 hours'),
  ('video-compressor', 'tool_start', 'en', 'Chrome', 'desktop', 65000000, 'video/webm', NULL, NULL, NOW() - INTERVAL '19 hours'),
  ('video-compressor', 'tool_complete', 'en', 'Chrome', 'desktop', 65000000, 'video/webm', 38000, NULL, NOW() - INTERVAL '19 hours'),
  ('passport-photo-maker', 'tool_start', 'en', 'Edge', 'desktop', 1900000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '20 hours'),
  ('passport-photo-maker', 'tool_complete', 'en', 'Edge', 'desktop', 1900000, 'image/jpeg', 850, NULL, NOW() - INTERVAL '20 hours'),
  ('resume-photo-maker', 'tool_start', 'fr', 'Safari', 'mobile', 3000000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '21 hours'),
  ('resume-photo-maker', 'tool_complete', 'fr', 'Safari', 'mobile', 3000000, 'image/jpeg', 1200, NULL, NOW() - INTERVAL '21 hours'),
  ('student-id-photo-maker', 'tool_start', 'en', 'Chrome', 'desktop', 2100000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '22 hours'),
  ('student-id-photo-maker', 'tool_complete', 'en', 'Chrome', 'desktop', 2100000, 'image/jpeg', 720, NULL, NOW() - INTERVAL '22 hours'),
  ('image-compressor', 'tool_start', 'en', 'Chrome', 'desktop', 12000000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '23 hours'),
  ('image-compressor', 'tool_error', 'en', 'Chrome', 'desktop', 12000000, 'image/jpeg', NULL, 'file_too_large', NOW() - INTERVAL '23 hours'),
  ('background-remover', 'tool_start', 'ja', 'Chrome', 'mobile', 2800000, 'image/jpeg', NULL, NULL, NOW() - INTERVAL '24 hours'),
  ('background-remover', 'tool_complete', 'ja', 'Chrome', 'mobile', 2800000, 'image/jpeg', 2600, NULL, NOW() - INTERVAL '24 hours'),
  ('photo-resizer', 'tool_start', 'en', 'Firefox', 'desktop', 3500000, 'image/png', NULL, NULL, NOW() - INTERVAL '25 hours'),
  ('photo-resizer', 'tool_complete', 'en', 'Firefox', 'desktop', 3500000, 'image/png', 480, NULL, NOW() - INTERVAL '25 hours'),
  ('signature-maker', 'tool_start', 'en', 'Chrome', 'desktop', NULL, NULL, NULL, NULL, NOW() - INTERVAL '26 hours'),
  ('signature-maker', 'tool_complete', 'en', 'Chrome', 'desktop', NULL, 'image/svg', 85, NULL, NOW() - INTERVAL '26 hours');

-- ============================================================
-- 10. Seed Performance Snapshots
-- ============================================================

INSERT INTO performance_snapshots (page_url, lcp, inp, cls, ttfb, locale, device, measured_at) VALUES
  ('/en', 1.8, 45, 0.02, 320, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en', 2.9, 120, 0.08, 580, 'en', 'mobile', NOW() - INTERVAL '1 day'),
  ('/en/tools/background-remover', 2.2, 65, 0.03, 380, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en/tools/background-remover', 3.4, 180, 0.12, 720, 'en', 'mobile', NOW() - INTERVAL '1 day'),
  ('/en/tools/passport-photo-maker', 2.0, 55, 0.02, 350, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en/tools/image-compressor', 2.5, 78, 0.04, 420, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en/tools/video-compressor', 3.1, 95, 0.06, 510, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en/tools/photo-resizer', 1.9, 48, 0.02, 330, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en/tools/signature-maker', 1.7, 42, 0.01, 310, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en/about', 1.6, 38, 0.01, 290, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en/blog', 2.1, 58, 0.03, 370, 'en', 'desktop', NOW() - INTERVAL '1 day'),
  ('/en', 2.0, 50, 0.02, 340, 'en', 'desktop', NOW() - INTERVAL '7 days'),
  ('/en', 3.1, 130, 0.09, 600, 'en', 'mobile', NOW() - INTERVAL '7 days'),
  ('/en/tools/background-remover', 2.4, 70, 0.04, 400, 'en', 'desktop', NOW() - INTERVAL '7 days'),
  ('/en/tools/background-remover', 3.6, 190, 0.13, 750, 'en', 'mobile', NOW() - INTERVAL '7 days'),
  ('/en/tools/passport-photo-maker', 2.2, 60, 0.03, 370, 'en', 'desktop', NOW() - INTERVAL '7 days'),
  ('/en', 2.2, 55, 0.03, 360, 'en', 'desktop', NOW() - INTERVAL '14 days'),
  ('/en/tools/background-remover', 2.6, 75, 0.04, 420, 'en', 'desktop', NOW() - INTERVAL '14 days'),
  ('/en/tools/image-compressor', 2.8, 85, 0.05, 450, 'en', 'desktop', NOW() - INTERVAL '14 days'),
  ('/en/tools/video-compressor', 3.5, 110, 0.08, 550, 'en', 'desktop', NOW() - INTERVAL '14 days');

-- ============================================================
-- 11. Seed Internal Links
-- ============================================================

INSERT INTO internal_links (source_url, target_url, anchor_text, link_type, status) VALUES
  ('/en/tools/background-remover', '/en/tools/passport-photo-maker', 'passport photo maker', 'related_tool', 'active'),
  ('/en/tools/background-remover', '/en/tools/resume-photo-maker', 'resume photo tool', 'related_tool', 'active'),
  ('/en/tools/passport-photo-maker', '/en/tools/background-remover', 'background remover', 'related_tool', 'active'),
  ('/en/tools/passport-photo-maker', '/en/tools/student-id-photo-maker', 'student ID photos', 'related_tool', 'active'),
  ('/en/tools/image-compressor', '/en/tools/photo-resizer', 'photo resizer', 'related_tool', 'active'),
  ('/en/tools/video-compressor', '/en/tools/image-compressor', 'image compressor', 'related_tool', 'active'),
  ('/en/tools/signature-maker', '/en/tools/photo-resizer', 'resize your signature', 'related_tool', 'active'),
  ('/en/blog/privacy-first-image-tools', '/en/tools/background-remover', 'try our background remover', 'blog_to_tool', 'active'),
  ('/en/blog/passport-photo-rules-2026', '/en/tools/passport-photo-maker', 'passport photo maker', 'blog_to_tool', 'active'),
  ('/en/blog/compress-images-without-losing-quality', '/en/tools/image-compressor', 'image compressor', 'blog_to_tool', 'active'),
  ('/en/blog/webcodecs-vs-ffmpeg-wasm', '/en/tools/video-compressor', 'video compressor', 'blog_to_tool', 'active'),
  ('/en/blog/create-digital-signature', '/en/tools/signature-maker', 'signature maker', 'blog_to_tool', 'active'),
  ('/en/blog/resize-photos-social-media', '/en/tools/photo-resizer', 'photo resizer', 'blog_to_tool', 'active'),
  ('/en/blog/student-id-photo-guide', '/en/tools/student-id-photo-maker', 'student ID photo maker', 'blog_to_tool', 'active'),
  ('/en/blog/resume-photo-guide', '/en/tools/resume-photo-maker', 'resume photo maker', 'blog_to_tool', 'active');

-- ============================================================
-- 12. Seed Redirects
-- ============================================================

INSERT INTO redirects (source_path, destination_path, status_code, reason, hit_count, created_by) VALUES
  ('/tools/bg-remover', '/en/tools/background-remover', 301, 'URL slug change', 245, 'system'),
  ('/tools/passport', '/en/tools/passport-photo-maker', 301, 'URL slug change', 189, 'system'),
  ('/tools/compress', '/en/tools/image-compressor', 301, 'URL slug change', 156, 'system'),
  ('/blog/privacy-tools', '/en/blog/privacy-first-image-tools', 301, 'URL slug change', 78, 'system'),
  ('/tools/video', '/en/tools/video-compressor', 301, 'URL slug change', 134, 'system');

-- ============================================================
-- 13. Seed SEO Issues
-- ============================================================

INSERT INTO seo_issues (issue_type, severity, page_url, description, resolved, created_at) VALUES
  ('missing_meta_description', 'warning', '/en/tools/student-id-photo-maker', 'Meta description is too short (45 chars). Recommended: 120-160 chars.', false, NOW() - INTERVAL '2 days'),
  ('missing_h1', 'critical', '/en/admin/login', 'Page has no H1 tag. Add a descriptive H1 for SEO.', false, NOW() - INTERVAL '3 days'),
  ('slow_lcp', 'warning', '/en/tools/background-remover', 'LCP is 3.4s on mobile. Target: < 2.5s.', false, NOW() - INTERVAL '1 day'),
  ('missing_alt_text', 'info', '/en/blog/passport-photo-rules-2026', 'Image missing alt text. Add descriptive alt for accessibility.', false, NOW() - INTERVAL '4 days'),
  ('broken_internal_link', 'critical', '/en/tools/signature-maker', 'Link to /en/tools/watermark-remover returns 404.', false, NOW() - INTERVAL '5 days'),
  ('duplicate_title', 'warning', '/en/privacy', 'Title tag duplicates /en/terms page title.', true, NOW() - INTERVAL '10 days'),
  ('missing_canonical', 'warning', '/en/sitemap', 'Page missing canonical URL tag.', true, NOW() - INTERVAL '12 days'),
  ('thin_content', 'info', '/en/cookies', 'Page has less than 300 words. Consider expanding content.', false, NOW() - INTERVAL '6 days');

-- ============================================================
-- 14. Seed Media
-- ============================================================

INSERT INTO media (filename, original_name, mime_type, size_bytes, width, height, alt_text, storage_path, uploaded_by) VALUES
  ('og-default.png', 'og-default.png', 'image/png', 245000, 1200, 630, 'Motionix default OG image', '/og/og-default.png', 'system'),
  ('background-remover-og.png', 'background-remover-og.png', 'image/png', 198000, 1200, 630, 'Background Remover tool OG image', '/og/tools/background-remover-og.png', 'system'),
  ('passport-photo-maker-og.png', 'passport-photo-maker-og.png', 'image/png', 210000, 1200, 630, 'Passport Photo Maker tool OG image', '/og/tools/passport-photo-maker-og.png', 'system'),
  ('image-compressor-og.png', 'image-compressor-og.png', 'image/png', 185000, 1200, 630, 'Image Compressor tool OG image', '/og/tools/image-compressor-og.png', 'system'),
  ('video-compressor-og.png', 'video-compressor-og.png', 'image/png', 220000, 1200, 630, 'Video Compressor tool OG image', '/og/tools/video-compressor-og.png', 'system'),
  ('photo-resizer-og.png', 'photo-resizer-og.png', 'image/png', 175000, 1200, 630, 'Photo Resizer tool OG image', '/og/tools/photo-resizer-og.png', 'system'),
  ('signature-maker-og.png', 'signature-maker-og.png', 'image/png', 165000, 1200, 630, 'Signature Maker tool OG image', '/og/tools/signature-maker-og.png', 'system'),
  ('student-id-photo-maker-og.png', 'student-id-photo-maker-og.png', 'image/png', 190000, 1200, 630, 'Student ID Photo Maker tool OG image', '/og/tools/student-id-photo-maker-og.png', 'system'),
  ('resume-photo-maker-og.png', 'resume-photo-maker-og.png', 'image/png', 195000, 1200, 630, 'Resume Photo Maker tool OG image', '/og/tools/resume-photo-maker-og.png', 'system'),
  ('favicon.ico', 'favicon.ico', 'image/x-icon', 4200, 32, 32, 'Motionix favicon', '/favicon.ico', 'system');

-- ============================================================
-- 15. Seed Audit Logs
-- ============================================================

INSERT INTO audit_logs (user_id, user_email, action, resource, resource_id, ip_address, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'login', 'auth', NULL, '192.168.1.1', NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'update', 'tool', 'a1000000-0000-0000-0000-000000000001', '192.168.1.1', NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'create', 'blog_post', 'c1000000-0000-0000-0000-000000000001', '192.168.1.1', NOW() - INTERVAL '3 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'update', 'seo_settings', NULL, '192.168.1.1', NOW() - INTERVAL '4 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'login', 'auth', NULL, '192.168.1.1', NOW() - INTERVAL '5 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'update', 'translation', NULL, '192.168.1.1', NOW() - INTERVAL '6 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'create', 'redirect', NULL, '192.168.1.1', NOW() - INTERVAL '7 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'update', 'tool', 'a1000000-0000-0000-0000-000000000002', '192.168.1.1', NOW() - INTERVAL '8 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'login', 'auth', NULL, '10.0.0.1', NOW() - INTERVAL '24 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'create', 'blog_post', 'c1000000-0000-0000-0000-000000000002', '10.0.0.1', NOW() - INTERVAL '25 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'update', 'site_settings', NULL, '10.0.0.1', NOW() - INTERVAL '26 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'delete', 'media', NULL, '10.0.0.1', NOW() - INTERVAL '27 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'update', 'tool', 'a1000000-0000-0000-0000-000000000003', '10.0.0.1', NOW() - INTERVAL '48 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'create', 'feature_flag', NULL, '10.0.0.1', NOW() - INTERVAL '49 hours'),
  ('00000000-0000-0000-0000-000000000001', 'admin@motionix.xyz', 'login', 'auth', NULL, '172.16.0.1', NOW() - INTERVAL '72 hours');

-- ============================================================
-- 16. Seed Feature Flags
-- ============================================================

INSERT INTO feature_flags (key, description, enabled) VALUES
  ('dark_mode', 'Enable dark mode toggle for the marketing site', false),
  ('beta_tools', 'Show beta tools in the tools catalog', false),
  ('ai_suggestions', 'Enable AI-powered content suggestions in the admin panel', false),
  ('maintenance_mode', 'Put the site in maintenance mode', false),
  ('analytics_v2', 'Use the new analytics dashboard layout', true);

-- ============================================================
-- 17. Seed Site Settings
-- ============================================================

INSERT INTO site_settings (key, value, category, updated_by) VALUES
  ('site_name', '"Motionix"', 'branding', 'system'),
  ('site_tagline', '"Privacy-first image and video tools"', 'branding', 'system'),
  ('default_locale', '"en"', 'localization', 'system'),
  ('supported_locales', '["en","fr","de","hi","ja","zh-cn"]', 'localization', 'system'),
  ('ga4_measurement_id', 'null', 'integrations', 'system'),
  ('gsc_site_url', '"sc-domain:motionix.xyz"', 'integrations', 'system'),
  ('ahrefs_key', 'null', 'integrations', 'system'),
  ('maintenance_message', '"We are currently performing scheduled maintenance. Please check back soon."', 'maintenance', 'system');

-- ============================================================
-- 18. Seed Translation Completeness
-- ============================================================

INSERT INTO translation_completeness (locale, page_path, seo_complete, ui_complete, content_complete, indexable) VALUES
  ('en', '/', true, true, true, true),
  ('en', '/tools', true, true, true, true),
  ('en', '/about', true, true, true, true),
  ('en', '/contact', true, true, true, true),
  ('en', '/blog', true, true, true, true),
  ('en', '/privacy', true, true, true, true),
  ('fr', '/', true, true, true, true),
  ('fr', '/tools', true, true, true, true),
  ('fr', '/about', true, true, true, true),
  ('fr', '/contact', true, true, false, false),
  ('fr', '/blog', true, true, true, true),
  ('fr', '/privacy', true, false, false, false),
  ('de', '/', true, true, true, true),
  ('de', '/tools', true, true, true, true),
  ('de', '/about', true, true, true, true),
  ('de', '/contact', true, true, false, false),
  ('de', '/blog', true, true, true, true),
  ('de', '/privacy', true, false, false, false),
  ('hi', '/', true, true, false, false),
  ('hi', '/tools', true, true, false, false),
  ('hi', '/about', true, false, false, false),
  ('hi', '/contact', false, false, false, false),
  ('hi', '/blog', true, true, false, false),
  ('hi', '/privacy', false, false, false, false),
  ('ja', '/', true, true, true, true),
  ('ja', '/tools', true, true, true, true),
  ('ja', '/about', true, true, false, false),
  ('ja', '/contact', true, false, false, false),
  ('ja', '/blog', true, true, true, true),
  ('ja', '/privacy', true, false, false, false),
  ('zh-cn', '/', true, true, false, false),
  ('zh-cn', '/tools', true, true, false, false),
  ('zh-cn', '/about', true, false, false, false),
  ('zh-cn', '/contact', false, false, false, false),
  ('zh-cn', '/blog', true, true, false, false),
  ('zh-cn', '/privacy', false, false, false, false);

-- ============================================================
-- 19. Seed Translations
-- ============================================================

INSERT INTO translations (locale, namespace, key, value, status) VALUES
  ('fr', 'Common', 'home', 'Accueil', 'approved'),
  ('fr', 'Common', 'tools', 'Outils', 'approved'),
  ('fr', 'Common', 'blog', 'Blog', 'approved'),
  ('fr', 'Common', 'about', 'À propos', 'approved'),
  ('fr', 'Common', 'contact', 'Contact', 'approved'),
  ('fr', 'Common', 'privacy', 'Confidentialité', 'approved'),
  ('de', 'Common', 'home', 'Startseite', 'approved'),
  ('de', 'Common', 'tools', 'Werkzeuge', 'approved'),
  ('de', 'Common', 'blog', 'Blog', 'approved'),
  ('de', 'Common', 'about', 'Über uns', 'approved'),
  ('de', 'Common', 'contact', 'Kontakt', 'approved'),
  ('de', 'Common', 'privacy', 'Datenschutz', 'approved'),
  ('hi', 'Common', 'home', 'होम', 'approved'),
  ('hi', 'Common', 'tools', 'उपकरण', 'approved'),
  ('hi', 'Common', 'blog', 'ब्लॉग', 'approved'),
  ('ja', 'Common', 'home', 'ホーム', 'approved'),
  ('ja', 'Common', 'tools', 'ツール', 'approved'),
  ('ja', 'Common', 'blog', 'ブログ', 'approved'),
  ('zh-cn', 'Common', 'home', '首页', 'approved'),
  ('zh-cn', 'Common', 'tools', '工具', 'approved'),
  ('zh-cn', 'Common', 'blog', '博客', 'approved'),
  ('fr', 'SEO', 'home.title', 'Outils gratuits d''image et de vidéo — Motionix', 'approved'),
  ('fr', 'SEO', 'home.description', 'Outils gratuits dans le navigateur pour la suppression d''arrière-plan, les photos d''identité, et plus.', 'approved'),
  ('de', 'SEO', 'home.title', 'Kostenlose Bild- und Video-Tools — Motionix', 'approved'),
  ('de', 'SEO', 'home.description', 'Kostenlose Browser-Tools für Hintergrundentfernung, Passfotos und mehr.', 'approved'),
  ('hi', 'SEO', 'home.title', 'मुफ्त छवि और वीडियो उपकरण — Motionix', 'pending'),
  ('ja', 'SEO', 'home.title', '無料の画像・動画ツール — Motionix', 'approved'),
  ('zh-cn', 'SEO', 'home.title', '免费图像和视频工具 — Motionix', 'pending'),
  ('fr', 'Tools', 'background-remover.tagline', 'Supprimez l''arrière-plan d''une photo en quelques secondes.', 'approved'),
  ('de', 'Tools', 'background-remover.tagline', 'Entfernen Sie den Hintergrund eines Fotos in Sekunden.', 'approved');
