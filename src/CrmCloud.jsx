import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const stateId = import.meta.env.VITE_SUPABASE_STATE_ID || "eason-lead-tracker-main";
const ownerEmail = "easonlsy1019@gmail.com";
const supabase = url && key ? createClient(url, key) : null;

export default function CrmCloud({ leads, setLeads }) {
  const [user, setUser] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(supabase ? "請登入，然後選擇要採用的資料版本。" : "目前是本機模式；尚未設定 Supabase 網址與公開金鑰。");
  const [remote, setRemote] = useState(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const remoteUpdatedRef = useRef(null);
  const lastSavedPayloadRef = useRef(null);
  const currentLeadsRef = useRef(leads);
  const syncingRef = useRef(false);
  const enabledRef = useRef(false);
  const remoteCountRef = useRef(0);
  currentLeadsRef.current = leads;
  enabledRef.current = syncEnabled;

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (active && !error) setUser(data.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const owner = user?.email?.toLowerCase() === ownerEmail;

  const refreshRemote = useCallback(async () => {
    if (!supabase) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("crm_state")
        .select("id,leads,updated_at")
        .eq("id", stateId)
        .single();
      if (error) throw error;
      if (!Array.isArray(data.leads) || data.leads.length < 500) {
        throw new Error("雲端名單不足 500 筆，已停止同步，請先確認資料庫。");
      }
      setRemote(data);
      remoteUpdatedRef.current = data.updated_at;
      remoteCountRef.current = data.leads.length;
      setMessage(`已讀到雲端 ${data.leads.length} 筆。本機 ${currentLeadsRef.current.length} 筆；請選擇同步來源。`);
      return data;
    } catch (err) {
      setMessage(`讀取雲端失敗：${err.message}`);
      setSyncEnabled(false);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    setRemote(null);
    setSyncEnabled(false);
    remoteUpdatedRef.current = null;
    lastSavedPayloadRef.current = null;
    if (owner) void refreshRemote();
    else if (user) setMessage("目前登入的帳號沒有 CRM 存取權限。");
  }, [user?.id, owner, refreshRemote]);

  const sendLogin = async () => {
    if (!supabase) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: ownerEmail,
        options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setEmailSent(true);
      setMessage(`登入連結已寄到 ${ownerEmail}。請用這台電腦、同一個瀏覽器開啟。`);
    } catch (err) {
      setMessage(`寄送登入信失敗：${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const saveOne = useCallback(async (items, expectedUpdated) => {
    if (!Array.isArray(items) || items.length < Math.max(500, Math.floor(remoteCountRef.current * 0.8))) {
      throw new Error("名單數量異常減少，為保護雲端資料已拒絕寫入。");
    }
    const { data, error } = await supabase
      .from("crm_state")
      .update({ leads: items, updated_at: new Date().toISOString() })
      .eq("id", stateId)
      .eq("updated_at", expectedUpdated)
      .select("updated_at");
    if (error) throw error;
    if (!data || data.length !== 1) throw new Error("雲端版本已變更，已暫停同步，避免覆蓋其他修改。");
    return data[0].updated_at;
  }, []);

  const useLocal = async () => {
    if (!remote || !owner) return;
    setBusy(true);
    try {
      // Store a local copy of the cloud version before the first overwrite.
      localStorage.setItem("eason-crm-cloud-before-upload-" + Date.now(), JSON.stringify(remote.leads));
      const latest = await supabase.from("crm_state").select("updated_at").eq("id", stateId).single();
      if (latest.error) throw latest.error;
      if (latest.data.updated_at !== remoteUpdatedRef.current) throw new Error("雲端版本已更新，請重新讀取再選擇。");
      const payload = JSON.stringify(currentLeadsRef.current);
      const updatedAt = await saveOne(currentLeadsRef.current, remoteUpdatedRef.current);
      remoteUpdatedRef.current = updatedAt;
      remoteCountRef.current = currentLeadsRef.current.length;
      lastSavedPayloadRef.current = payload;
      setRemote({ leads: currentLeadsRef.current, updated_at: updatedAt });
      setSyncEnabled(true);
      setMessage(`已寫入本機 ${currentLeadsRef.current.length} 筆到雲端，後續修改將自動同步。`);
    } catch (err) {
      setSyncEnabled(false);
      setMessage(`首次同步失敗：${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const useCloud = () => {
    if (!remote || !owner) return;
    try {
      localStorage.setItem("eason-crm-local-before-cloud-load-" + Date.now(), JSON.stringify(currentLeadsRef.current));
    } catch (err) {
      setMessage(`本機備份失敗：${err.message}，已取消載入雲端。`);
      return;
    }
    lastSavedPayloadRef.current = JSON.stringify(remote.leads);
    setLeads(remote.leads);
    setSyncEnabled(true);
    setMessage(`已採用雲端 ${remote.leads.length} 筆，後續修改將自動同步。`);
  };

  const flush = useCallback(async () => {
    if (!supabase || syncingRef.current || !enabledRef.current || !remoteUpdatedRef.current) return;
    syncingRef.current = true;
    setSaving(true);
    try {
      while (enabledRef.current) {
        const items = currentLeadsRef.current;
        const payload = JSON.stringify(items);
        if (payload === lastSavedPayloadRef.current) break;
        const nextUpdated = await saveOne(items, remoteUpdatedRef.current);
        remoteUpdatedRef.current = nextUpdated;
        remoteCountRef.current = items.length;
        lastSavedPayloadRef.current = payload;
        setMessage(`雲端已同步 ${items.length} 筆（${new Date().toLocaleTimeString("zh-TW")}）。`);
      }
    } catch (err) {
      enabledRef.current = false;
      setSyncEnabled(false);
      setMessage(`雲端同步停止：${err.message}。本機資料仍保留，請勿清除瀏覽器資料。`);
    } finally {
      syncingRef.current = false;
      setSaving(false);
    }
  }, [saveOne]);

  useEffect(() => {
    if (!syncEnabled) return undefined;
    const timer = setTimeout(() => void flush(), 1000);
    return () => clearTimeout(timer);
  }, [leads, syncEnabled, flush]);

  const signOut = async () => {
    setSyncEnabled(false);
    await supabase.auth.signOut();
    setMessage("已登出雲端，本機資料仍保留。");
  };

  return (
    <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-blue-900">CRM 雲端備份 {syncEnabled ? "｜自動同步已啟用" : "｜同步尚未啟用"}</p>
          <p className="mt-1 text-sm text-slate-700">{message}</p>
          <p className="mt-1 text-xs text-slate-500">{saving ? "正在儲存…" : syncEnabled ? "修改後自動儲存；若版本衝突會停止。" : "只有確認資料來源後才會開始寫入雲端。"}</p>
        </div>
        {supabase && owner && <button onClick={signOut} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm">登出</button>}
      </div>
      {!supabase ? (
        <p className="mt-3 text-xs text-amber-700">請先在 .env.local 設定 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。</p>
      ) : !owner ? (
        <div className="mt-3">
          <button disabled={busy} onClick={sendLogin} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? "處理中…" : emailSent ? "重新寄送登入連結" : "寄送登入連結"}
          </button>
          <span className="ml-3 text-xs text-slate-600">登入帳號：{ownerEmail}</span>
        </div>
      ) : !syncEnabled && remote ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button disabled={busy} onClick={useLocal} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            以目前本機 {leads.length} 筆更新雲端
          </button>
          <button disabled={busy} onClick={useCloud} className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50">
            採用雲端 {remote.leads.length} 筆
          </button>
          <button disabled={busy} onClick={refreshRemote} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">重新檢查雲端</button>
          <p className="w-full text-xs text-amber-700">注意：選擇前請確認資料來源。覆蓋前會保留本機備份，雲端也保存最近 10 次舊版本。</p>
        </div>
      ) : null}
    </section>
  );
}
