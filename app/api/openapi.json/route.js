import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const origin = request?.nextUrl?.origin || 'http://localhost:3000';

  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'PANGANITA API Documentation',
      version: '1.0.0',
      description:
        'Dokumentasi resmi REST API platform **PANGANITA** (Pangan Gizi untuk Keluarga).\n\n' +
        'Mencakup seluruh layanan utama platform:\n' +
        '- **Autentikasi (WhatsApp OTP & Sesi)**: Request kode OTP WhatsApp (via Fonnte) dan verifikasi OTP menjadi sesi Supabase Auth.\n' +
        '- **Profil & Asesmen**: Profil ibu, domisili, dan asesmen awal anggota keluarga 1.000 HPK.\n' +
        '- **AI CV & Keputusan Panen**: Deteksi gambar hasil panen pekarangan, kalkulasi AKG vs penjualan, Supabase Storage, dan riwayat.\n' +
        '- **Bu Nita AI**: RAG Chatbot Gizi Keluarga, transkripsi Voice Note multidialek Nusantara, dan zona waktu wilayah.',
      contact: {
        name: 'Tim Teknis PANGANITA',
      },
    },
    servers: [
      {
        url: origin,
        description: 'Server Aktif Saat Ini',
      },
    ],
    tags: [
      {
        name: 'Bu Nita AI',
        description:
          'Chatbot RAG Gizi Keluarga, Transkripsi Voice Note Multidialek Nusantara, dan Zona Waktu Wilayah.',
      },
      {
        name: 'Autentikasi WhatsApp OTP',
        description:
          'Kirim dan verifikasi kode OTP 6 digit melalui WhatsApp (Fonnte API) terhubung ke Supabase Auth.',
      },
      {
        name: 'Profil & Asesmen',
        description:
          'API profil ibu, domisili, dan asesmen awal anggota keluarga 1.000 HPK.',
      },
      {
        name: 'AI CV & Keputusan Panen',
        description:
          'API deteksi gambar hasil panen (AI CV), kalkulasi keputusan gizi vs jual, Supabase Storage, dan riwayat.',
      },
      {
        name: 'Dokumentasi',
        description: 'Spesifikasi OpenAPI JSON.',
      },
    ],
    components: {
      securitySchemes: {
        SupabaseSessionCookie: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sb-access-token',
          description:
            'Sesi login Supabase Auth berbasis HTTP cookie browser (otomatis terkirim saat login di web).',
        },
      },
      schemas: {
        SourceReference: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 9 },
            title: {
              type: 'string',
              example:
                'Buku Panduan Gizi Panganita · Halaman 9 — Bab 4: Vitamin & Mineral Sayuran Pekarangan (Bayam, Kangkung, Wortel)',
            },
            source: {
              type: 'string',
              example:
                'TKPI Kemenkes RI, Permenkes No. 28/2019 & Modul WHO PMBA',
            },
          },
        },
        DialectInfo: {
          type: 'object',
          properties: {
            detected: {
              type: 'array',
              items: { type: 'string' },
              example: ['Sunda'],
            },
            isDialect: { type: 'boolean', example: true },
            normalizedQuery: {
              type: 'string',
              example:
                'saya ingin tahu kalori gizi untuk bayi anak balita umur 2 tahun',
            },
            commodities: {
              type: 'array',
              items: { type: 'string' },
              example: ['ikan lele', 'bayam hijau'],
            },
          },
        },
        ChatMessageItem: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '102' },
            role: { type: 'string', enum: ['user', 'assistant'] },
            content: {
              type: 'string',
              example:
                'Abdi hoyong terang kalori gizi pikeun murangkalih umur 2 tahun.',
            },
            sources: {
              type: 'array',
              items: { $ref: '#/components/schemas/SourceReference' },
            },
            time: { type: 'string', example: '12:23 WIT' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'string',
              example: 'Pesan atau rekaman suara tidak boleh kosong.',
            },
          },
        },
      },
    },
    paths: {
      '/api/chat': {
        get: {
          tags: ['Bu Nita AI'],
          summary: 'Muat riwayat percakapan aktif & lokasi profil',
          description:
            'Mengambil percakapan terakhir yang belum diarsipkan milik pengguna dari Supabase (`percakapan` & `pesan_chat`), memperkaya metadata sumber rujukan, dan memformat timestamp sesuai zona waktu domisili profil (`WIB`, `WITA`, `WIT`).',
          security: [{ SupabaseSessionCookie: [] }],
          responses: {
            200: {
              description: 'Riwayat percakapan berhasil dimuat',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          conversationId: {
                            type: 'string',
                            nullable: true,
                            example: '84d1b63e-1234-4abc-9def-001122334455',
                          },
                          location: {
                            type: 'string',
                            example: 'Manokwari, Papua Barat',
                          },
                          messages: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/ChatMessageItem',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Belum login / sesi Supabase tidak valid',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Profil keluarga belum dilengkapi di /keluarga',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Bu Nita AI'],
          summary:
            'Kirim pesan teks / Voice Note ke Bu Nita AI atau buat chat baru',
          description:
            'Memproses pertanyaan teks atau rekaman audio (`audioBase64`) dengan pipeline RAG 15 halaman Panganita + normalisasi 8 dialek Nusantara + auto-failover model Gemini + penyimpanan ke Supabase.',
          security: [{ SupabaseSessionCookie: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    action: {
                      type: 'string',
                      enum: ['new'],
                      description:
                        "Kirim `action: 'new'` untuk membuat sesi percakapan baru.",
                    },
                    message: {
                      type: 'string',
                      maxLength: 8000,
                      description:
                        'Teks pertanyaan ibu (wajib jika `audioBase64` kosong).',
                    },
                    audioBase64: {
                      type: 'string',
                      description:
                        'Audio rekaman Voice Note dalam format Base64 (maks 14 MB).',
                    },
                    mimeType: {
                      type: 'string',
                      enum: [
                        'audio/webm',
                        'audio/mp4',
                        'audio/wav',
                        'audio/mpeg',
                        'audio/ogg',
                      ],
                      default: 'audio/webm',
                    },
                    conversationId: {
                      type: 'string',
                      nullable: true,
                      description:
                        'ID percakapan aktif (opsional; otomatis dibuat jika kosong).',
                    },
                    userName: { type: 'string', example: 'Nurhayati' },
                    location: {
                      type: 'string',
                      example: 'Manokwari, Papua Barat',
                    },
                  },
                },
                examples: {
                  textQuestion: {
                    summary: '1. Kirim Pertanyaan Teks (Dialek Sunda)',
                    value: {
                      message:
                        'Abdi hoyong terang kalori gizi pikeun murangkalih umur 2 tahun.',
                      conversationId: null,
                    },
                  },
                  voiceNote: {
                    summary: '2. Kirim Voice Note Audio (Base64)',
                    value: {
                      audioBase64: '<base64_audio_payload>',
                      mimeType: 'audio/webm',
                      conversationId: null,
                    },
                  },
                  newConversation: {
                    summary: '3. Buat Percakapan Baru',
                    value: {
                      action: 'new',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description:
                'Berhasil mendapatkan jawaban Bu Nita AI atau membuat percakapan baru',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          conversationId: { type: 'string' },
                          userMessageId: { type: 'string' },
                          assistantMessageId: { type: 'string' },
                          reply: { type: 'string' },
                          sender: { type: 'string', example: 'Bu Nita AI' },
                          time: { type: 'string', example: '12:23 WIT' },
                          location: {
                            type: 'string',
                            example: 'Manokwari, Papua Barat',
                          },
                          sources: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/SourceReference',
                            },
                          },
                          retrievedCount: { type: 'integer', example: 3 },
                          model: {
                            type: 'string',
                            example: 'gemini-3.5-flash',
                          },
                          transcript: { type: 'string' },
                          dialect: { $ref: '#/components/schemas/DialectInfo' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description:
                'Input pesan/audio kosong atau melebihi 8.000 karakter',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: { description: 'Belum login' },
            403: { description: 'Profil keluarga belum lengkap' },
            404: { description: 'Percakapan tidak ditemukan' },
            413: { description: 'Ukuran rekaman audio melebihi batas' },
            415: { description: 'Format MIME audio tidak didukung' },
            502: { description: 'Transkripsi suara gagal diproses' },
          },
        },
      },
      '/api/openapi.json': {
        get: {
          tags: ['Dokumentasi'],
          summary: 'Ambil spesifikasi OpenAPI 3.0.3 (JSON)',
          responses: {
            200: { description: 'Dokumen OpenAPI JSON' },
          },
        },
      },
      '/api/auth/whatsapp/request-otp': {
        post: {
          tags: ['Autentikasi WhatsApp OTP'],
          summary: 'Kirim kode OTP 6 digit ke nomor WhatsApp ibu',
          description:
            'Menghasilkan kode OTP 6 digit, mencatat hash di tabel `otp_codes`, dan mengirim pesan WhatsApp via Fonnte. Dilengkapi rate limiting per nomor (maksimal 5 request/jam, jeda minimal 60 detik).',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['phone'],
                  properties: {
                    phone: {
                      type: 'string',
                      example: '081234567890',
                      description: 'Nomor WhatsApp aktif penerima OTP',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Kode OTP berhasil dikirim ke WhatsApp',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean', example: true },
                      expiresIn: {
                        type: 'integer',
                        example: 300,
                        description: 'Masa berlaku OTP dalam detik',
                      },
                      resendAfter: {
                        type: 'integer',
                        example: 60,
                        description: 'Jeda pengiriman ulang dalam detik',
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Nomor WhatsApp tidak valid' },
            429: {
              description:
                'Rate limit terlampaui (terlalu sering meminta kode)',
            },
            502: { description: 'Gagal mengirim pesan via WhatsApp Gateway' },
          },
        },
      },
      '/api/auth/whatsapp/verify-otp': {
        post: {
          tags: ['Autentikasi WhatsApp OTP'],
          summary: 'Verifikasi kode OTP WhatsApp dan buat sesi login Supabase',
          description:
            'Mencocokkan kode OTP 6 digit terhadap `otp_codes` (maksimal 5x percobaan). Jika valid, mendaftarkan/memastikan akun user di Supabase Auth berbasis nomor HP dan mengembalikan link token/hash sesi masuk.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['phone', 'code'],
                  properties: {
                    phone: {
                      type: 'string',
                      example: '081234567890',
                      description: 'Nomor WhatsApp terdaftar',
                    },
                    code: {
                      type: 'string',
                      example: '123456',
                      description: 'Kode OTP 6 digit',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Verifikasi OTP berhasil, sesi login terbentuk',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean', example: true },
                      tokenHash: {
                        type: 'string',
                        example: 'pkce_token_hash_value',
                      },
                      redirectTo: {
                        type: 'string',
                        example: '/dashboard',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description:
                'Format tidak valid, kode OTP salah, atau sudah kedaluwarsa',
            },
            429: {
              description: 'Terlalu banyak percobaan salah (kode dikunci)',
            },
          },
        },
      },
      '/api/profil': {
        get: {
          tags: ['Profil & Asesmen'],
          summary: 'Ambil data profil & asesmen awal keluarga',
          description:
            'Saat ini data dibaca via `muatProfilSaya()` di server; endpoint REST untuk integrasi API Asesmen Awal.',
          security: [{ SupabaseSessionCookie: [] }],
          responses: {
            200: { description: 'Data profil keluarga ditemukan' },
            404: { description: 'Profil keluarga belum diisi' },
          },
        },
        put: {
          tags: ['Profil & Asesmen'],
          summary: 'Simpan profil & asesmen awal keluarga 1.000 HPK',
          description:
            'Endpoint REST sesuai skema `actions/profil.ts`: nama ibu, domisili (`provinsi`, `kabupaten_kota`), status hamil/menyusui, dan jumlah anak per kelompok usia.',
          security: [{ SupabaseSessionCookie: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nama_ibu'],
                  properties: {
                    nama_ibu: { type: 'string', example: 'Nurhayati' },
                    provinsi: { type: 'string', example: 'Papua Barat' },
                    kabupaten_kota: { type: 'string', example: 'Manokwari' },
                    ibu_hamil: { type: 'boolean', example: false },
                    trimester_hamil: {
                      type: 'integer',
                      nullable: true,
                      enum: [1, 2, 3],
                    },
                    ibu_menyusui: { type: 'boolean', example: true },
                    periode_menyusui: {
                      type: 'integer',
                      nullable: true,
                      enum: [1, 2],
                    },
                    jumlah_bayi_6_11: { type: 'integer', example: 1 },
                    jumlah_anak_1_3: { type: 'integer', example: 1 },
                    jumlah_anak_4_6: { type: 'integer', example: 0 },
                    jumlah_anak_7_9: { type: 'integer', example: 0 },
                    jumlah_anak_l_10_12: { type: 'integer', example: 0 },
                    jumlah_anak_p_10_12: { type: 'integer', example: 0 },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Profil dan asesmen awal tersimpan' },
            400: { description: 'Validasi Zod gagal' },
          },
        },
      },
      '/api/pindai': {
        post: {
          tags: ['AI CV & Keputusan Panen'],
          summary:
            'Deteksi bahan pangan hasil panen (AI Computer Vision)',
          description:
            'Endpoint AI CV untuk mendeteksi kelas pangan lokal dari foto panen pekarangan dan mencocokkannya dengan tabel `bahan_pangan`.',
          security: [{ SupabaseSessionCookie: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: {
                    image: {
                      type: 'string',
                      format: 'binary',
                      description:
                        'Foto hasil panen (JPEG/PNG/WEBP, maks 10 MB)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Komoditas pangan berhasil dideteksi',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          detectedClass: {
                            type: 'string',
                            example: 'ikan_lele',
                          },
                          confidence: { type: 'number', example: 0.94 },
                          bahanId: { type: 'integer', example: 1 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/keputusan': {
        post: {
          tags: ['AI CV & Keputusan Panen'],
          summary:
            'Hitung alokasi panen (gizi vs dijual) & simpan foto Storage',
          description:
            'Endpoint REST sesuai `actions/keputusan.ts`: menghitung AKG keluarga, cadangan konsumsi vs berat jual, serta menyimpan foto ke bucket Supabase Storage `hasil-panen`.',
          security: [{ SupabaseSessionCookie: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['bahanId', 'beratPanenKg'],
                  properties: {
                    bahanId: { type: 'integer', example: 1 },
                    beratPanenKg: { type: 'number', example: 5 },
                    fotoPath: {
                      type: 'string',
                      nullable: true,
                      example: 'user-id/panen-1731380000.jpg',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description:
                'Kalkulasi keputusan panen berhasil dihitung & disimpan',
            },
            400: { description: 'Input berat panen atau bahan tidak valid' },
          },
        },
      },
      '/api/riwayat': {
        get: {
          tags: ['AI CV & Keputusan Panen'],
          summary: 'Ambil riwayat pindai & keputusan panen keluarga',
          security: [{ SupabaseSessionCookie: [] }],
          responses: {
            200: {
              description: 'Daftar riwayat keputusan panen berhasil diambil',
            },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
