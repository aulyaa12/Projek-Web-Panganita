"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { formatRegionTime } from "@/lib/regionTimezone";

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

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [listening, setListening] = useState(false);

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
  const mountedRef = useRef(false);
  const speakingIdRef = useRef(null);

  // -----------------------------------------------
  // PESAN PEMBUKA
  // -----------------------------------------------

  const pesanPembuka = () => ({
    id: "welcome",
    role: "assistant",
    content: PESAN_AWAL,
    sources: [],
    time: formatTime(new Date(), lokasi),
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

        setConversationId(data.conversationId || null);

        if (data.messages?.length > 0) {
          setMessages(data.messages);
        } else {
          setMessages([pesanPembuka()]);
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
      recognitionRef.current?.stop();
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
  // INPUT SUARA MENJADI TRANSKRIP TEKS
  // -----------------------------------------------

  function toggleMicrophone() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Browser belum mendukung pengenalan suara. Silakan gunakan Chrome atau Edge.",
      );
      return;
    }

    stopSpeech();
    setError("");

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
  // MENGIRIM PESAN KE API DAN SUPABASE
  // -----------------------------------------------

  async function sendMessage(event) {
    event?.preventDefault();

    const text = input.trim();

    if (!text || loading || historyLoading) return;

    recognitionRef.current?.stop();

    setListening(false);

    stopSpeech();

    setInput("");
    setLoading(true);
    setError("");

    const localUserId = `user-${Date.now()}`;

    const userMessage = {
      id: localUserId,
      role: "user",
      content: text,
      sources: [],
      time: formatTime(new Date(), lokasi),
    };

    setMessages((previous) => [...previous, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          conversationId,
          userName: namaIbu,
          location: lokasi,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Pesan gagal dikirim.");
      }

      const data = result.data;

      setConversationId(data.conversationId);

      const assistantMessage = {
        id: String(data.assistantMessageId || `assistant-${Date.now()}`),
        role: "assistant",
        content: data.reply,
        sources: data.sources || [],
        dialect: data.dialect || null,
        time: data.time || formatTime(new Date(), lokasi),
      };

      setMessages((previous) =>
        previous
          .map((message) =>
            message.id === localUserId
              ? {
                  ...message,
                  id: String(data.userMessageId || message.id),
                }
              : message,
          )
          .concat(assistantMessage),
      );

      if (voiceEnabled) {
        speakText(assistantMessage.content, assistantMessage.id);
      }
    } catch (err) {
      console.error("Pengiriman chat gagal:", err);

      setMessages((previous) =>
        previous.filter((message) => message.id !== localUserId),
      );

      setError(err.message || "Tidak dapat menghubungi Bu Nita.");
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------
  // MEMBUAT PERCAKAPAN BARU
  // -----------------------------------------------

  async function newConversation() {
    if (loading) return;

    stopSpeech();

    recognitionRef.current?.stop();

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

                            <div className="mt-2 space-y-1">
                              {message.sources.map((source, index) => (
                                <p key={index}>
                                  {typeof source === "string"
                                    ? source
                                    : source.title ||
                                      source.name ||
                                      `Referensi ${index + 1}`}
                                </p>
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
              placeholder="Ketik pesan atau tekan mikrofon untuk bicara..."
              aria-label="Tulis pesan untuk Bu Nita"
              className="pointer-events-auto min-h-[38px] max-h-24 flex-1 resize-none touch-manipulation select-text bg-transparent py-2.5 text-base text-[#294A3B] outline-none placeholder:text-[#91AA9C]"
            />

            <button
              type="button"
              onClick={toggleMicrophone}
              disabled={loading || historyLoading}
              aria-label={listening ? "Hentikan mikrofon" : "Aktifkan mikrofon"}
              className={`ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
                listening
                  ? "bg-red-100 text-red-600"
                  : "text-[#176B49] hover:bg-[#E3F5E9]"
              }`}
            >
              {listening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading || historyLoading}
            aria-label="Kirim pesan"
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
