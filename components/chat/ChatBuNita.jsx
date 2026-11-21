'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import {
  formatRegionTime,
  extractLocationFromText,
} from '@/lib/regionTimezone';

import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Send,
  Settings2,
  Volume2,
  Plus,
  X,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';

const PESAN_AWAL =
  "Assalamu'alaikum, Ibu! Saya Bu Nita, asisten gizi Panganita. Saya siap membantu Ibu memahami gizi keluarga, bahan pangan, dan pencegahan stunting. Yuk, kita belajar bersama. Ada yang ingin Ibu tanyakan?";

function formatTime(date = new Date(), location = '') {
  return formatRegionTime(date, location);
}

function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// Gaya kartu sama dengan halaman Beranda dan Profil.
const KARTU =
  'rounded-2xl border border-[#D5E2D2] bg-white shadow-[0_5px_25px_rgba(30,77,48,0.07)]';

// -----------------------------------------------
// BANTUAN SUARA BU NITA
// -----------------------------------------------

// Teks dibacakan per potongan kalimat. Potongan pendek lebih stabil di
// Chrome Android, dan membuat Jeda/Lanjutkan serta ganti kecepatan
// bisa jalan tanpa bergantung pada pause() bawaan browser.
const BATAS_POTONGAN = 160;

// Android memberi kode bahasa "id_ID" (garis bawah), bukan "id-ID".
function samakanLang(lang = '') {
  return String(lang).replace('_', '-');
}

// Hanya memilih suara Bahasa Indonesia. Bila tidak ada, mengembalikan null
// agar browser memilih sendiri lewat lang "id-ID". Jangan jatuh ke suara
// bahasa lain, karena suara asing yang membaca teks Indonesia terdengar aneh.
function pilihSuaraIndonesia(daftar) {
  const indonesia = (daftar || []).filter(v =>
    samakanLang(v.lang).toLowerCase().startsWith('id'),
  );

  if (indonesia.length === 0) return null;

  const suaraPerempuan = v =>
    /gadis|damayanti|female|wanita|perempuan|natural|neural|online/i.test(
      v.name,
    );

  const diAndroid =
    typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  // Di Android, suara lokal (terpasang di HP) lebih andal daripada suara online.
  if (diAndroid) {
    return (
      indonesia.find(v => v.localService && suaraPerempuan(v)) ||
      indonesia.find(v => v.localService) ||
      indonesia[0]
    );
  }

  return (
    indonesia.find(suaraPerempuan) ||
    indonesia.find(v => /google|indonesia|id-id/i.test(v.name)) ||
    indonesia[0]
  );
}

