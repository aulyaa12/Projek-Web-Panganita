"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  formatRegionTime,
  extractLocationFromText,
} from "@/lib/regionTimezone";

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
} from "lucide-react";

const PESAN_AWAL =
  "Assalamu'alaikum, Ibu! Saya Bu Nita, asisten gizi Panganita. Saya siap membantu Ibu memahami gizi keluarga, bahan pangan, dan pencegahan stunting. Yuk, kita belajar bersama. Ada yang ingin Ibu tanyakan?";

function formatTime(date = new Date(), location = "") {
  return formatRegionTime(date, location);
}

function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function NitaAvatar({ small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#DDF2E5] font-bold text-[#176B49] ${
        small ? "h-9 w-9 text-xs" : "h-14 w-14 text-lg"
      }`}
    >
      BN
    </div>
  );
}

export default function ChatBuNita({ namaIbu = "", lokasi = "" }) {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [profilLokasi, setProfilLokasi] = useState(lokasi);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [listening, setListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingUserId, setPlayingUserId] = useState(null);

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingId, setSpeakingId] = useState(null);
  const [paused, setPaused] = useState(false);

  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(0.95);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const recordingSecondsRef = useRef(0);
  const liveTranscriptRef = useRef("");
  const userAudioRef = useRef(null);
  const createdAudioUrlsRef = useRef([]);
  const mountedRef = useRef(false);
  const speakingIdRef = useRef(null);

  useEffect(() => {
    setProfilLokasi(lokasi);
  }, [lokasi]);

  // -----------------------------------------------
  // PESAN PEMBUKA
  // -----------------------------------------------

  const pesanPembuka = (lok = profilLokasi) => ({
    id: "welcome",
    role: "assistant",
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
        const response = await fetch("/api/chat", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Riwayat percakapan gagal dimuat.");
        }

        if (!mountedRef.current) return;

        const data = result.data;
        const freshLoc =
          typeof data.location === "string" ? data.location : lokasi;

        setProfilLokasi(freshLoc);
        setConversationId(data.conversationId || null);

        if (data.messages?.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([pesanPembuka(freshLoc)]);
        }
      } catch (err) {
        console.error("Gagal memuat chat:", err);

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
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (userAudioRef.current) {
        userAudioRef.current.pause();
        userAudioRef.current = null;
      }
      createdAudioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdAudioUrlsRef.current = [];
      window.speechSynthesis?.cancel();
    };
  }, []);

  // -----------------------------------------------
  // MEMUAT PREFERENSI SUARA
  // -----------------------------------------------

  useEffect(() => {
    try {
      const savedVoice = localStorage.getItem("nita_voice_uri");
      const savedRate = localStorage.getItem("nita_voice_rate");
      const savedEnabled = localStorage.getItem("nita_voice_enabled");

      if (savedVoice) {
        setVoiceURI(savedVoice);
      }

      if (savedRate) {
        const value = Number(savedRate);

        if (value >= 0.75 && value <= 1.15) {
          setRate(value);
        }
      }

      if (savedEnabled !== null) {
        setVoiceEnabled(savedEnabled === "true");
      }
    } catch {
      console.warn("Preferensi suara tidak dapat dimuat.");
    }
  }, []);

  // -----------------------------------------------
  // MEMUAT DAFTAR SUARA BROWSER
  // -----------------------------------------------

  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();

      setVoices(available);

      setVoiceURI((current) => {
        if (current && available.some((voice) => voice.voiceURI === current)) {
          return current;
        }

        return (
          available.find((voice) => voice.lang.toLowerCase() === "id-id")
            ?.voiceURI || ""
        );
      });
    };

    loadVoices();

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // -----------------------------------------------
  // SCROLL OTOMATIS
  // -----------------------------------------------

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // -----------------------------------------------
  // MENGHENTIKAN SUARA
  // -----------------------------------------------

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();

    speakingIdRef.current = null;

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

  const speakText = useCallback(
    (text, id) => {
      if (!window.speechSynthesis || !text) return;

      window.speechSynthesis.cancel();

      const cleanSpeechText = String(text)
        .replace(/“|”/g, "")
        .replace(/[*#_~`]/g, "")
        .replace(/[\u{1F600}-\u{1FAFF}\u2600-\u27BF]/gu, "")
        .replace(/📚.*$/gm, "")
        .replace(/⚠️.*$/gm, "")
        .replace(/\bPANGANITA\b/gi, "Panganita")
        .replace(/\bMPASI\b/gi, "empasi")
        .replace(/\b1\.000\s*HPK\b/gi, "seribu hari pertama kehidupan")
        .replace(/\bHPK\b/gi, "hari pertama kehidupan")
        .replace(/\s+/g, " ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(
        cleanSpeechText || "Halo Ibu, Bu Nita siap mendengarkan.",
      );

      const selectedVoice = voices.find((voice) => voice.voiceURI === voiceURI);

      utterance.lang = selectedVoice?.lang || "id-ID";
      utterance.voice = selectedVoice || null;
      utterance.rate = rate;
      utterance.pitch = 1.03;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (!mountedRef.current) return;

        speakingIdRef.current = id;

        setSpeakingId(id);
        setPaused(false);
      };

      utterance.onend = () => {
        if (!mountedRef.current) return;

        speakingIdRef.current = null;

        setSpeakingId(null);
        setPaused(false);
      };

      utterance.onerror = () => {
        if (!mountedRef.current) return;

        speakingIdRef.current = null;

        setSpeakingId(null);
        setPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [voices, voiceURI, rate],
  );

  // -----------------------------------------------
  // PUTAR ULANG SUARA
  // -----------------------------------------------

  function toggleAudio(message) {
    if (speakingIdRef.current === message.id) {
      stopSpeech();
      return;
    }

    speakText(message.content, message.id);
  }

  // -----------------------------------------------
  // JEDA / LANJUTKAN SUARA
  // -----------------------------------------------

  function togglePause() {
    if (!window.speechSynthesis) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  // -----------------------------------------------
  // PENGATURAN SUARA
  // -----------------------------------------------

  function changeVoice(value) {
    stopSpeech();

    setVoiceURI(value);

    localStorage.setItem("nita_voice_uri", value);
  }

  function changeRate(value) {
    const next = Number(value);

    setRate(next);

    localStorage.setItem("nita_voice_rate", String(next));
  }

  function toggleVoice() {
    const next = !voiceEnabled;

    setVoiceEnabled(next);

    localStorage.setItem("nita_voice_enabled", String(next));

    if (!next) {
      stopSpeech();
    }
  }

  function playSample() {
    speakText(
      "Halo Ibu, apa kabar hari ini? Saya Bu Nita. Yuk, kita belajar bersama tentang gizi keluarga.",
      "sample",
    );
  }

  // -----------------------------------------------
  // MENGIRIM PESAN TEKS ATAU AUDIO KE API & SUPABASE
  // -----------------------------------------------

  async function submitChatPayload({
    text = "",
    audioBase64 = "",
    mimeType = "",
    voiceNote = null,
    optimisticText = "",
  }) {
    if ((!text && !audioBase64) || loading || historyLoading) return;

    stopSpeech();
    stopUserAudio();
    setLoading(true);
    setError("");

    const localUserId = `user-${Date.now()}`;
    const initialDisplayText =
      text ||
      optimisticText ||
      (voiceNote?.duration
        ? `🎙️ Pesan Suara Ibu (${voiceNote.duration})`
        : "🎙️ Mengirim pesan suara...");
    const detectedLoc = extractLocationFromText(initialDisplayText);

    const userMessage = {
      id: localUserId,
      role: "user",
      content: initialDisplayText,
      voiceNote,
      sources: [],
      time: formatTime(new Date(), detectedLoc || profilLokasi),
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(result.error || "Pesan gagal dikirim.");
      }

      const data = result.data;

      setConversationId(data.conversationId);
      if (typeof data.location === "string" && data.location) {
        setProfilLokasi(data.location);
      }

      const activeLoc = data.location || profilLokasi;
      const finalUserText =
        data.transcript || text || optimisticText || "Pesan suara";
      const finalUserLoc = extractLocationFromText(finalUserText);

      const assistantMessage = {
        id: String(data.assistantMessageId || `assistant-${Date.now()}`),
        role: "assistant",
        content: data.reply,
        sources: data.sources || [],
        dialect: data.dialect || null,
        time: data.time || formatTime(new Date(), activeLoc),
      };

      setMessages((previous) =>
        previous
          .map((message) =>
            message.id === localUserId
              ? {
                  ...message,
                  id: String(data.userMessageId || message.id),
                  content: finalUserText,
                  voiceNote,
                  time: data.time || formatTime(new Date(), finalUserLoc || activeLoc),
                }
              : message,
          )
          .concat(assistantMessage),
      );

      if (voiceEnabled) {
        speakText(assistantMessage.content, assistantMessage.id);
      }
    } catch (err) {
      console.warn("Pengiriman chat gagal:", err?.message || err);

      setMessages((previous) =>
        previous.filter((message) => message.id !== localUserId),
      );

      setError(err.message || "Tidak dapat menghubungi Bu Nita.");
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
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    liveTranscriptRef.current = "";
    recordingSecondsRef.current = 0;
    setRecordingSeconds(0);
    setListening(false);
    setInput("");
  }

  function stopMediaRecording() {
    clearRecordingResources();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
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
    setError("");

    // Prioritaskan MediaRecorder (disertai live SpeechRecognition paralel)
    // agar teks muncul otomatis saat bicara, VN bisa diputar ulang, dan tetap jalan di semua browser.
    if (
      typeof window !== "undefined" &&
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;

        const preferredTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
          "audio/ogg;codecs=opus",
          "audio/ogg",
        ];
        const supportedType =
          preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ||
          "";

        const recorder = supportedType
          ? new MediaRecorder(stream, { mimeType: supportedType })
          : new MediaRecorder(stream);

        audioChunksRef.current = [];
        liveTranscriptRef.current = "";
        recordingSecondsRef.current = 0;
        setRecordingSeconds(0);

        recorder.ondataavailable = (event) => {
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
            recognition.lang = "id-ID";
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
              const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript || "")
                .join(" ")
                .replace(/\s+/g, " ")
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
            recorder.mimeType || supportedType || "audio/webm";
          const chunks = [...audioChunksRef.current];
          const spokenPreview = liveTranscriptRef.current.trim();
          const finalDuration = formatDuration(
            Math.max(1, recordingSecondsRef.current),
          );

          audioChunksRef.current = [];
          liveTranscriptRef.current = "";
          recordingSecondsRef.current = 0;
          mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
          mediaRecorderRef.current = null;
          setRecordingSeconds(0);
          setListening(false);
          setInput("");

          const blob = new Blob(chunks, { type: recordedMime });

          if (blob.size < 400) {
            setError("Rekaman suara terlalu singkat. Silakan coba lagi.");
            return;
          }

          const audioUrl = URL.createObjectURL(blob);
          createdAudioUrlsRef.current.push(audioUrl);

          const reader = new FileReader();
          reader.onloadend = () => {
            const cleanBase64 = String(reader.result || "").replace(
              /^data:.*?;base64,/i,
              "",
            );
            const cleanMime = recordedMime.split(";")[0].trim() || "audio/webm";
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
            setError("Rekaman suara gagal dibaca. Silakan coba lagi.");
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
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        setListening(false);
        setRecordingSeconds(0);

        if (
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError"
        ) {
          setError("Izin penggunaan mikrofon belum diberikan.");
          return;
        }
        // Lanjut ke fallback SpeechRecognition bila mikrofon gagal diakses lewat MediaRecorder
      }
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Browser belum mendukung perekaman suara. Silakan gunakan browser modern atau ketik pesan.",
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      setInput(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setError("Izin penggunaan mikrofon belum diberikan.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setError("Mikrofon mengalami gangguan.");
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
      setError("Mikrofon tidak dapat diaktifkan.");
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
    setInput("");

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
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "new",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Percakapan baru gagal dibuat.");
      }

      setConversationId(result.data.conversationId);

      setMessages([pesanPembuka()]);
      setInput("");
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
    <main className="min-h-[calc(100dvh-80px)] bg-[#E5FFF0] text-[#173D30]">
      <div className="mx-auto max-w-6xl px-3 pb-[220px] pt-5 sm:px-6 lg:pb-36">
        {/* PROFIL BU NITA */}

        <section className="mb-6 flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-4 shadow-sm sm:px-6">
          <NitaAvatar />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-[#164532] sm:text-lg">
                Bu Nita AI
              </h1>

              <span className="rounded-full bg-[#D3F2E1] px-2.5 py-1 text-[10px] font-semibold text-[#176C4B]">
                Asisten Gizi RAG
              </span>
            </div>

            <p className="mt-1 text-xs text-[#718B7D]">
              Panduan Pangan & Gizi Keluarga
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={newConversation}
              disabled={loading || historyLoading}
              title="Percakapan baru"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF9F2] text-[#26724E] hover:bg-[#DDF3E5] disabled:opacity-40"
            >
              <Plus size={19} />
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              title="Pengaturan suara"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF9F2] text-[#26724E] hover:bg-[#DDF3E5]"
            >
              <Settings2 size={19} />
            </button>
          </div>
        </section>

        {/* PENGATURAN SUARA */}

        {showSettings && (
          <section className="mb-6 rounded-2xl border border-[#CFEBDC] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#164532]">Pengaturan Suara</h2>

              <button type="button" onClick={() => setShowSettings(false)}>
                <X size={19} />
              </button>
            </div>

            <label className="mb-4 block text-sm font-medium">
              Pilih suara Bu Nita
              <select
                value={voiceURI}
                onChange={(event) => changeVoice(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#D3E8DB] bg-white p-3 text-sm"
              >
                <option value="">Suara bawaan browser</option>

                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </label>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Kecepatan bicara</span>

                <span className="font-semibold text-[#176B49]">
                  {rate.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.75"
                max="1.15"
                step="0.05"
                value={rate}
                onChange={(event) => changeRate(event.target.value)}
                className="w-full accent-green-700"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                className="rounded-xl bg-[#E5F6EB] px-4 py-2.5 text-sm font-semibold text-[#176B49]"
              >
                {voiceEnabled
                  ? "Matikan suara otomatis"
                  : "Aktifkan suara otomatis"}
              </button>

              <button
                type="button"
                onClick={playSample}
                className="rounded-xl bg-[#105A40] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <span className="flex items-center gap-2">
                  <Play size={15} />
                  Coba suara
                </span>
              </button>
            </div>
          </section>
        )}

        {/* RIWAYAT PESAN */}

        <section className="mx-auto flex max-w-[850px] flex-col gap-5">
          {historyLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#54806B]">
              <LoaderCircle size={18} className="animate-spin" />
              Memuat percakapan...
            </div>
          )}

          {!historyLoading &&
            messages.map((message) => {
              const isUser = message.role === "user";
              const active = speakingId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex w-full items-end gap-2.5 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && <NitaAvatar small />}

                  <div
                    className={`max-w-[88%] sm:max-w-[78%] ${
                      isUser ? "order-1" : ""
                    }`}
                  >
                    <p
                      className={`mb-1.5 px-1 text-[11px] font-medium ${
                        isUser ? "text-right text-[#327354]" : "text-[#54806B]"
                      }`}
                    >
                      {isUser ? "Ibu" : "Bu Nita"}
                    </p>

                    <div
                      className={`rounded-[20px] px-4 py-3.5 shadow-sm sm:px-5 sm:py-4 ${
                        isUser
                          ? "rounded-br-[5px] bg-[#105A40] text-white"
                          : "rounded-bl-[5px] border border-[#E4F0E8] bg-white text-[#294A3B]"
                      }`}
                    >
                      {isUser && message.voiceNote?.audioUrl && (
                        <div className="mb-2.5 flex items-center gap-2.5 rounded-xl bg-white/15 px-3 py-2 text-white">
                          <button
                            type="button"
                            onClick={() => toggleUserAudio(message)}
                            aria-label={
                              playingUserId === message.id
                                ? "Jeda rekaman suara"
                                : "Putar rekaman suara"
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#105A40] shadow-sm transition hover:bg-green-50"
                          >
                            {playingUserId === message.id ? (
                              <Pause size={14} fill="currentColor" />
                            ) : (
                              <Play size={14} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>

                          <div className="flex flex-1 items-center gap-[3px]">
                            {[10, 16, 8, 20, 13, 18, 9, 15, 20, 11, 16, 9].map(
                              (h, idx) => (
                                <span
                                  key={idx}
                                  className={`w-[3px] rounded-full bg-white/85 ${
                                    playingUserId === message.id
                                      ? "animate-pulse"
                                      : "opacity-80"
                                  }`}
                                  style={{ height: `${h}px` }}
                                />
                              ),
                            )}
                          </div>

                          <span className="shrink-0 text-[11px] font-semibold text-green-50">
                            Suara Ibu • {message.voiceNote.duration}
                          </span>
                        </div>
                      )}

                      <p className="select-text cursor-text whitespace-pre-wrap break-words text-[14px] leading-7 sm:text-sm">
                        {message.content}
                      </p>

                      <p
                        className={`mt-2 text-right text-[10px] ${
                          isUser ? "text-green-100/80" : "text-[#9AAFA3]"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>

                    {!isUser && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAudio(message)}
                          className="flex items-center gap-2 rounded-full border border-[#BBDDC9] bg-white px-3.5 py-2 text-xs font-semibold text-[#176B49] shadow-sm hover:bg-[#EAF8EF]"
                        >
                          {active ? (
                            <Square size={13} fill="currentColor" />
                          ) : (
                            <Play size={14} fill="currentColor" />
                          )}

                          {active ? "Hentikan" : "Dengarkan"}
                        </button>

                        {active && (
                          <button
                            type="button"
                            onClick={togglePause}
                            className="flex items-center gap-1 rounded-full border border-[#BBDDC9] bg-white px-3 py-2 text-xs text-[#176B49]"
                          >
                            {paused ? <Play size={13} /> : <Pause size={13} />}

                            {paused ? "Lanjutkan" : "Jeda"}
                          </button>
                        )}

                        {voiceEnabled && (
                          <span className="text-[10px] text-[#799889]">
                            <Volume2 size={12} className="mr-1 inline" />
                            Suara Bu Nita
                          </span>
                        )}

                        {message.sources?.length > 0 && (
                          <details className="text-xs text-[#54806B]">
                            <summary className="cursor-pointer">
                              Sumber informasi
                            </summary>

                            <div className="mt-2 space-y-1.5 rounded-xl border border-[#D4ECDD] bg-white px-3 py-2 shadow-sm">
                              {message.sources.map((source, index) => (
                                <div key={index} className="leading-relaxed">
                                  <p className="font-medium text-[#173D30]">
                                    •{" "}
                                    {typeof source === "string"
                                      ? source
                                      : source.title ||
                                        source.name ||
                                        `Referensi ${index + 1}`}
                                  </p>
                                  {typeof source === "object" &&
                                    source?.source && (
                                      <p className="pl-3 text-[11px] text-[#608B77]">
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
            <div className="flex items-center gap-3">
              <NitaAvatar small />

              <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs text-[#54806B] shadow-sm">
                <LoaderCircle size={16} className="animate-spin" />
                Bu Nita sedang menyiapkan jawaban...
              </div>
            </div>
          )}

          {/* PESAN ERROR */}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />

              <p className="flex-1">{error}</p>

              <button type="button" onClick={() => setError("")}>
                <X size={14} />
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </section>
      </div>

      {/* KOLOM INPUT CHAT */}

      <footer className="pointer-events-auto fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+100px)] z-40 border-t border-[#D0EBDD] bg-white/95 px-3 py-3 backdrop-blur-lg sm:px-6 sm:py-4 lg:bottom-0">
        {listening && (
          <div className="mx-auto mb-2 flex max-w-[850px] items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <span className="h-2.5 w-2.5 animate-ping rounded-full bg-red-500" />
              <span>Merekam suara • {formatDuration(recordingSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={cancelRecording}
              className="rounded-lg px-2 py-0.5 font-semibold text-red-700 hover:bg-red-100"
            >
              ✕ Batal
            </button>
          </div>
        )}

        <form
          onSubmit={sendMessage}
          className="mx-auto flex max-w-[850px] items-center gap-2.5"
        >
          <div className="flex min-h-[52px] flex-1 items-center rounded-full border border-[#C3E7D2] bg-[#F7FCF8] px-4 focus-within:border-[#23845A] focus-within:ring-2 focus-within:ring-[#DDF4E6]">
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
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
                  ? "Silakan bicara (teks otomatis muncul) atau tekan kirim..."
                  : "Ketik pesan atau tekan mikrofon untuk bicara..."
              }
              aria-label="Tulis pesan untuk Bu Nita"
              className="pointer-events-auto min-h-[38px] max-h-24 flex-1 resize-none touch-manipulation select-text bg-transparent py-2.5 text-base text-[#294A3B] outline-none placeholder:text-[#91AA9C]"
            />

            <button
              type="button"
              onClick={toggleMicrophone}
              disabled={loading || historyLoading}
              aria-label={listening ? "Hentikan dan kirim suara" : "Aktifkan mikrofon"}
              className={`ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                listening
                  ? "animate-pulse bg-red-100 text-red-600"
                  : "text-[#176B49] hover:bg-[#E3F5E9]"
              }`}
            >
              {listening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={(!input.trim() && !listening) || loading || historyLoading}
            aria-label={listening ? "Kirim rekaman suara" : "Kirim pesan"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#105A40] text-white shadow-md hover:bg-[#0A4632] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>

        <p className="mt-2 text-center text-[10px] text-[#91AA9C]">
          Bu Nita AI • Asisten Gizi Keluarga PANGANITA
        </p>
      </footer>
    </main>
  );
}