// iPhone dan iPad (termasuk Chrome di iOS, karena semuanya memakai mesin Safari).
function adalahIOS() {
  if (typeof navigator === 'undefined') return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// Teks yang dibacakan dibersihkan dari simbol agar tidak terbaca aneh.
// Teks yang tampil di layar tidak diubah, emoji tetap ada.
// Baris Rujukan (📚) tidak dibacakan karena sudah tampil di layar.
// Penafian Medis (⚠️) sengaja tetap dibacakan karena kalimat "bukan pengganti dokter" penting untuk didengar.
function siapkanTeksSuara(text) {
  return String(text)
    .replace(/“|”/g, '')
    .replace(/[*#_~`]/g, '')
    .replace(/[\u{1F600}-\u{1FAFF}\u2600-\u27BF]/gu, '')
    .replace(/📚.*$/gm, '')
    .replace(/\bPANGANITA\b/gi, 'Panganita')
    .replace(/\bMPASI\b/gi, 'empasi')
    .replace(/\b1\.000\s*HPK\b/gi, 'seribu hari pertama kehidupan')
    .replace(/\bHPK\b/gi, 'hari pertama kehidupan')
    .replace(/\s+/g, ' ')
    .trim();
}

function potongKalimat(teks) {
  const kalimat = teks
    .split(/(?<=[.!?;:])\s+/)
    .map(k => k.trim())
    .filter(Boolean);

  const hasil = [];
  let gabungan = '';

  for (const k of kalimat) {
    if (k.length > BATAS_POTONGAN) {
      if (gabungan) {
        hasil.push(gabungan);
        gabungan = '';
      }

      let sisa = k;

      while (sisa.length > BATAS_POTONGAN) {
        let titik = sisa.lastIndexOf(' ', BATAS_POTONGAN);
        if (titik <= 0) titik = BATAS_POTONGAN;
        hasil.push(sisa.slice(0, titik).trim());
        sisa = sisa.slice(titik).trim();
      }

      gabungan = sisa;
      continue;
    }

    if (gabungan && gabungan.length + 1 + k.length > BATAS_POTONGAN) {
      hasil.push(gabungan);
      gabungan = k;
    } else {
      gabungan = gabungan ? `${gabungan} ${k}` : k;
    }
  }

  if (gabungan) hasil.push(gabungan);

  return hasil;
}


function NitaAvatar({ small = false }) {
  const [imageError, setImageError] = useState(false);

  if (!imageError) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border border-[#D5E2D2] bg-[#EAF1E8] shadow-sm ${
          small ? 'h-9 w-9' : 'h-14 w-14'
        }`}
      >
        <Image
          src="/images/avatar-bu-nita.png"
          alt="Avatar Bu Nita"
          fill
          sizes={small ? '36px' : '56px'}
          className="object-cover object-top"
          onError={() => setImageError(true)}
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#EAF1E8] font-bold text-[#1B4D2B] ${
        small ? 'h-9 w-9 text-xs' : 'h-14 w-14 text-lg'
      }`}
    >
      BN
    </div>
  );
}

export default function ChatBuNita({ namaIbu = '', lokasi = '' }) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [profilLokasi, setProfilLokasi] = useState(lokasi);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [listening, setListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingUserId, setPlayingUserId] = useState(null);

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [paused, setPaused] = useState(false);

  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const [rate, setRate] = useState(1.0);
  const rateRef = useRef(1.0);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recordingSecondsRef = useRef(0);
  const liveTranscriptRef = useRef('');
  const userAudioRef = useRef(null);
  const createdAudioUrlsRef = useRef([]);
  const mountedRef = useRef(false);
  const speakingIdRef = useRef(null);
  const speechRunRef = useRef(0); // penanda sesi bicara; kejadian dari sesi lama diabaikan
  const speechQueueRef = useRef([]); // potongan kalimat yang akan dibacakan
  const speechIndexRef = useRef(0); // potongan yang sedang atau akan dibacakan
  const pausedRef = useRef(false);
  const suaraMulaiRef = useRef(false);
  const suaraTerbukaRef = useRef(false);

  useEffect(() => {
    setProfilLokasi(lokasi);
  }, [lokasi]);

  // Timer loading untuk deteksi jaringan lambat / sinyal 3G
  useEffect(() => {
    let timer;
    if (loading) {
      setLoadingSeconds(0);
      timer = setInterval(() => {
        setLoadingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loading]);

  // -----------------------------------------------
  // PESAN PEMBUKA
  // -----------------------------------------------

  const pesanPembuka = (lok = profilLokasi) => ({
    id: 'welcome',
    role: 'assistant',
    content: PESAN_AWAL,
    sources: [],
    time: formatTime(new Date(), lok),
  });

  // -----------------------------------------------
  // MEMUAT RIWAYAT DARI SUPABASE
  // -----------------------------------------------

  useEffect(() => {
    mountedRef.current = true;

    async function muatRiwayat() {
      try {
        const response = await fetch('/api/chat', {
          method: 'GET',
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Riwayat percakapan gagal dimuat.');
        }

        if (!mountedRef.current) return;

        const data = result.data;
        const freshLoc =
          typeof data.location === 'string' ? data.location : lokasi;

        setProfilLokasi(freshLoc);
        setConversationId(data.conversationId || null);

        if (data.messages?.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([pesanPembuka(freshLoc)]);
        }
      } catch (err) {
        console.error('Gagal memuat chat:', err);

        if (mountedRef.current) {
          setMessages([pesanPembuka()]);
          setError(err.message);
        }
      } finally {
        if (mountedRef.current) {
          setHistoryLoading(false);
        }
      }
    }

    muatRiwayat();

    return () => {
      mountedRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      if (userAudioRef.current) {
        userAudioRef.current.pause();
        userAudioRef.current = null;
      }
      createdAudioUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      createdAudioUrlsRef.current = [];
      speechRunRef.current += 1;
      window.speechSynthesis?.cancel();
    };
  }, []);

  // -----------------------------------------------
  // MEMUAT PREFERENSI SUARA
  // -----------------------------------------------

  useEffect(() => {
    try {
      const savedRate = localStorage.getItem('nita_voice_rate');

      if (savedRate) {
        const value = Number(savedRate);

        if (value >= 0.5 && value <= 2.0) {
          setRate(value);
          rateRef.current = value;
        }
      }
    } catch {
      console.warn('Preferensi suara tidak dapat dimuat.');
    }
  }, []);


  // -----------------------------------------------
  // MEMUAT DAFTAR SUARA
  // -----------------------------------------------
  // Chrome Android memuat daftar suara secara bertahap. Suara dipilih saat
  // akan berbicara (lihat bacaPotongan), jadi di sini cukup memancing
  // pemuatannya.

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const muat = () => synth.getVoices();

    muat();
    synth.addEventListener('voiceschanged', muat);

    return () => {
      synth.removeEventListener('voiceschanged', muat);
    };
  }, []);

  // -----------------------------------------------
  // SCROLL OTOMATIS
  // -----------------------------------------------

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, loading]);

  // -----------------------------------------------
  // MENGHENTIKAN SUARA
  // -----------------------------------------------

  const stopSpeech = useCallback(() => {
    speechRunRef.current += 1;
    speechQueueRef.current = [];
    speechIndexRef.current = 0;
    pausedRef.current = false;
    speakingIdRef.current = null;

    window.speechSynthesis?.cancel();

    setSpeakingId(null);
    setPaused(false);
  }, []);

  const stopUserAudio = useCallback(() => {
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current = null;
    }
    setPlayingUserId(null);
  }, []);

  function toggleUserAudio(message) {
    const audioUrl = message?.voiceNote?.audioUrl;
    if (!audioUrl) return;

    if (playingUserId === message.id) {
      stopUserAudio();
      return;
    }

    stopSpeech();
    stopUserAudio();

    const audio = new Audio(audioUrl);
    userAudioRef.current = audio;
    setPlayingUserId(message.id);

    audio.onended = () => {
      if (!mountedRef.current) return;
      userAudioRef.current = null;
      setPlayingUserId(null);
    };
    audio.onerror = () => {
      if (!mountedRef.current) return;
      userAudioRef.current = null;
      setPlayingUserId(null);
    };
    audio.play().catch(() => {
      if (!mountedRef.current) return;
      userAudioRef.current = null;
      setPlayingUserId(null);
    });
  }

  // -----------------------------------------------
  // MEMBACAKAN JAWABAN BU NITA
  // -----------------------------------------------

  // Memulai ulang pembacaan dari potongan yang sedang aktif.
  // Setiap pemanggilan membuat "sesi" baru; kejadian dari sesi lama diabaikan.
  function jadwalkanBaca(id, jeda = 150) {
    const synth = window.speechSynthesis;
    if (!synth) return 0;

    speechRunRef.current += 1;
    const runId = speechRunRef.current;

    synth.cancel();

    // Jeda singkat agar pembatalan sebelumnya tuntas (penting di Chrome Android).
    setTimeout(() => bacaPotongan(runId, id), jeda);

    return runId;
  }

  // Membacakan satu potongan, lalu lanjut ke potongan berikutnya.
  function bacaPotongan(runId, id) {
    const synth = window.speechSynthesis;

    if (!synth || runId !== speechRunRef.current) return;

    const potongan = speechQueueRef.current[speechIndexRef.current];

    // Semua potongan sudah selesai dibacakan.
    if (!potongan) {
      speakingIdRef.current = null;
      speechQueueRef.current = [];
      speechIndexRef.current = 0;
      pausedRef.current = false;

      if (mountedRef.current) {
        setSpeakingId(null);
        setPaused(false);
      }
      return;
    }

    const suara = pilihSuaraIndonesia(synth.getVoices());
    const utterance = new SpeechSynthesisUtterance(potongan);

    utterance.lang = suara ? samakanLang(suara.lang) : 'id-ID';
    if (suara) utterance.voice = suara;

    const kecepatan = Number(rateRef.current);
    utterance.rate = Math.max(
      0.5,
      Math.min(2.0, Number.isFinite(kecepatan) ? kecepatan : 1.0),
    );
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      if (runId === speechRunRef.current) suaraMulaiRef.current = true;
    };

    utterance.onend = () => {
      if (!mountedRef.current || runId !== speechRunRef.current) return;

      speechIndexRef.current += 1;
      bacaPotongan(runId, id);
    };

    utterance.onerror = event => {
      if (!mountedRef.current || runId !== speechRunRef.current) return;

      // cancel() memicu error 'interrupted' atau 'canceled'; itu bukan kegagalan.
      if (event.error === 'interrupted' || event.error === 'canceled') return;

      stopSpeech();
      setError(
        'Suara Bu Nita belum bisa diputar. Coba naikkan volume media atau muat ulang halaman.',
      );
    };

    synth.speak(utterance);
  }

  // iOS hanya mengizinkan suara jika speak() pertama dipanggil langsung saat
  // layar disentuh (tanpa menunggu timer). Utterance kosong bervolume 0 ini
  // "membuka kunci" suara; pembacaan sebenarnya menyusul beberapa saat kemudian.
  function bukaKunciSuara() {
    const synth = window.speechSynthesis;

    if (!synth || suaraTerbukaRef.current || !adalahIOS()) return;

    const pembuka = new SpeechSynthesisUtterance(' ');
    pembuka.volume = 0;
    synth.speak(pembuka);

    suaraTerbukaRef.current = true;
  }

  function mulaiBicara(text, id) {
    if (!window.speechSynthesis) {
      setError('Browser Ibu belum mendukung suara Bu Nita.');
      return;
    }

    bukaKunciSuara();

    const potongan = potongKalimat(siapkanTeksSuara(text));
    if (potongan.length === 0) return;

    speechQueueRef.current = potongan;
    speechIndexRef.current = 0;
    speakingIdRef.current = id;
    pausedRef.current = false;
    suaraMulaiRef.current = false;

    setSpeakingId(id);
    setPaused(false);

    const runId = jadwalkanBaca(id);

    // Penjaga: bila 6 detik tidak ada suara sama sekali, hentikan dan beri tahu Ibu.
    setTimeout(() => {
      if (
        !mountedRef.current ||
        runId !== speechRunRef.current ||
        suaraMulaiRef.current ||
        pausedRef.current
      ) {
        return;
      }

      stopSpeech();
      setError(
        'Suara belum bisa diputar di HP ini. Pastikan volume media menyala dan suara Bahasa Indonesia sudah terpasang di pengaturan HP.',
      );
    }, 6000);
  }

  // -----------------------------------------------
  // PUTAR ULANG SUARA
  // -----------------------------------------------

  function toggleAudio(message) {
    if (speakingIdRef.current === message.id) {
      stopSpeech();
      return;
    }

    stopUserAudio();
    mulaiBicara(message.content, message.id);
  }

  // -----------------------------------------------
  // JEDA / LANJUTKAN SUARA
  // -----------------------------------------------
  // pause() dan resume() bawaan browser tidak andal di Chrome Android.
  // Jeda = hentikan sesi sekarang dan ingat potongan terakhir.
  // Lanjutkan = baca ulang dari potongan itu.

  function togglePause() {
    if (!window.speechSynthesis || !speakingIdRef.current) return;

    if (pausedRef.current) {
      pausedRef.current = false;
      setPaused(false);
      jadwalkanBaca(speakingIdRef.current, 100);
      return;
    }

    pausedRef.current = true;
    setPaused(true);

    // Naikkan penanda sesi agar kejadian dari suara yang dibatalkan diabaikan.
    speechRunRef.current += 1;
    window.speechSynthesis.cancel();
  }

  // -----------------------------------------------
  // PENGATURAN SUARA
  // -----------------------------------------------

  function changeRate(value) {
    const next = Number(value);

    setRate(next);
    rateRef.current = next;

    try {
      localStorage.setItem('nita_voice_rate', String(next));
    } catch {
      // Penyimpanan peramban tidak tersedia; pengaturan hanya berlaku sementara.
    }

    // Sedang berbicara: lanjutkan dari potongan yang sama dengan kecepatan baru.
    // Sedang dijeda: kecepatan baru dipakai saat Ibu menekan Lanjutkan.
    if (speakingIdRef.current && !pausedRef.current) {
      jadwalkanBaca(speakingIdRef.current);
    }
  }

  function playSample() {
    mulaiBicara(
      'Halo Ibu, apa kabar hari ini? Saya Bu Nita. Yuk, kita belajar bersama tentang gizi keluarga.',
      'sample',
    );
  }

  // -----------------------------------------------
  // MENGIRIM PESAN TEKS ATAU AUDIO KE API & SUPABASE
  // -----------------------------------------------

  async function submitChatPayload({
    text = '',
    audioBase64 = '',
    mimeType = '',
    voiceNote = null,
    optimisticText = '',
  }) {
    if ((!text && !audioBase64) || loading || historyLoading) return;

    stopSpeech();
    stopUserAudio();
    setLoading(true);
    setError('');

    const localUserId = `user-${Date.now()}`;
    const initialDisplayText =
      text ||
      optimisticText ||
      (voiceNote?.duration
        ? `🎙️ Pesan Suara Ibu (${voiceNote.duration})`
        : '🎙️ Mengirim pesan suara...');
    const detectedLoc = extractLocationFromText(initialDisplayText);

    const userMessage = {
      id: localUserId,
      role: 'user',
      content: initialDisplayText,
      voiceNote,
      sources: [],
      time: formatTime(new Date(), detectedLoc || profilLokasi),
    };

    setMessages(previous => [...previous, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(text ? { message: text } : {}),
          ...(audioBase64 ? { audioBase64, mimeType } : {}),
          conversationId,
          userName: namaIbu,
          location: profilLokasi,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Pesan gagal dikirim.');
      }

      const data = result.data;

      setConversationId(data.conversationId);
      if (typeof data.location === 'string' && data.location) {
        setProfilLokasi(data.location);
      }

      const activeLoc = data.location || profilLokasi;
      const finalUserText =
        data.transcript || text || optimisticText || 'Pesan suara';
      const finalUserLoc = extractLocationFromText(finalUserText);

      const assistantMessage = {
        id: String(data.assistantMessageId || `assistant-${Date.now()}`),
        role: 'assistant',
        content: data.reply,
        sources: data.sources || [],
        dialect: data.dialect || null,
        time: data.time || formatTime(new Date(), activeLoc),
      };

      setMessages(previous =>
        previous
          .map(message =>
            message.id === localUserId
              ? {
                  ...message,
                  id: String(data.userMessageId || message.id),
                  content: finalUserText,
                  voiceNote,
                  time:
                    data.time ||
                    formatTime(new Date(), finalUserLoc || activeLoc),
                }
              : message,
          )
          .concat(assistantMessage),
      );

      // Jangan autoplay suara ketika Bu Nita menjawab (pengguna memutar lewat tombol Dengarkan)
    } catch (err) {
      console.warn('Pengiriman chat gagal:', err?.message || err);

      setMessages(previous =>
        previous.filter(message => message.id !== localUserId),
      );

      setError(err.message || 'Tidak dapat menghubungi Bu Nita.');
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------
  // INPUT SUARA (LIVE AUTO-TEXT + REKAMAN VN)
  // -----------------------------------------------

  function clearRecordingResources() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
  }

  function cancelRecording() {
    clearRecordingResources();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    liveTranscriptRef.current = '';
    recordingSecondsRef.current = 0;
    setRecordingSeconds(0);
    setListening(false);
    setInput('');
  }

  function stopMediaRecording() {
    clearRecordingResources();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    } else {
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
      setListening(false);
      setRecordingSeconds(0);
    }
  }

  async function toggleMicrophone() {
    if (listening) {
      if (mediaRecorderRef.current) {
        stopMediaRecording();
      } else {
        clearRecordingResources();
        setListening(false);
        setRecordingSeconds(0);
      }
      return;
    }

    stopSpeech();
    stopUserAudio();
    setError('');

    // Prioritaskan MediaRecorder (disertai live SpeechRecognition paralel)
    // agar teks muncul otomatis saat bicara, VN bisa diputar ulang, dan tetap jalan di semua browser.
    if (
      typeof window !== 'undefined' &&
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;

        const preferredTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/mp4',
          'audio/ogg;codecs=opus',
          'audio/ogg',
        ];
        const supportedType =
          preferredTypes.find(type => MediaRecorder.isTypeSupported(type)) ||
          '';

        const recorder = supportedType
          ? new MediaRecorder(stream, { mimeType: supportedType })
          : new MediaRecorder(stream);

        audioChunksRef.current = [];
        liveTranscriptRef.current = '';
        recordingSecondsRef.current = 0;
        setRecordingSeconds(0);

        recorder.ondataavailable = event => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        // Jalankan SpeechRecognition secara paralel agar teks langsung muncul saat berbicara
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
          try {
            const recognition = new SpeechRecognition();
            recognition.lang = 'id-ID';
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = event => {
              const transcript = Array.from(event.results)
                .map(result => result[0]?.transcript || '')
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

              liveTranscriptRef.current = transcript;
              setInput(transcript);
            };

            recognition.onerror = () => {
              // Abaikan bila SpeechRecognition diblokir (mis. Incognito/Firefox); rekaman MediaRecorder tetap berjalan
            };

            recognitionRef.current = recognition;
            recognition.start();
          } catch {
            // SpeechRecognition opsional; rekaman audio tetap berjalan
          }
        }

        recorder.onstop = () => {
          const recordedMime =
            recorder.mimeType || supportedType || 'audio/webm';
          const chunks = [...audioChunksRef.current];
          const spokenPreview = liveTranscriptRef.current.trim();
          const finalDuration = formatDuration(
            Math.max(1, recordingSecondsRef.current),
          );

          audioChunksRef.current = [];
          liveTranscriptRef.current = '';
          recordingSecondsRef.current = 0;
          mediaStreamRef.current?.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;
          setRecordingSeconds(0);
          setListening(false);
          setInput('');

          const blob = new Blob(chunks, { type: recordedMime });

          if (blob.size < 400) {
            setError('Rekaman suara terlalu singkat. Silakan coba lagi.');
            return;
          }

          const audioUrl = URL.createObjectURL(blob);
          createdAudioUrlsRef.current.push(audioUrl);

          const reader = new FileReader();
          reader.onloadend = () => {
            const cleanBase64 = String(reader.result || '').replace(
              /^data:.*?;base64,/i,
              '',
            );
            const cleanMime = recordedMime.split(';')[0].trim() || 'audio/webm';
            if (cleanBase64) {
              submitChatPayload({
                audioBase64: cleanBase64,
                mimeType: cleanMime,
                optimisticText: spokenPreview,
                voiceNote: {
                  audioUrl,
                  duration: finalDuration,
                },
              });
            }
          };
          reader.onerror = () => {
            setError('Rekaman suara gagal dibaca. Silakan coba lagi.');
          };
          reader.readAsDataURL(blob);
        };

        mediaRecorderRef.current = recorder;
        recorder.start(250);
        setListening(true);
        timerIntervalRef.current = setInterval(() => {
          recordingSecondsRef.current += 1;
          setRecordingSeconds(recordingSecondsRef.current);
        }, 1000);
        return;
      } catch (err) {
        clearRecordingResources();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setListening(false);
        setRecordingSeconds(0);

        if (
          err?.name === 'NotAllowedError' ||
          err?.name === 'PermissionDeniedError'
        ) {
          setError('Izin penggunaan mikrofon belum diberikan.');
          return;
        }
        // Lanjut ke fallback SpeechRecognition bila mikrofon gagal diakses lewat MediaRecorder
      }
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        'Browser belum mendukung perekaman suara. Silakan gunakan browser modern atau ketik pesan.',
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = event => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript || '')
        .join(' ')
        .trim();

      setInput(transcript);
    };

    recognition.onerror = event => {
      setListening(false);

      if (event.error === 'not-allowed') {
        setError('Izin penggunaan mikrofon belum diberikan.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError('Mikrofon mengalami gangguan.');
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
      setError('Mikrofon tidak dapat diaktifkan.');
    }
  }

  // -----------------------------------------------
  // MENGIRIM PESAN TEKS ATAU MENGAKHIRI VN
  // -----------------------------------------------

  async function sendMessage(event) {
    event?.preventDefault();

    if (loading || historyLoading) return;

    // Jika sedang merekam VN dan tombol Kirim/Enter ditekan, akhiri rekaman dan langsung kirim VN
    if (listening && mediaRecorderRef.current) {
      stopMediaRecording();
      return;
    }

    const text = input.trim();

    if (!text) return;

    clearRecordingResources();
    setListening(false);
    setRecordingSeconds(0);
    setInput('');

    await submitChatPayload({ text });
  }

  // -----------------------------------------------
  // MEMBUAT PERCAKAPAN BARU
  // -----------------------------------------------

  async function newConversation() {
    if (loading) return;

    stopSpeech();
    stopUserAudio();
    cancelRecording();

    setListening(false);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'new',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Percakapan baru gagal dibuat.');
      }

      setConversationId(result.data.conversationId);

      setMessages([pesanPembuka()]);
      setInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------
  // TAMPILAN
  // -----------------------------------------------

  return (
    <main className="min-h-[calc(100dvh-70px)] bg-[#F4FCF7] text-[#173D30]">
      <div className="mx-auto max-w-4xl px-2.5 pb-48 pt-3 sm:px-6 sm:pb-36 sm:pt-5">
        {/* PROFIL BU NITA */}

        <section className="mb-4 flex items-center gap-3 rounded-2xl border border-[#D8ECE0] bg-white px-3.5 py-3 shadow-sm sm:mb-6 sm:px-6 sm:py-4">
          <NitaAvatar />

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold leading-tight text-[#0F2D1A]">
              Bu Nita AI
            </h1>

            <p className="text-sm text-[#53665a]">Teman Gizi Keluarga</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={newConversation}
              disabled={loading || historyLoading}
              title="Percakapan baru"
              aria-label="Mulai percakapan baru"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF1E8] text-[#1B4D2B] transition-all hover:bg-[#D5E2D2] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] disabled:opacity-40"
            >
              <Plus aria-hidden="true" size={22} />
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="Pengaturan suara"
              aria-label="Pengaturan suara"
              aria-expanded={showSettings}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF1E8] text-[#1B4D2B] transition-all hover:bg-[#D5E2D2] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F]"
            >
              <Settings2 aria-hidden="true" size={22} />
            </button>
          </div>
        </section>

        {/* PENGATURAN SUARA */}

        {showSettings && (
          <section className={`${KARTU} mb-5 p-5`}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#0F2D1A]">
                  Pengaturan Suara
                </h2>
                <p className="mt-1 text-sm text-[#53665a]">
                  Atur seberapa cepat Bu Nita berbicara.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Tutup pengaturan suara"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[#53665a] transition-colors hover:bg-[#EAF1E8] hover:text-[#0F2D1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F]"
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>

            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-semibold text-[#0F2D1A]">
                  Kecepatan bicara
                </span>

                <span className="rounded-lg bg-[#EAF1E8] px-3 py-1 text-sm font-bold text-[#1B4D2B]">
                  {rate}x
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[0.5, 1.0, 1.25, 1.5, 2.0].map(preset => {
                  const isSelected = rate === preset;

                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => changeRate(preset)}
                      aria-pressed={isSelected}
                      className={`min-h-12 rounded-xl text-base font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] ${
                        isSelected
                          ? 'bg-[#1B4D2B] text-white shadow-md shadow-[#1B4D2B]/20'
                          : 'border-2 border-[#D5E2D2] bg-white text-[#1B4D2B] hover:border-[#1B4D2B]'
                      }`}
                    >
                      {preset}x
                    </button>
                  );
                })}
              </div>
            </div>

            <PrimaryButton ikon={Play} lebarPenuh onClick={playSample}>
              Coba dengarkan suara
            </PrimaryButton>
          </section>
        )}

        {/* RIWAYAT PESAN */}

        <section className="flex flex-col gap-5">
          {historyLoading && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center justify-center gap-2 py-12 text-base font-semibold text-[#1B4D2B]"
            >
              <LoaderCircle
                aria-hidden="true"
                size={22}
                strokeWidth={2.5}
                className="animate-spin text-[#3E8E1F]"
              />
              Memuat percakapan…
            </div>
          )}

          {!historyLoading &&
            messages.map(message => {
              const isUser = message.role === 'user';
              const active = speakingId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex w-full items-end gap-2.5 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && <NitaAvatar small />}

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] ${
                      isUser ? 'order-1' : ''
                    }`}
                  >
                    <p
                      className={`mb-1.5 px-1 text-sm font-semibold ${
                        isUser ? 'text-right text-[#1B4D2B]' : 'text-[#53665a]'
                      }`}
                    >
                      {isUser ? 'Ibu' : 'Bu Nita'}
                    </p>

                    <div
                      className={`rounded-[20px] px-4 py-3.5 shadow-sm sm:px-5 sm:py-4 ${
                        isUser
                          ? 'rounded-br-[5px] bg-[#1B4D2B] text-white'
                          : 'rounded-bl-[5px] border border-[#D5E2D2] bg-white text-[#0F2D1A]'
                      }`}
                    >
                      {isUser && message.voiceNote?.audioUrl && (
                        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/15 px-3 py-2 text-white">
                          <button
                            type="button"
                            onClick={() => toggleUserAudio(message)}
                            aria-label={
                              playingUserId === message.id
                                ? 'Jeda rekaman suara'
                                : 'Putar rekaman suara'
                            }
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1B4D2B] shadow-sm transition-all hover:bg-[#EAF1E8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD23F]"
                          >
                            {playingUserId === message.id ? (
                              <Pause
                                aria-hidden="true"
                                size={20}
                                fill="currentColor"
                              />
                            ) : (
                              <Play
                                aria-hidden="true"
                                size={20}
                                fill="currentColor"
                                className="ml-0.5"
                              />
                            )}
                          </button>

                          <div
                            aria-hidden="true"
                            className="flex flex-1 items-center gap-[3px]"
                          >
                            {[10, 16, 8, 20, 13, 18, 9, 15, 20, 11, 16, 9].map(
                              (h, idx) => (
                                <span
                                  key={idx}
                                  className={`w-[3px] rounded-full bg-white/85 ${
                                    playingUserId === message.id
                                      ? 'animate-pulse'
                                      : 'opacity-80'
                                  }`}
                                  style={{ height: `${h}px` }}
                                />
                              ),
                            )}
                          </div>

                          <span className="shrink-0 text-sm font-semibold text-white">
                            {message.voiceNote.duration}
                          </span>
                        </div>
                      )}

                      <p className="select-text cursor-text whitespace-pre-wrap break-words text-base leading-7">
                        {message.content}
                      </p>

                      <p
                        className={`mt-2 text-right text-xs ${
                          isUser ? 'text-white/80' : 'text-[#53665a]'
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>

                    {!isUser && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <SecondaryButton
                          ukuran="default"
                          ikon={active ? Square : Play}
                          onClick={() => toggleAudio(message)}
                        >
                          {active ? 'Hentikan' : 'Dengarkan'}
                        </SecondaryButton>

                        {active && (
                          <SecondaryButton
                            ukuran="default"
                            ikon={paused ? Play : Pause}
                            onClick={togglePause}
                          >
                            {paused ? 'Lanjutkan' : 'Jeda'}
                          </SecondaryButton>
                        )}

                        <span className="inline-flex items-center gap-1 text-sm text-[#53665a]">
                          <Volume2 aria-hidden="true" size={16} />
                          Suara Bu Nita
                        </span>

                        {message.sources?.length > 0 && (
                          <details className="w-full text-sm text-[#1B4D2B]">
                            <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
                              Sumber informasi
                            </summary>

                            <div className="mt-1 space-y-2 rounded-xl border border-[#D5E2D2] bg-white px-4 py-3 shadow-sm">
                              {message.sources.map((source, index) => (
                                <div key={index} className="leading-relaxed">
                                  <p className="font-medium text-[#0F2D1A]">
                                    •{' '}
                                    {typeof source === 'string'
                                      ? source
                                      : source.title ||
                                        source.name ||
                                        `Referensi ${index + 1}`}
                                  </p>
                                  {typeof source === 'object' &&
                                    source?.source && (
                                      <p className="pl-3 text-sm text-[#53665a]">
                                        {source.source}
                                      </p>
                                    )}
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* INDIKATOR LOADING */}

          {loading && (
            <div className="flex items-start gap-2.5 sm:gap-3">
              <NitaAvatar small />

              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[#D5EFE0] bg-white px-4 py-3 text-xs text-[#285741] shadow-sm">
                <div className="flex items-center gap-2 font-medium">
                  <LoaderCircle size={16} className="animate-spin text-[#1B4D2B]" />
                  <span>Bu Nita sedang menyiapkan jawaban...</span>
                </div>

                {loadingSeconds >= 4 && (
                  <div className="mt-2.5 border-t border-[#E3F2E9] pt-2 text-[11px] leading-relaxed text-[#4F7361] animate-in fade-in duration-300">
                    <p className="flex items-center gap-1.5 font-semibold text-[#B45309]">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Sedang memproses...
                    </p>
                    <p className="mt-0.5 text-[#5A6D63]">
                      Mohon tunggu sebentar ya, Ibu. Pastikan sinyal dan koneksi internet Ibu tetap terhubung dengan baik.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESAN ERROR */}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border-2 border-[#E6B91E] bg-[#FFF8DB] p-4 text-[#3b2f00]"
            >
              <AlertCircle
                aria-hidden="true"
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p className="flex-1 text-base">{error}</p>

              <button
                type="button"
                onClick={() => setError('')}
                aria-label="Tutup pesan"
                className="-m-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#E6B91E]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4D2B]"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>
          )}

          {/* Penanda akhir percakapan. scroll-mb memberi ruang agar pesan
              terakhir tidak tertutup kolom ketik yang menempel di bawah. */}
          <div ref={bottomRef} className="scroll-mb-52 lg:scroll-mb-32" />
        </section>
      </div>

      {/* KOLOM INPUT CHAT
          Mobile: menempel sampai dasar layar (di belakang navigasi bawah),
          sehingga tidak ada celah tempat tulisan lain terlihat saat digulir.
          Padding bawah menyisakan ruang untuk navigasi bawah. */}

      <footer className="pointer-events-auto fixed inset-x-0 bottom-[64px] z-40 border-t border-[#D0EBDD] bg-white px-2.5 py-2.5 shadow-[0_-4px_20px_rgba(23,61,48,0.06)] sm:bottom-[72px] sm:px-6 sm:py-3.5 lg:bottom-0">
        {listening && (
          <div className="mx-auto mb-2 flex max-w-[850px] items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <span className="h-2.5 w-2.5 animate-ping rounded-full bg-red-500" />
              <span>Merekam suara • {formatDuration(recordingSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={cancelRecording}
              className="min-h-12 rounded-lg px-3 font-semibold text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              ✕ Batal
            </button>
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="mx-auto flex max-w-[850px] items-center gap-2.5"
        >
          <div className="flex min-h-14 flex-1 items-center rounded-full border-2 border-[#1B4D2B] bg-white px-4 focus-within:border-[#3E8E1F] focus-within:ring-2 focus-within:ring-[#3E8E1F]/30">
            <textarea
              rows={1}
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendMessage(event);
                }
              }}
              disabled={loading || historyLoading}
              placeholder={
                listening
                  ? 'Silakan bicara, lalu tekan kirim…'
                  : 'Ketik pesan atau tekan mikrofon…'
              }
              aria-label="Tulis pesan untuk Bu Nita"
              className="pointer-events-auto max-h-24 min-h-[40px] flex-1 resize-none touch-manipulation select-text bg-transparent py-2.5 text-base text-[#0F2D1A] outline-none placeholder:text-[#53665a]"
            />

            <button
              type="button"
              onClick={toggleMicrophone}
              disabled={loading || historyLoading}
              aria-label={
                listening ? 'Hentikan dan kirim suara' : 'Aktifkan mikrofon'
              }
              className={`-mr-2 ml-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3E8E1F] ${
                listening
                  ? 'animate-pulse bg-red-100 text-red-600'
                  : 'text-[#1B4D2B] hover:bg-[#EAF1E8]'
              }`}
            >
              {listening ? (
                <MicOff aria-hidden="true" size={22} />
              ) : (
                <Mic aria-hidden="true" size={22} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={
              (!input.trim() && !listening) || loading || historyLoading
            }
            aria-label={listening ? 'Kirim rekaman suara' : 'Kirim pesan'}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1B4D2B] text-white shadow-md shadow-[#1B4D2B]/25 transition-all hover:bg-[#3E8E1F] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD23F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <LoaderCircle
                aria-hidden="true"
                size={22}
                strokeWidth={2.5}
                className="animate-spin"
              />
            ) : (
              <Send aria-hidden="true" size={22} />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}