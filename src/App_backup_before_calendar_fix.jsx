import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, Upload, ClipboardList, Mail, CheckCircle2, Clock3, DollarSign, CalendarDays, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, AlertCircle, Undo2, Download } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const SUPABASE_STATE_ID = import.meta.env.VITE_SUPABASE_STATE_ID || "eason-lead-tracker-main";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const STORAGE_KEY = "eason-lead-tracker-v2";
const OLD_KEYS = ["eason-lead-tracker-v1", "eason-lead-tracker-v3"];
const FOLLOW_UP_DAYS = 3;
const INTERNAL_DISCUSSION_DAYS = 6;

const statusOptions = ["準備事項","未聯絡","已寄信","已追蹤一次","對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","需求確認中","已約討論","洽談中","已報價","談合約","進行中","成交","無回覆暫放","無需求","內部無需求但可能有實習機會","未成交","已放棄"];
const statusRank = Object.fromEntries(statusOptions.map((s,i)=>[s,i]));
const typeOptions = ["環境教育","地方創生","社區營造","營隊/活動","課程/補習","公益/社福","小店/品牌","餐飲/夜市","市集/攤商","個人品牌/自由工作者","既有合作案","準備事項","其他"];
const leadQualityOptions = ["A｜中型系統高機會","B｜可能有流程需求","C｜小方案 / 低優先","D｜不符合主線 / 放棄"];
const focusFitOptions = ["活動 / 課程 / 營隊","公益 / 協會 / 社福","論壇 / 研討會","地方創生 / 市集","多據點服務","小店 / 個人品牌","不符合","其他"];
const sourceOptions = ["對方主動來信 / 既有合作案","公開聯絡信箱","官網聯絡頁","Facebook / IG","LINE 官方帳號","朋友介紹","我主動開發","內部準備事項","其他"];
const amountOptions = ["","30000","50000","70000","90000","100000","150000","200000"];
const timeOptions = ["","待確認","約 1 個月","約 2–3 個月","約 4 個月以上","簽約後約 1 個月","簽約後約 2 個月","簽約後約 3 個月以上","依功能範圍評估"];
const planOptions = [
  "",
  "小方案｜一頁式活動 / 課程網頁｜學生價 NT$ 8,000–15,000",
  "小方案｜LINE 官方帳號整理｜學生價 NT$ 5,000–10,000",
  "小方案｜小型品牌 / 服務介紹頁｜學生價 NT$ 8,000–18,000",
  "小方案｜小型 FAQ / 資訊整理版｜學生價 NT$ 10,000–20,000",
  "小方案｜小店 / 餐飲資訊頁｜學生價 NT$ 6,000–12,000",
  "小方案｜個人品牌 / 服務預約頁｜學生價 NT$ 8,000–18,000",
  "小方案｜市集 / 出攤資訊頁｜學生價 NT$ 8,000–18,000",
  "CRM｜個人本機管理工具｜學生價 NT$ 15,000 起",
  "CRM｜客製欄位管理工具｜學生價 NT$ 25,000–40,000 起",
  "CRM｜雲端團隊管理工具｜學生價 NT$ 50,000 起，依需求評估",
  "完整系統｜基礎導入版｜學生價 NT$ 30,000 起",
  "完整系統｜標準查詢版｜學生價 NT$ 50,000–90,000 起",
  "完整系統｜進階系統版｜學生價 NT$ 100,000 起，依需求評估",
  "維護｜單次修改 / 小維護｜學生價 NT$ 1,000–5,000 起 / 次",
  "維護｜每月基礎維護｜學生價 NT$ 1,500–6,000 起 / 月",
  "維護｜月報 / 資料更新維護｜學生價 NT$ 2,000–8,000 起 / 月",
  "維護｜主機與系統代管｜學生價 NT$ 300–500 起 / 月，平台費另計",
  "其他／待評估"
];
const needOptions = [
  "LINE Bot、FAQ 分流、表單連結、基礎資訊查詢",
  "LINE Bot、資料查詢、後台資料管理、基礎統計",
  "LINE Bot、民眾上傳位置、最近據點判斷、後台資料管理",
  "活動/課程報名、FAQ、表單整合、通知流程",
  "小店/餐飲資訊、菜單、營業時間、Google 地圖、LINE/IG 聯絡入口",
  "市集/出攤資訊、商品介紹、預訂表單、社群連結",
  "個人品牌服務介紹、作品集、預約表單、LINE/IG 聯絡入口",
  "地方據點/店家清單、地圖導覽、活動資訊、成果紀錄",
  "客製化表單、資料整理、後台管理、Dashboard",
  "整理第二波名單與寄信內容",
  "追蹤已寄信單位回覆狀況",
  "準備需求訪談問題與報價範圍",
  "其他，需進一步討論"
];
const replyOptions = ["尚未回覆","對方表示有興趣，待約時間","對方詢問價格 / 報價方式","對方需要內部討論","對方目前沒有需求","已安排線上討論","已寄出報價 / 功能範圍","目前等待合約確認"];
const nextOptions = ["待安排寄送時間","對方願意交流，先補充背景與案例，後續視對方回覆再推進","第一次寄出後 3 個工作日追蹤一次","已補寄 / 已追蹤一次，等回覆，暫不二追","追蹤後 5–7 天仍無回覆，先暫放","等待回覆，不主動追太快","已回信，等待對方下一步","已加 LINE，改在 LINE 上持續聯繫","已轉到 LINE 洽談，等待對方提供需求","內部暫無合作需求，但可能有實習機會，之後可整理履歷 / 作品集再聯繫","準備需求討論問題","約 15–30 分鐘線上討論","整理第一版功能範圍與時程","寄出報價單 / 合作流程說明","等待合約；合約收到後檢查功能範圍、付款節點、驗收標準、UI/素材、主機費與維護條款。","整理下一波可聯絡名單","暫時放棄，之後再追蹤"];


const outreachTemplateOptions = [
  { value:"auto", label:"自動判斷 A/B/C" },
  { value:"A", label:"A｜課程／營隊／親子活動" },
  { value:"B", label:"B｜公益／協會／社福" },
  { value:"C", label:"C｜市集／地方創生／社企" },
  { value:"followUp", label:"追蹤信｜第一次補追" }
];
const templateSubjects = {
  A:"LINE / 活動報名與常見問題流程整理合作詢問",
  B:"LINE / Web 活動與民眾詢問流程整理合作詢問",
  C:"LINE / Web 市集活動與地方推廣流程整理合作詢問",
  followUp:"Re: LINE / Web 流程整理合作詢問"
};
const easonSignature = `謝謝您，祝順心。\n\n黃元逸 Eason\nEason Systems\nEmail：easonlsy1019@gmail.com\nLINE ID：1234567890eason60708`;
function detectTemplateType(lead={}){
  const text=[lead.type, lead.focusFit, lead.need, lead.notes, lead.projectPlan].join(" ");
  if(/建議用\s*A|A\s*模板|課程|補習|營隊|夏令營|工作坊|研討會|論壇|親子|培訓|教育訓練|講座/.test(text)) return "A";
  if(/建議用\s*B|B\s*模板|公益|社福|協會|基金會|志工|民眾服務|會員服務|非營利|照顧|長照|輔導/.test(text)) return "B";
  if(/建議用\s*C|C\s*模板|市集|地方創生|社區營造|地方|導覽|體驗|文創|攤商/.test(text)) return "C";
  return "A";
}
function cleanSnippet(text="", max=34){
  const raw=String(text||"").replace(/https?:\/\/\S+/g,"").replace(/[\n\r\t]+/g," ").replace(/\s+/g," ").trim();
  if(!raw) return "活動、課程或服務資訊";
  const first=raw.split(/[，。；;、]/).filter(Boolean).slice(0,3).join("、");
  return first.length>max ? `${first.slice(0,max)}…` : first;
}
function sourceLabel(source=""){
  if(!source) return "貴單位相關資訊";
  if(/^https?:\/\//.test(source)) return "貴單位官網或活動頁";
  return source;
}
function openingLineForTemplate(lead={}, templateType="A"){
  const need=cleanSnippet(lead.need || lead.notes || lead.type);
  if(templateType==="B") return `我注意到貴單位有${need}等活動、志工、教育推廣或民眾服務相關資訊，因此想詢問目前在活動入口、志工報名、民眾常見問題、LINE 詢問或服務導覽流程上，是否有需要整理的地方。`;
  if(templateType==="C") return `我注意到貴單位有${need}等市集、地方創生、地方導覽、體驗活動或推廣相關內容，因此想詢問目前在活動資訊入口、報名流程、合作洽詢、LINE 詢問或 FAQ 整理上，是否有需要協助的地方。`;
  return `我注意到貴單位近期有${need}等課程、營隊或活動相關服務，因此想詢問目前在活動資訊、報名流程、LINE 詢問、FAQ 或行前通知上，是否有需要整理的地方。`;
}
function buildOutreachEmailBody(lead={}, templateType="A"){
  const t=templateType==="auto"?detectTemplateType(lead):templateType;
  if(t==="followUp") return buildFollowUpEmailBody(lead);
  const opening=openingLineForTemplate(lead,t);
  const source=sourceLabel(lead.source);
  const bullets = t==="B" ? [
    "LINE / Web 活動與志工入口整理",
    "常見問題 FAQ 分流",
    "民眾服務、志工報名、活動參與或課程邀約導覽",
    "Google 表單、官網、netiCRM、社群或既有報名頁連結整合",
    "民眾常見詢問與服務入口整理"
  ] : t==="C" ? [
    "LINE / Web 活動與市集入口整理",
    "常見問題 FAQ 分流",
    "攤商報名、合作洽詢、活動資訊與交通導覽",
    "Google 表單、官網、社群或既有報名頁連結整合",
    "活動前後資訊、查詢紀錄與成果資料整理"
  ] : [
    "LINE / Web 活動入口整理",
    "常見問題 FAQ 分流",
    "報名前資格、梯次、費用與注意事項導覽",
    "Google 表單、官網、社群或既有報名頁連結整合",
    "行前通知、活動資訊與常見詢問整理"
  ];
  const orgType = t==="B" ? "公益、協會與活動型組織" : t==="C" ? "市集、地方創生與活動型團隊" : "活動、課程與營隊團隊";
  const audience = t==="B" ? "民眾" : t==="C" ? "民眾、攤商或合作單位" : "參與者";
  const existingTools = t==="B" ? "官網、Google 表單、netiCRM 或其他既有系統" : "官網、Google 表單、社群或既有報名系統";
  const lastQuestion = t==="B" ? "目前活動、志工、民眾詢問與 LINE / FAQ 流程" : t==="C" ? "目前活動資訊、報名入口、合作洽詢與 LINE / FAQ 流程" : "目前活動資訊、報名入口與 LINE / FAQ 流程";
  return `您好，我是 Eason Systems 的黃元逸。\n\n${opening}\n\n我主要協助${orgType}整理${audience}進入報名頁或服務入口前的流程，例如：\n\n${bullets.map((b,i)=>`${i+1}. ${b}`).join("\n")}\n\n如果貴單位目前已經有${existingTools}，我不會建議取代原本工具；我比較能補上的，是這些工具前面的 LINE / Web 導覽層，讓使用者更快找到正確資訊，也減少同仁重複回覆。\n\n我這次是從${source}看到貴單位相關資訊，因此想先詢問是否有可以協助整理的地方。\n\n我之前也做過實際上線的 LINE / Web 系統，例如公廁查詢 LINE Bot，累積超過 3 萬名使用者，並有後台 Dashboard 與查詢資料整理：\nhttps://toilet-mvp-dev.vercel.app/#media\n\n也附上我的服務網站，裡面有整理目前可協助的方向：\nhttps://eason-systems.vercel.app/\n\n想請問貴單位目前是否有相關流程想整理，或是否方便讓我先了解${lastQuestion}，我可以先提供初步建議。\n\n${easonSignature}`;
}
function buildFollowUpEmailBody(lead={}){
  const topic=cleanSnippet(lead.need || lead.notes || "LINE / Web 流程整理");
  return `您好，我是 Eason Systems 的黃元逸。\n\n前幾天有寄信詢問貴單位是否有 LINE / Web 流程整理、FAQ 分流或活動 / 課程資訊導覽相關需求，想簡單補充一下。\n\n我這邊主要不是取代貴單位原本的官網、表單或報名系統，而是協助補上使用者進入原本系統前的導覽流程，例如${topic}等資訊整理，讓參與者或民眾更快找到正確入口，也減少同仁重複回覆。\n\n若目前暫時沒有相關需求，也完全沒問題；之後若剛好有活動流程、常見問題或 LINE / Web 入口需要整理，也歡迎再與我聯繫。\n\n${easonSignature}`;
}
function emailSubjectForTemplate(templateType="A"){
  const t=templateType==="auto"?"A":templateType;
  return templateSubjects[t] || templateSubjects.A;
}
function gmailComposeUrl({to="", subject="", body=""}){
  return "https://mail.google.com/mail/?view=cm&fs=1"+
    `&to=${encodeURIComponent(to||"")}`+
    `&su=${encodeURIComponent(subject||"")}`+
    `&body=${encodeURIComponent(body||"")}`;
}
async function copyText(text=""){
  try{
    if(navigator?.clipboard?.writeText){ await navigator.clipboard.writeText(text); return true; }
  }catch(e){}
  const area=document.createElement("textarea");
  area.value=text;
  document.body.appendChild(area);
  area.select();
  const ok=document.execCommand("copy");
  area.remove();
  return ok;
}

const pasteTemplate = `單位名稱	類型	Email	客戶方案	可能需求	預計聯絡日	優先度	來源	備註
RE-THINK 重新思考	環境教育	service@rethinktw.org	小方案｜LINE 官方帳號整理｜學生價 NT$ 5,000–10,000	課程申請、FAQ、表單流程、LINE 查詢入口	2026-05-28	高	公開聯絡信箱	第一波已寄出
範例小店	餐飲/夜市	hello@example.com	小方案｜小店 / 餐飲資訊頁｜學生價 NT$ 6,000–12,000	菜單、營業時間、Google 地圖、LINE/IG 聯絡入口	2026-05-30	中	IG / 官網	小店餐飲版範例
範例個人品牌	個人品牌/自由工作者	hello@example.com	小方案｜個人品牌 / 服務預約頁｜學生價 NT$ 8,000–18,000	服務介紹、作品集、預約表單、LINE/IG 聯絡入口	2026-05-30	中	IG / 官網	個人品牌版範例`;

const prepPasteTemplate = `準備事項	安排日期	準備內容	下一步	備註
今日準備｜檢查 CRM 是否正常	2026-05-25	測試新增名單、準備事項、達成、未達成延到明天、批量貼上功能	建議於 2026-05-25 完成	先確認系統功能正常`;

function today(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function monthStr(date=today()){ return date.slice(0,7); }
function addMonths(m, delta){
  const [y,mo] = m.split("-").map(Number);
  const d = new Date(y, mo-1+delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function addDays(date, days){
  if(!date) return "";
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate()+days);
  return fmt(d);
}
function isWeekend(d){
  const day = d.getDay();
  return day === 0 || day === 6;
}
function addBusinessDays(date, days){
  if(!date) return "";
  const d = new Date(`${date}T00:00:00`);
  let added = 0;
  while(added < days){
    d.setDate(d.getDate()+1);
    if(!isWeekend(d)) added += 1;
  }
  return fmt(d);
}
function nextFollowUpDate(date){ return addBusinessDays(date, FOLLOW_UP_DAYS); }
function internalDiscussionDate(date=today()){ return addDays(date, INTERNAL_DISCUSSION_DAYS); }
function fmt(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function monthTitle(m){ const [y,mo]=m.split("-"); return `${y} 年 ${Number(mo)} 月`; }
function dateLabel(date){
  const d = new Date(`${date}T00:00:00`);
  if(Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("zh-TW",{month:"2-digit",day:"2-digit",weekday:"short"});
}
function monthDays(m){
  const [y,mo]=m.split("-").map(Number);
  const n = new Date(y, mo, 0).getDate();
  return Array.from({length:n},(_,i)=>`${m}-${String(i+1).padStart(2,"0")}`);
}
function money(v){
  const n = Number(String(v||"").replace(/[^0-9.-]/g,""));
  return n ? `NT$ ${n.toLocaleString()}` : "NT$ 0";
}

function toNumber(v){
  return Number(String(v||"").replace(/[^0-9.-]/g,"")||0);
}
function csvEscape(v){
  const s = String(v || "").replace(/"/g, "\"\"");
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

function normalizeLeadName(v){
  return String(v||"")
    .trim()
    .replace(/\s+/g," ")
    .replace(/[（）()【】\[\]「」『』]/g,"")
    .toLowerCase();
}
function leadIdentityKey(l={}){
  const name=normalizeLeadName(l.name);
  const email=String(l.email||"").trim().toLowerCase();
  return name || email || `__id__${l.id||crypto.randomUUID()}`;
}
function latestLeadDate(l={}){
  return [l.actualFollowUpDate,l.sentDate,l.followUpDate,l.plannedContactDate,l.workDate,l.deliveryDate,l.completedDate]
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}
function uniqueLeadsByName(items=[]){
  const map=new Map();
  for(const item of items){
    const key=leadIdentityKey(item);
    const prev=map.get(key);
    if(!prev || latestLeadDate(item)>latestLeadDate(prev)){
      map.set(key,item);
    }
  }
  return Array.from(map.values());
}

function uniqueRepliedLeads(items=[]){
  return uniqueLeadsByName(items);
}
function isRepliedLead(l={}){
  return ["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","需求確認中","已約討論","洽談中","已報價","談合約","進行中","成交","無需求","內部無需求但可能有實習機會","未成交"].includes(l.status);
}
function isEffectiveOpportunity(l={}){
  return ["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","需求確認中","已約討論","洽談中","已報價","談合約","進行中","內部無需求但可能有實習機會"].includes(l.status);
}
function isRejectedOrNoNeed(l={}){
  return ["無需求","內部無需求但可能有實習機會","未成交"].includes(l.status);
}
function replyCategory(l={}){
  if(["無需求"].includes(l.status)) return "無需求";
  if(["內部無需求但可能有實習機會"].includes(l.status)) return "無需求但可能有實習機會";
  if(["未成交"].includes(l.status)) return "未成交";
  if(isEffectiveOpportunity(l)) return "有效案源";
  return "其他回覆";
}

function normalizeDate(v){
  const raw=String(v||"").trim();
  if(!raw) return "";
  const cleaned=raw.replace(/[\/.]/g,"-");
  let m=cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(m) return `${m[1]}-${String(Number(m[2])).padStart(2,"0")}-${String(Number(m[3])).padStart(2,"0")}`;
  m=cleaned.match(/^(\d{1,2})-(\d{1,2})$/);
  if(m){
    const y=new Date().getFullYear();
    return `${y}-${String(Number(m[1])).padStart(2,"0")}-${String(Number(m[2])).padStart(2,"0")}`;
  }
  return raw;
}
function firstScheduleDate(item){
  return item?.plannedContactDate || item?.followUpDate || item?.sentDate || item?.actualFollowUpDate || item?.workDate || item?.deliveryDate || today();
}

function inferFocusFit(l={}){
  const text=[l.name,l.type,l.need,l.projectPlan,l.notes].join(" ");
  if(/營隊|活動|課程|補習|夏令營|親子|推廣教育|工作坊/.test(text)) return "活動 / 課程 / 營隊";
  if(/公益|社福|協會|基金會|救傷|社會福利|非營利/.test(text)) return "公益 / 協會 / 社福";
  if(/論壇|研討會|講座|年會|峰會/.test(text)) return "論壇 / 研討會";
  if(/地方創生|市集|攤商|社區營造|文創/.test(text)) return "地方創生 / 市集";
  if(/據點|地圖|定位|多據點|服務點|救傷中心/.test(text)) return "多據點服務";
  if(/小店|餐飲|咖啡|美甲|美睫|個人品牌|品牌|餐廳|夜市|書屋/.test(text)) return "小店 / 個人品牌";
  return "其他";
}
function inferLeadQuality(l={}){
  if(["已放棄"].includes(l.status)) return "D｜不符合主線 / 放棄";
  if(["無需求","未成交","無回覆暫放"].includes(l.status)) return "C｜小方案 / 低優先";
  const focus=inferFocusFit(l);
  const text=[l.name,l.type,l.need,l.projectPlan,l.notes].join(" ");
  if(/完整系統|標準查詢|進階系統|CRM|後台|Dashboard|資料管理|LINE Bot|據點|名單管理|成果統計/.test(text) && !/小店|餐飲|美甲|個人品牌/.test(text)) return "A｜中型系統高機會";
  if(["活動 / 課程 / 營隊","公益 / 協會 / 社福","論壇 / 研討會","多據點服務"].includes(focus)) return "A｜中型系統高機會";
  if(["地方創生 / 市集"].includes(focus)) return "B｜可能有流程需求";
  if(["小店 / 個人品牌"].includes(focus)) return "C｜小方案 / 低優先";
  return "B｜可能有流程需求";
}
function getLeadQuality(l){ return l?.leadQuality || inferLeadQuality(l); }
function getFocusFit(l){ return l?.focusFit || inferFocusFit(l); }
function qualityBadgeClass(q=""){
  if(q.startsWith("A")) return "bg-emerald-100 text-emerald-700";
  if(q.startsWith("B")) return "bg-blue-100 text-blue-700";
  if(q.startsWith("C")) return "bg-amber-100 text-amber-700";
  if(q.startsWith("D")) return "bg-slate-200 text-slate-600";
  return "bg-slate-100 text-slate-500";
}

function emptyLead(date=""){
  return {id:crypto.randomUUID(), name:"", type:"其他", email:"", contact:"", source:"", status:"未聯絡", plannedContactDate:date, sentDate:"", followUpDate:"", actualFollowUpDate:"", projectPlan:"", estimatedAmount:"", receivedAmount:"", expectedClose:"", workDate:"", workTask:"", deliveryDate:"", deliveryNote:"", leadQuality:"", focusFit:"", need:"", lastReply:"", nextAction:"", notes:"", completed:false, completedDate:"", completedDates:{}};
}
function prep(date=today()){
  return {...emptyLead(""), name:"準備事項", type:"準備事項", source:"內部準備事項", status:"準備事項", followUpDate:date};
}
function isPrepItem(l){
  return l?.type === "準備事項" || l?.status === "準備事項" || l?.source === "內部準備事項" || String(l?.name||"").includes("準備");
}
function hasEstimatedRevenue(l){
  return toNumber(l?.estimatedAmount)>0;
}
function isCompletedOn(l, date){
  return Boolean(l?.completedDates?.[date] || (l?.completed && l?.completedDate === date));
}

function shouldShowOnDailyBoard(l, date){
  if(!l || !date) return false;

  // 準備事項可以保留：當天完成後讓你看得到剛剛做完。
  if(isPrepItem(l)){
    if(isCompletedOn(l, date)) return true;
    return l.followUpDate===date || l.workDate===date || l.deliveryDate===date || l.plannedContactDate===date;
  }

  // 有回覆 / 已加 LINE / 洽談 / 無需求 / 未成交，就不要再留在上方待辦。
  if(isRepliedLead(l)) return false;

  // 當天剛完成的聯絡 / 寄信 / 補追要留著，讓你知道剛剛做完哪些。
  if(isCompletedOn(l, date)){
    return l.plannedContactDate===date || l.sentDate===date || l.followUpDate===date || l.actualFollowUpDate===date;
  }

  // 已補追過或已追蹤一次的舊項目，不再卡在未來待辦。
  if(l.actualFollowUpDate || l.status === "已追蹤一次") return false;

  if(l.status === "未聯絡") return l.plannedContactDate === date;
  if(l.status === "已寄信") return l.followUpDate === date;

  return false;
}


function isPastDate(date, base=today()){
  return Boolean(date && date < base);
}
function autoMoveUnfinishedOverdueItems(items=[], base=today()){
  let changed = false;
  const next = items.map(item=>{
    if(!item) return item;
    const updated = {...item};

    const moveFieldIfOverdue = (field)=>{
      const due = updated[field];
      if(due && isPastDate(due, base) && !isCompletedOn(updated, due)){
        updated[field] = base;
        changed = true;
      }
    };

    if(isPrepItem(updated)){
      moveFieldIfOverdue("followUpDate");
      moveFieldIfOverdue("plannedContactDate");
      moveFieldIfOverdue("workDate");
      moveFieldIfOverdue("deliveryDate");
      return updated;
    }

    // 已有回覆、狀態推進、已補追過的客戶，不自動塞回待辦。
    if(isRepliedLead(updated) || updated.actualFollowUpDate || updated.status === "已追蹤一次") return updated;

    if(updated.status === "未聯絡") moveFieldIfOverdue("plannedContactDate");
    if(updated.status === "已寄信") moveFieldIfOverdue("followUpDate");

    // 進行中工作 / 交付日仍可自動移到今天，避免專案待辦漏掉。
    moveFieldIfOverdue("workDate");
    moveFieldIfOverdue("deliveryDate");

    return updated;
  });
  return {changed,next};
}
const initialLeads = [
  {...emptyLead(), name:"RE-THINK 重新思考", type:"環境教育", email:"service@rethinktw.org", source:"公開聯絡信箱", status:"已寄信", need:"課程申請、FAQ、表單流程、LINE 查詢入口", nextAction:"3–5 天後視情況追蹤", notes:"第一波已寄出。"},
  {...emptyLead(), name:"台灣環境教育協會", type:"環境教育", email:"nkcu2019@gmail.com", source:"公開聯絡信箱", status:"已寄信", need:"環境教育課程、活動資訊、FAQ、LINE 官方帳號流程", nextAction:"3–5 天後視情況追蹤", notes:"第一波已寄出。"},
  {...emptyLead(), name:"中華民國環境教育學會", type:"環境教育", email:"csee1993@gmail.com", source:"公開聯絡信箱", status:"已寄信", need:"研習活動、報名資訊、FAQ、成果紀錄", nextAction:"3–5 天後視情況追蹤", notes:"第一波已寄出。"},
  {...emptyLead(), name:"台灣社區營造學會", type:"社區營造", email:"cesroc@cesroc.tw", source:"公開聯絡信箱", status:"已寄信", need:"活動/工作坊報名、社區資料查詢、成果數據整理", nextAction:"3–5 天後視情況追蹤", notes:"第一波已寄出。"},
  {...emptyLead(), name:"野灣野生動物保育協會", type:"公益/社福", email:"sway.wang@wildonetaiwan.org", contact:"王時瑋", source:"對方主動來信 / 既有合作案", status:"談合約", projectPlan:"完整系統｜標準查詢版｜NT$ 50,000–90,000 起", estimatedAmount:"50000", expectedClose:"簽約後約 2 個月", need:"LINE Bot、民眾上傳位置、最近救傷中心判斷、野生動物救傷知識推廣、後台資料管理、基礎統計、網站/粉專資訊整合", lastReply:"目前等待合約確認。", nextAction:"等待合約；合約收到後檢查功能範圍、付款節點、驗收標準、UI/素材、主機費與維護條款。", notes:"對方看到公廁自動回覆帳號後主動來信，第一個正式商業案例。"}
];

function Input({label,value,onChange,type="text",placeholder=""}){
  return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><input type={type} value={value||""} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
}
function SelectBox({label,value,options,onChange}){
  return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><select value={value||""} onChange={e=>onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">{options.map(o=><option key={o} value={o}>{o||"未設定"}</option>)}</select></label>
}
function SelectCustom({label,value,options,onChange,placeholder=""}){
  const preset = options.includes(value);
  const [custom,setCustom]=useState(value && !preset);
  return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><div className="mt-2 grid gap-2"><select value={custom?"__custom__":(value||"")} onChange={e=>{ if(e.target.value==="__custom__"){setCustom(true); onChange("");} else {setCustom(false); onChange(e.target.value);} }} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">{options.map(o=><option key={o} value={o}>{o||"未設定"}</option>)}<option value="__custom__">自訂輸入</option></select>{custom&&<input value={value||""} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/>}</div></label>
}
function PresetArea({label,value,options,onChange}){
  return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><select value="" onChange={e=>e.target.value&&onChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option value="">選擇常用內容快速帶入</option>{options.map(o=><option key={o} value={o}>{o}</option>)}</select><textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
}
function Area({label,value,onChange}){
  return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><textarea value={value||""} onChange={e=>onChange(e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
}
function Modal({children,onClose}){
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur"><div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="mb-6 flex justify-end"><button onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5"/></button></div>{children}</div></div>
}
function LeadForm({lead,onSave,onCancel}){
  const [f,setF]=useState(lead||emptyLead());
  const u=(k,v)=>setF(p=>({...p,[k]:v}));
  const handleSentDateChange=(v)=>setF(p=>({
    ...p,
    sentDate:v,
    followUpDate:"",
    status:v&&p.status==="未聯絡"?"已寄信":p.status,
    nextAction:v?"3 個工作日後檢查是否回覆，若無回覆再決定是否寄短版追蹤。":p.nextAction
  }));
  const handleActualFollowUpDateChange=(v)=>setF(p=>({
    ...p,
    actualFollowUpDate:v,
    followUpDate:"",
    status:v && ["未聯絡","已寄信"].includes(p.status)?"已追蹤一次":p.status,
    nextAction:v?`已於 ${v} 補寄 / 追蹤；後續等回覆，暫不安排下一次追蹤。`:p.nextAction
  }));
  const handleStatusChange=(v)=>setF(p=>{
    const now = today();
    if(v==="已寄信"){
      const sentDate = p.sentDate || now;
      return {...p,status:v,sentDate,followUpDate:nextFollowUpDate(sentDate),nextAction:"3 個工作日後檢查是否回覆，若無回覆再決定是否寄短版追蹤。"};
    }
    if(v==="已追蹤一次"){
      const actualFollowUpDate = p.actualFollowUpDate || now;
      return {...p,status:v,actualFollowUpDate,followUpDate:"",nextAction:`已於 ${actualFollowUpDate} 補寄 / 追蹤；後續等回覆，暫不安排下一次追蹤。`};
    }
    if(v==="願意交流"){
      return {...p,status:v,followUpDate:"",nextAction:"對方願意交流或提供具體回饋，先補充背景與案例，後續視對方回覆再推進。"};
    }
    if(v==="後續回信中"){
      return {...p,status:v,nextAction:"已開始後續回信，等待對方下一步回覆。"};
    }
    if(v==="已加 LINE"){
      return {...p,status:v,nextAction:"已加 LINE，改在 LINE 上持續聯繫。"};
    }
    if(v==="LINE 洽談中"){
      return {...p,status:v,nextAction:"已轉到 LINE 洽談，等待對方提供需求或回覆。"};
    }
    if(v==="內部討論中"){
      return {...p,status:v,followUpDate:internalDiscussionDate(now),nextAction:`對方表示內部討論，先不打擾；${internalDiscussionDate(now)} 再檢查是否需要短版追蹤。`};
    }
    if(v==="內部無需求但可能有實習機會"){
      return {...p,status:v,leadQuality:p.leadQuality||"C｜小方案 / 低優先",followUpDate:"",nextAction:"內部暫無合作需求，但可能有實習機會；之後可整理履歷 / 作品集再聯繫。"};
    }
    if(v==="無需求"){
      return {...p,status:v,followUpDate:"",nextAction:"對方已回覆目前暫無需求，不再主動追蹤；之後若有新需求再聯繫。"};
    }
    if(v==="未成交"){
      return {...p,status:v,followUpDate:"",nextAction:"對方已回覆但未成交，先結案不再追蹤。"};
    }
    if(v==="已放棄"){
      return {...p,status:v,followUpDate:"",nextAction:"非目前主攻方向或不適合開發，主動暫停追蹤。"};
    }
    return {...p,status:v};
  });
  return <Modal onClose={onCancel}><div><p className="text-sm font-semibold text-blue-600">Lead Editor</p><h2 className="mt-1 text-2xl font-bold text-slate-950">編輯項目</h2></div><div className="mt-6 grid gap-4 md:grid-cols-2">
    <Input label="單位 / 項目名稱" value={f.name} onChange={v=>u("name",v)}/>
    <Input label="Email" value={f.email} onChange={v=>u("email",v)}/>
    <SelectBox label="類型" value={f.type} options={typeOptions} onChange={v=>u("type",v)}/>
    <SelectBox label="狀態" value={f.status} options={statusOptions} onChange={handleStatusChange}/>
    <SelectBox label="名單品質" value={f.leadQuality || inferLeadQuality(f)} options={leadQualityOptions} onChange={v=>u("leadQuality",v)}/>
    <SelectBox label="主線匹配度" value={f.focusFit || inferFocusFit(f)} options={focusFitOptions} onChange={v=>u("focusFit",v)}/>
    <Input label="聯絡人 / 窗口" value={f.contact} onChange={v=>u("contact",v)}/>
    <SelectCustom label="來源 / 公開頁面" value={f.source} options={sourceOptions} onChange={v=>u("source",v)}/>
    <SelectCustom label="客戶方案（依接案介面）" value={f.projectPlan} options={planOptions} onChange={v=>u("projectPlan",v)} placeholder="例如：標準查詢版 / 小方案 / 維護方案"/>
    <Input label="預計聯絡日期" type="date" value={f.plannedContactDate} onChange={v=>u("plannedContactDate",v)}/>
    <Input label="實際寄出 / 私訊日期" type="date" value={f.sentDate} onChange={handleSentDateChange}/>
    <Input label="下一次追蹤日（系統統一用「實際寄出 / 實際補追日期」+3 個工作日，假日不算，可手動修改）" type="date" value={f.followUpDate} onChange={v=>u("followUpDate",v)}/>
    <Input label="補寄 / 追蹤日期（實際已追蹤；填入後會清空下一次追蹤日）" type="date" value={f.actualFollowUpDate} onChange={handleActualFollowUpDateChange}/>
    <SelectCustom label="預計收益" value={f.estimatedAmount} options={amountOptions} onChange={v=>u("estimatedAmount",v)} placeholder="例如 50000"/>
    <SelectCustom label="實際已收款" value={f.receivedAmount} options={amountOptions} onChange={v=>u("receivedAmount",v)} placeholder="例如 25000"/>
    <SelectCustom label="預計開發時程" value={f.expectedClose} options={timeOptions} onChange={v=>u("expectedClose",v)}/>
    <Input label="進行中｜下一個工作日期" type="date" value={f.workDate} onChange={v=>u("workDate",v)}/>
    <Input label="進行中｜那天要做什麼" value={f.workTask} onChange={v=>u("workTask",v)} placeholder="例如：交第一版畫面、整理報價、確認合約、測試 LINE Bot"/>
    <Input label="交付 / 截止日期" type="date" value={f.deliveryDate} onChange={v=>u("deliveryDate",v)}/>
    <Input label="交付內容 / 截止事項" value={f.deliveryNote} onChange={v=>u("deliveryNote",v)} placeholder="例如：交付 MVP、完成後台、給客戶測試版"/>
    <PresetArea label="可能需求 / 準備內容" value={f.need} options={needOptions} onChange={v=>u("need",v)}/>
    <PresetArea label="回覆內容 / 對方反應" value={f.lastReply} options={replyOptions} onChange={v=>u("lastReply",v)}/>
    <PresetArea label="下一步" value={f.nextAction} options={nextOptions} onChange={v=>u("nextAction",v)}/>
    <Area label="備註" value={f.notes} onChange={v=>u("notes",v)}/>
  </div><div className="mt-6 flex justify-end gap-3"><button onClick={onCancel} className="rounded-2xl border border-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-100">取消</button><button onClick={()=>onSave(f)} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">儲存</button></div></Modal>
}
function BulkImport({onImport,onClose}){
  const [mode,setMode]=useState("lead");
  const [text,setText]=useState(pasteTemplate);
  const switchMode=(m)=>{ setMode(m); setText(m==="lead"?pasteTemplate:prepPasteTemplate); };
  return <Modal onClose={onClose}>
    <p className="text-sm font-semibold text-blue-600">Bulk Import</p>
    <h2 className="mt-1 text-2xl font-bold text-slate-950">批量貼上</h2>
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={()=>switchMode("lead")} className={`rounded-2xl border px-5 py-3 text-sm font-semibold ${mode==="lead"?"border-blue-500 bg-blue-50 text-blue-700":"border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>貼上名單</button>
      <button onClick={()=>switchMode("prep")} className={`rounded-2xl border px-5 py-3 text-sm font-semibold ${mode==="prep"?"border-slate-500 bg-slate-100 text-slate-800":"border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>貼上準備事項</button>
    </div>
    <p className="mt-3 text-sm text-slate-600">欄位用 Tab 分隔，可從 Google Sheet / Excel 複製貼上。現在名單與準備事項會分開匯入，不會混在一起。</p>
    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
      {mode==="lead"?"名單欄位：單位名稱、類型、Email、客戶方案、可能需求、預計聯絡日、優先度、來源、備註。":"準備事項欄位：準備事項、安排日期、準備內容、下一步、備註。"}
    </div>
    <textarea value={text} onChange={e=>setText(e.target.value)} rows={16} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm outline-none focus:border-blue-400"/>
    <div className="mt-6 flex justify-end gap-3">
      <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3">取消</button>
      <button onClick={()=>onImport(text,mode)} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white">{mode==="lead"?"匯入名單":"匯入準備事項"}</button>
    </div>
  </Modal>
}

function EmailDraftModal({lead, queuePosition=0, queueTotal=0, onClose, onMarkScheduled, onNext}){
  const detected = detectTemplateType(lead||{});
  const [template,setTemplate]=useState(detected);
  const [subject,setSubject]=useState(emailSubjectForTemplate(detected));
  const [body,setBody]=useState(buildOutreachEmailBody(lead||{}, detected));
  const [scheduleDate,setScheduleDate]=useState(lead?.sentDate || lead?.plannedContactDate || today());
  const [scheduleTime,setScheduleTime]=useState("09:10");
  const [notice,setNotice]=useState("");

  useEffect(()=>{
    const next=detectTemplateType(lead||{});
    setTemplate(next);
    setSubject(emailSubjectForTemplate(next));
    setBody(buildOutreachEmailBody(lead||{}, next));
    setScheduleDate(lead?.sentDate || lead?.plannedContactDate || today());
    setScheduleTime("09:10");
    setNotice("");
  },[lead?.id]);

  if(!lead) return null;
  const changeTemplate=(v)=>{
    const next=v==="auto"?detectTemplateType(lead):v;
    setTemplate(next);
    setSubject(emailSubjectForTemplate(next));
    setBody(buildOutreachEmailBody(lead, next));
  };
  const openFull=()=>{
    if(!lead.email) return alert("這筆名單沒有 Email，不能開 Gmail。");
    window.open(gmailComposeUrl({to:lead.email, subject, body}), "_blank", "noopener,noreferrer");
    setNotice("已開啟 Gmail 撰寫視窗。請確認內容後，手動使用 Gmail 的『排程傳送』。");
  };
  const openSafe=async()=>{
    if(!lead.email) return alert("這筆名單沒有 Email，不能開 Gmail。");
    await copyText(body);
    window.open(gmailComposeUrl({to:lead.email, subject, body:""}), "_blank", "noopener,noreferrer");
    setNotice("已開啟 Gmail 並複製內文。若 Gmail 沒有帶入完整內文，直接 Ctrl+V 貼上。");
  };
  const copyBodyOnly=async()=>{
    const ok=await copyText(body);
    setNotice(ok?"已複製內文。":"複製失敗，請手動全選內文複製。");
  };
  const mark=()=>{
    if(!scheduleDate) return alert("請先設定實際排程寄出日期。");
    onMarkScheduled(lead.id, scheduleDate, scheduleTime);
    if(queueTotal>1 && queuePosition < queueTotal-1){
      setNotice(`已標記為 Gmail 排程：${scheduleDate} ${scheduleTime}，並已自動計算追蹤日。即將跳到下一筆…`);
      setTimeout(()=>onNext?.(), 1200);
    }else{
      setNotice(`已標記為 Gmail 排程：${scheduleDate} ${scheduleTime}，並已自動計算追蹤日。即將關閉…`);
      setTimeout(()=>onClose?.(), 1500);
    }
  };
  return <Modal onClose={onClose}>
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-semibold text-blue-600">Outreach Assistant</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">寄信助手</h2>
        <p className="mt-2 text-sm text-slate-500">{queueTotal>1?`批次第 ${queuePosition+1} / ${queueTotal} 筆｜`:""}{lead.name||"未命名單位"}・{lead.email||"尚未填 Email"}</p>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        半自動版只會幫你填好 Gmail。是否真的排程成功，仍以 Gmail 畫面為準；按「標記已排程」只是更新 CRM。
      </div>
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <label className="block"><span className="text-sm font-medium text-slate-700">模板</span><select value={template} onChange={e=>changeTemplate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">{outreachTemplateOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
      <label className="block"><span className="text-sm font-medium text-slate-700">收件人</span><input value={lead.email||""} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"/></label>
      <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-700">主旨</span><input value={subject} onChange={e=>setSubject(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
      <label className="block"><span className="text-sm font-medium text-slate-700">Gmail 排程寄出日期</span><input type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
      <label className="block"><span className="text-sm font-medium text-slate-700">建議排程時間</span><input type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
      <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-700">內文，可先編輯再開 Gmail</span><textarea value={body} onChange={e=>setBody(e.target.value)} rows={18} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-blue-400"/></label>
    </div>

    {notice&&<div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>}

    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button onClick={copyBodyOnly} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">複製內文</button>
      <button onClick={openSafe} className="rounded-2xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50">安全開 Gmail＋複製內文</button>
      <button onClick={openFull} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">完整開 Gmail</button>
      <button onClick={mark} className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">標記已排程</button>
      {queueTotal>1&&<button onClick={onNext} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">下一筆</button>}
      <button onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">關閉</button>
    </div>
  </Modal>
}

function Stat({icon:Icon,label,value,onClick,active=false}){
  const clickable = typeof onClick === "function";
  const Tag = clickable ? "button" : "div";
  return <Tag onClick={onClick} className={`w-full rounded-3xl border bg-white p-5 text-left shadow-sm transition ${active?"border-blue-500 ring-2 ring-blue-100":"border-slate-200"} ${clickable?"cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md":""}`}><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50"><Icon className="h-5 w-5 text-blue-600"/></div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>{clickable&&<p className="mt-3 text-xs font-semibold text-blue-600">點一下查看名單</p>}</Tag>
}

export default function App(){
  const [leads,setLeads]=useState(()=>{
    try{
      const saved=localStorage.getItem(STORAGE_KEY);
      if(saved) return JSON.parse(saved);
      for(const k of OLD_KEYS){
        const s=localStorage.getItem(k);
        if(s){ const p=JSON.parse(s); localStorage.setItem(STORAGE_KEY,JSON.stringify(p)); return p; }
      }
      return initialLeads;
    }catch{return initialLeads}
  });
  const [cloudReady,setCloudReady]=useState(!supabase);
  const [cloudStatus,setCloudStatus]=useState(supabase?"連線準備中":"未連接雲端");
  const [cloudMessage,setCloudMessage]=useState(supabase?"正在讀取 Supabase 雲端資料…":"尚未設定 Supabase 環境變數，暫時只使用本機備份。設定後才會啟用雲端同步。");
  const [cloudLastSavedAt,setCloudLastSavedAt]=useState("");
  const [cloudSaving,setCloudSaving]=useState(false);
  const cloudSaveTimerRef=useRef(null);
  const cloudLoadingRef=useRef(false);
  const [query,setQuery]=useState("");
  const [searchInput,setSearchInput]=useState("");
  const [status,setStatus]=useState("全部");
  const [type,setType]=useState("全部");
  const [quality,setQuality]=useState("全部");
  const [focusFit,setFocusFit]=useState("全部");
  const [editing,setEditing]=useState(null);
  const [draft,setDraft]=useState(null);
  const [bulk,setBulk]=useState(false);
  const [showLeadsAll,setShowLeadsAll]=useState(false);
  const [showPrepAll,setShowPrepAll]=useState(false);
  const [showQuotedPlans,setShowQuotedPlans]=useState(false);
  const [activeStatKey,setActiveStatKey]=useState("");
  const [history,setHistory]=useState([]);
  const [lastAction,setLastAction]=useState("");
  const [lastImport,setLastImport]=useState(null);
  const [emailHelper,setEmailHelper]=useState(null);
  const [selected,setSelected]=useState([]);
  const [bulkDate,setBulkDate]=useState("");
  const [bulkFollowUpDate,setBulkFollowUpDate]=useState("");
  const [bulkStatusValue,setBulkStatusValue]=useState("");
  const [calMonth,setCalMonth]=useState(monthStr());
  const [activeDate,setActiveDate]=useState(today());
  const [hideCompleted,setHideCompleted]=useState(true);
  const calendarScrollRef = useRef(null);

  const applySearch = () => {
    setQuery(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setQuery("");
    setStatus("全部");
    setType("全部");
    setQuality("全部");
    setFocusFit("全部");
  };

  const scrollToCalendarDate = (date=today(), behavior="smooth") => {
    setTimeout(() => {
      const target = calendarScrollRef.current?.querySelector(`[data-calendar-date="${date}"]`);
      target?.scrollIntoView({ behavior, inline: "center", block: "nearest" });
    }, 0);
  };

  const goToday = () => {
    const td = today();
    setCalMonth(monthStr(td));
    setActiveDate(td);
    scrollToCalendarDate(td);
  };

  const commitLeads=(updater,label="資料變更")=>{
    setLeads(cur=>{
      const next=typeof updater==="function"?updater(cur):updater;
      setHistory(h=>[...h.slice(-9),{leads:cur,label,time:new Date().toLocaleTimeString("zh-TW",{hour:"2-digit",minute:"2-digit"})}]);
      setLastAction(label);
      return next;
    });
  };
  const undoLast=()=>{
    setHistory(h=>{
      if(!h.length) return h;
      const last=h[h.length-1];
      setLeads(last.leads);
      setLastAction(`已復原：${last.label}`);
      setSelected([]);
      setLastImport(null);
      return h.slice(0,-1);
    });
  };
  const focusDate=(date)=>{
    if(!date) return;
    setCalMonth(monthStr(date));
    setActiveDate(date);
    scrollToCalendarDate(date);
  };
  const viewImportedBatch=(batch=lastImport)=>{
    if(!batch?.ids?.length) return;
    const first=leads.find(l=>batch.ids.includes(l.id));
    const d=firstScheduleDate(first);
    setSelected(batch.ids);
    setShowLeadsAll(true);
    setShowPrepAll(true);
    focusDate(d);
  };
  const deleteImportedBatch=(batch=lastImport)=>{
    if(!batch?.ids?.length) return alert("目前沒有可刪除的最近匯入批次。");
    if(!confirm(`確定刪除最近匯入的 ${batch.count} 筆資料嗎？`)) return;
    commitLeads(cur=>cur.filter(x=>!batch.ids.includes(x.id)),`刪除最近匯入 ${batch.count} 筆`);
    setSelected([]);
    setLastImport(null);
  };

  useEffect(()=>{
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify(leads));
    }catch(err){
      console.error("Local backup failed", err);
    }
  },[leads]);

  useEffect(()=>{
    if(!supabase){
      setCloudReady(true);
      return;
    }
    let cancelled=false;
    async function loadCloudState(){
      cloudLoadingRef.current=true;
      setCloudStatus("雲端讀取中");
      setCloudMessage("正在從 Supabase 讀取 CRM 資料…");
      try{
        const {data,error}=await supabase
          .from("crm_state")
          .select("id, leads, updated_at")
          .eq("id", SUPABASE_STATE_ID)
          .maybeSingle();
        if(error) throw error;
        if(cancelled) return;
        if(data?.leads && Array.isArray(data.leads)){
          setLeads(data.leads);
          setCloudStatus("雲端已連線");
          setCloudMessage(`已載入 Supabase 雲端資料，共 ${data.leads.length} 筆。`);
          setCloudLastSavedAt(data.updated_at ? new Date(data.updated_at).toLocaleString("zh-TW") : "");
        }else{
          const {error:upsertError}=await supabase
            .from("crm_state")
            .upsert({id:SUPABASE_STATE_ID, leads, updated_at:new Date().toISOString()},{onConflict:"id"});
          if(upsertError) throw upsertError;
          setCloudStatus("雲端已建立");
          setCloudMessage(`Supabase 尚無資料，已用目前本機資料建立雲端版本，共 ${leads.length} 筆。`);
          setCloudLastSavedAt(new Date().toLocaleString("zh-TW"));
        }
      }catch(err){
        console.error("Cloud load failed", err);
        if(!cancelled){
          setCloudStatus("雲端錯誤");
          setCloudMessage(`讀取 Supabase 失敗：${err.message || String(err)}。目前畫面仍會使用本機備份，先不要大量改資料。`);
        }
      }finally{
        cloudLoadingRef.current=false;
        if(!cancelled) setCloudReady(true);
      }
    }
    loadCloudState();
    return ()=>{cancelled=true;};
    // 初次載入雲端資料，只跑一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    if(!supabase || !cloudReady || cloudLoadingRef.current) return;
    if(cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
    setCloudSaving(true);
    setCloudStatus("雲端同步中");
    cloudSaveTimerRef.current=setTimeout(async()=>{
      try{
        const savedAt=new Date().toISOString();
        const {error}=await supabase
          .from("crm_state")
          .upsert({id:SUPABASE_STATE_ID, leads, updated_at:savedAt},{onConflict:"id"});
        if(error) throw error;
        setCloudStatus("雲端已同步");
        setCloudMessage(`已同步到 Supabase，共 ${leads.length} 筆。`);
        setCloudLastSavedAt(new Date(savedAt).toLocaleString("zh-TW"));
      }catch(err){
        console.error("Cloud save failed", err);
        setCloudStatus("雲端儲存失敗");
        setCloudMessage(`儲存到 Supabase 失敗：${err.message || String(err)}。本機備份仍會保留，但請先不要關閉視窗。`);
      }finally{
        setCloudSaving(false);
      }
    },700);
    return ()=>{
      if(cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
    };
  },[leads,cloudReady]);

  useEffect(()=>{
    if(!cloudReady) return;
    const {changed,next}=autoMoveUnfinishedOverdueItems(leads,today());
    if(changed){
      setLeads(next);
      setLastAction("已自動把逾期未完成事項移到今天");
    }
    // 雲端資料載入後跑一次，避免每天進來看到過期待辦還卡在昨天。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[cloudReady]);

  useEffect(()=>{
    if(calMonth === monthStr(today())) scrollToCalendarDate(today(), "auto");
  },[calMonth]);

  const stats=useMemo(()=>{
    const normal=leads.filter(l=>!isPrepItem(l));
    const countedLeads=normal;
    const estimatedCount=normal.filter(hasEstimatedRevenue).length;
    // 未寄：CRM 裡尚未填入「實際寄出 / 私訊日期」的客戶名單。
    const unsentCount=normal.filter(l=>!l.sentDate).length;
    // 已寄：用總客戶名單扣掉未寄，讓「客戶名單總數 = 未寄 + 已寄」。
    const sentItems=normal.filter(l=>Boolean(l.sentDate));
    const sentCount=normal.length - unsentCount;
    // 「已補追」另外統計實際補寄 / 追蹤日期。
    const actualFollowUpItems=uniqueLeadsByName(normal.filter(l=>Boolean(l.actualFollowUpDate)));
    const actualFollowUpCount=actualFollowUpItems.length;
    const contacted=normal.filter(l=>l.status!=="未聯絡").length;
    const repliedStatuses=["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","需求確認中","已約討論","洽談中","已報價","談合約","進行中","成交","無需求","內部無需求但可能有實習機會","未成交"];
    const rejectedStatuses=["無需求","內部無需求但可能有實習機會","未成交"];
    const replied=normal.filter(l=>repliedStatuses.includes(l.status)).length;
    const activeOpportunity=normal.filter(l=>["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","需求確認中","已約討論","洽談中","已報價","談合約","進行中","內部無需求但可能有實習機會"].includes(l.status)).length;
    const rejected=normal.filter(l=>rejectedStatuses.includes(l.status)).length;
    const quoted=normal.filter(l=>["已報價","洽談中","談合約","進行中","成交"].includes(l.status)).length;
    const projected=normal.reduce((s,l)=>s+toNumber(l.estimatedAmount),0);
    const actual=normal.reduce((s,l)=>s+toNumber(l.receivedAmount),0);
    return {total:countedLeads.length,unsentCount,estimatedCount,sentCount,actualFollowUpCount,contacted,replied,activeOpportunity,rejected,quoted,projected,actual};
  },[leads]);

  const statDetailData=useMemo(()=>{
    const normal=leads.filter(l=>!isPrepItem(l));
    const groups={
      unsent:{
        title:"未寄",
        description:"CRM 裡尚未填入實際寄出 / 私訊日期的客戶名單。",
        items:normal.filter(l=>!l.sentDate)
      },
      sent:{
        title:"已寄",
        description:"已填入實際寄出 / 私訊日期的客戶名單；與未寄加總會等於客戶名單總數。",
        items:normal.filter(l=>Boolean(l.sentDate))
      },
      actualFollowUp:{
        title:"已補追",
        description:"只統計不重複單位；同一單位重複建立多筆也只算一次，與第一次寄出分開計算。",
        items:uniqueLeadsByName(normal.filter(l=>Boolean(l.actualFollowUpDate)))
      },
      replied:{
        title:"有回覆",
        description:"包含對方已回覆、後續回信中、已加 LINE、LINE 洽談中、內部討論中、需求確認中、已約討論、洽談中、已報價、談合約、進行中、成交、無需求、內部無需求但可能有實習機會、未成交。",
        items:normal.filter(l=>["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","需求確認中","已約討論","洽談中","已報價","談合約","進行中","成交","無需求","內部無需求但可能有實習機會","未成交"].includes(l.status))
      },
      active:{
        title:"有效案源",
        description:"目前還有機會推進的案源：已回覆、後續回信、已加 LINE、LINE 洽談、內部討論、需求確認、已約討論、洽談、已報價、談合約、進行中，以及雖然內部無合作需求但可能有實習機會的名單。",
        items:normal.filter(l=>["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","需求確認中","已約討論","洽談中","已報價","談合約","進行中","內部無需求但可能有實習機會"].includes(l.status))
      },
      rejected:{
        title:"無需求 / 未成交",
        description:"已明確無合作需求、內部暫無需求但可能有實習機會，或已結案未成交的名單。",
        items:normal.filter(l=>["無需求","內部無需求但可能有實習機會","未成交"].includes(l.status))
      },
      estimated:{
        title:"有預計收益案源",
        description:"有填入預計收益金額的名單。",
        items:normal.filter(hasEstimatedRevenue)
      }
    };
    return Object.fromEntries(Object.entries(groups).map(([key,group])=>[key,{
      ...group,
      items:[...group.items].sort((a,b)=>toNumber(b.estimatedAmount)-toNumber(a.estimatedAmount)||(statusRank[a.status]??999)-(statusRank[b.status]??999))
    }]));
  },[leads]);

  const activeStatDetail=activeStatKey?statDetailData[activeStatKey]:null;

  const filteredLeads=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return leads.filter(l=>{
      if(isPrepItem(l)) return false;
      const mq=!q||[l.name,l.email,l.type,getLeadQuality(l),getFocusFit(l),l.projectPlan,l.need,l.notes,l.lastReply,l.nextAction,l.actualFollowUpDate].join(" ").toLowerCase().includes(q);
      return mq && (status==="全部"||l.status===status) && (type==="全部"||l.type===type) && (quality==="全部"||getLeadQuality(l)===quality) && (focusFit==="全部"||getFocusFit(l)===focusFit);
    }).sort((a,b)=>{
      const sc=(statusRank[a.status]??999)-(statusRank[b.status]??999);
      if(sc) return sc;
      return (a.plannedContactDate||a.sentDate||a.followUpDate||"9999-12-31").localeCompare(b.plannedContactDate||b.sentDate||b.followUpDate||"9999-12-31");
    });
  },[leads,query,status,type,quality,focusFit]);

  const filteredPreps=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return leads.filter(l=>{
      if(!isPrepItem(l)) return false;
      return !q||[l.name,l.need,l.notes,l.nextAction].join(" ").toLowerCase().includes(q);
    }).sort((a,b)=>(a.followUpDate||"9999-12-31").localeCompare(b.followUpDate||"9999-12-31"));
  },[leads,query]);

  const quotedPlanGroups=useMemo(()=>{
    const q=query.trim().toLowerCase();
    const allowedStatuses=["已報價","談合約","洽談中"];
    const quoted=leads.filter(l=>{
      if(isPrepItem(l)) return false;
      if(!allowedStatuses.includes(l.status)) return false;
      if(status!=="全部" && l.status!==status) return false;
      if(type!=="全部" && l.type!==type) return false;
      if(quality!=="全部" && getLeadQuality(l)!==quality) return false;
      if(focusFit!=="全部" && getFocusFit(l)!==focusFit) return false;
      const mq=!q||[l.name,l.email,l.type,getLeadQuality(l),getFocusFit(l),l.projectPlan,l.need,l.notes,l.lastReply,l.nextAction,l.actualFollowUpDate,l.contact].join(" ").toLowerCase().includes(q);
      return mq;
    });
    const groups={};
    for(const item of quoted){
      const key=item.projectPlan||"尚未設定方案";
      if(!groups[key]) groups[key]=[];
      groups[key].push(item);
    }
    return Object.entries(groups).map(([plan,items])=>({
      plan,
      items:items.sort((a,b)=>(b.estimatedAmount?toNumber(b.estimatedAmount):0)-(a.estimatedAmount?toNumber(a.estimatedAmount):0)),
      count:items.length,
      projected:items.reduce((sum,item)=>sum+toNumber(item.estimatedAmount),0),
      actual:items.reduce((sum,item)=>sum+toNumber(item.receivedAmount),0),
    })).sort((a,b)=>b.projected-a.projected||b.count-a.count);
  },[leads,query,status,type,quality,focusFit]);

  const quotedPlanTotal=useMemo(()=>quotedPlanGroups.reduce((sum,g)=>sum+g.count,0),[quotedPlanGroups]);

  const calDays=useMemo(()=>monthDays(calMonth),[calMonth]);
  const calendarDayItems=(date)=>leads.filter(l=>l.plannedContactDate===date||l.sentDate===date||l.followUpDate===date||l.actualFollowUpDate===date||l.workDate===date||l.deliveryDate===date).sort((a,b)=>(statusRank[a.status]??999)-(statusRank[b.status]??999));
  const dailyBoardItems=(date)=>leads.filter(l=>shouldShowOnDailyBoard(l,date)).sort((a,b)=>(statusRank[a.status]??999)-(statusRank[b.status]??999));
  const activeItemsRaw=dailyBoardItems(activeDate);
  const activeItems=hideCompleted ? activeItemsRaw.filter(item=>!isCompletedOn(item,activeDate)) : activeItemsRaw;
  const activeItemIds=useMemo(()=>activeItems.map(item=>item.id),[activeItems]);
  const selectedActiveIds=useMemo(()=>activeItemIds.filter(id=>selected.includes(id)),[activeItemIds,selected]);
  const completedTodayCount=activeItemsRaw.filter(item=>isCompletedOn(item,activeDate)).length;

  const emailHelperLead=useMemo(()=>emailHelper?.leadId?leads.find(l=>l.id===emailHelper.leadId):null,[emailHelper,leads]);
  const emailHelperQueueIds=emailHelper?.queueIds||[];
  const emailHelperQueuePosition=emailHelperLead?Math.max(0,emailHelperQueueIds.indexOf(emailHelperLead.id)):0;
  const openEmailHelper=(lead,queueIds=null)=>{
    if(!lead || isPrepItem(lead)) return alert("請選擇客戶名單，準備事項不能產生寄信。");
    const ids=(queueIds&&queueIds.length?queueIds:[lead.id]).filter(id=>{
      const item=leads.find(x=>x.id===id);
      return item && !isPrepItem(item);
    });
    setEmailHelper({leadId:lead.id,queueIds:ids.length?ids:[lead.id]});
  };
  const openSelectedEmailHelper=()=>{
    const ids=activeLeadIds(selected);
    if(!ids.length) return alert("請先勾選要產生信件的客戶名單。");
    setEmailHelper({leadId:ids[0],queueIds:ids});
  };
  const goNextEmailHelper=()=>{
    if(!emailHelperQueueIds.length) return setEmailHelper(null);
    const idx=emailHelperQueueIds.indexOf(emailHelper?.leadId);
    const nextId=emailHelperQueueIds[idx+1];
    if(nextId) setEmailHelper({...emailHelper,leadId:nextId});
    else alert("已經是最後一筆。");
  };
  const markEmailScheduled=(id, date, time="09:10")=>{
    if(!id || !date) return;
    const follow=nextFollowUpDate(date);
    commitLeads(cur=>cur.map(x=>x.id===id?{
      ...x,
      status:"已寄信",
      sentDate:date,
      followUpDate:follow,
      nextAction:"第一次寄出後 3 個工作日追蹤一次",
      completed:true,
      completedDate:date,
      completedDates:{...(x.completedDates||{}),[date]:true},
      notes:`${x.notes||""}${x.notes?"\n":""}${today()}：已用寄信助手開啟 Gmail 並標記為已排程寄出（${date} ${time}）；追蹤日 ${follow}`
    }:x),`寄信助手標記已排程：${date} ${time}`);
  };

  const save=(lead)=>{
    const fixed=isPrepItem(lead)?{...lead,type:"準備事項",source:lead.source||"內部準備事項",status:"準備事項"}:{...lead,leadQuality:lead.leadQuality||inferLeadQuality(lead),focusFit:lead.focusFit||inferFocusFit(lead)};
    commitLeads(cur=>cur.some(x=>x.id===fixed.id)?cur.map(x=>x.id===fixed.id?fixed:x):[fixed,...cur], `${lead?.id?"儲存":"新增"}：${fixed.name||"未命名"}`);
    setEditing(null); setDraft(null);
  };
  const remove=(id)=>{ if(confirm("確定要刪除這筆資料嗎？")) commitLeads(cur=>cur.filter(x=>x.id!==id),"刪除單筆資料"); };
  const updateStatus=(id,v)=>commitLeads(cur=>cur.map(x=>{
    if(x.id!==id) return x;
    const now = today();
    if(v==="已寄信"){
      const sentDate = x.sentDate || now;
      return {...x,status:v,sentDate,followUpDate:nextFollowUpDate(sentDate),nextAction:"3 個工作日後檢查是否回覆，若無回覆再決定是否寄短版追蹤。"};
    }
    if(v==="已追蹤一次"){
      const actualFollowUpDate = x.actualFollowUpDate || now;
      return {...x,status:v,actualFollowUpDate,followUpDate:"",nextAction:`已於 ${actualFollowUpDate} 補寄 / 追蹤；後續等回覆，暫不安排下一次追蹤。`};
    }
    if(v==="內部討論中"){
      return {...x,status:v,followUpDate:internalDiscussionDate(now),nextAction:`對方表示內部討論，先不打擾；${internalDiscussionDate(now)} 再檢查是否需要短版追蹤。`};
    }
    if(v==="願意交流"){
      return {...x,status:v,followUpDate:"",nextAction:"對方願意交流或提供具體回饋，先補充背景與案例，後續視對方回覆再推進。"};
    }
    if(v==="內部無需求但可能有實習機會"){
      return {...x,status:v,leadQuality:x.leadQuality||"C｜小方案 / 低優先",followUpDate:"",nextAction:"內部暫無合作需求，但可能有實習機會；之後可整理履歷 / 作品集再聯繫。"};
    }
    if(v==="無需求"){
      return {...x,status:v,leadQuality:x.leadQuality||"C｜小方案 / 低優先",followUpDate:"",nextAction:"對方已回覆目前暫無需求，不再主動追蹤；之後若有新需求再聯繫。"};
    }
    if(v==="未成交"){
      return {...x,status:v,leadQuality:x.leadQuality||"C｜小方案 / 低優先",followUpDate:"",nextAction:"對方已回覆但未成交，先結案不再追蹤。"};
    }
    if(v==="已放棄"){
      return {...x,status:v,leadQuality:"D｜不符合主線 / 放棄",focusFit:x.focusFit||inferFocusFit(x),followUpDate:"",nextAction:"非目前主攻方向或不適合開發，主動暫停追蹤。"};
    }
    return {...x,status:v};
  }));
  const markDone=(id,date=activeDate)=>{ setHideCompleted(false); commitLeads(cur=>cur.map(x=>{
    if(x.id!==id) return x;
    const completedDates={...(x.completedDates||{}),[date]:true};
    const isFollowUpTask=!isPrepItem(x) && x.followUpDate===date && !x.actualFollowUpDate;
    return {
      ...x,
      completed:true,
      completedDate:date,
      completedDates,
      actualFollowUpDate:isFollowUpTask?date:x.actualFollowUpDate,
      followUpDate:isFollowUpTask?"":x.followUpDate,
      status:isFollowUpTask?"已追蹤一次":x.status,
      nextAction:isFollowUpTask?`已於 ${date} 補寄 / 追蹤；後續等回覆，暫不安排下一次追蹤。`:x.nextAction,
      notes:`${x.notes||""}${x.notes?"\n":""}${date}：已達成${isFollowUpTask?"，已記錄補寄 / 追蹤日期":""}`
    };
  })); };
  const tomorrow=(id,date=activeDate)=>{
    const nd=addDays(date,1);
    commitLeads(cur=>cur.map(x=>{
      if(x.id!==id) return x;
      const completedDates={...(x.completedDates||{})};
      delete completedDates[date];
      return {...x,completed:Object.keys(completedDates).length>0,completedDates,completedDate:x.completedDate===date?"":x.completedDate,followUpDate:nd,nextAction:x.nextAction||x.need||"延後處理",notes:`${x.notes||""}${x.notes?"\n":""}${date}：未達成，已延到 ${nd}`};
    }));
    if(monthStr(nd)!==calMonth) setCalMonth(monthStr(nd));
  };
  const toggle=(id)=>setSelected(cur=>cur.includes(id)?cur.filter(x=>x!==id):[...cur,id]);
  const toggleAll=()=>{
    const ids=filteredLeads.map(x=>x.id);
    const all=ids.length&&ids.every(id=>selected.includes(id));
    setSelected(cur=>all?cur.filter(id=>!ids.includes(id)):Array.from(new Set([...cur,...ids])));
  };
  const toggleAllActive=()=>{
    const ids=activeItemIds;
    const all=ids.length&&ids.every(id=>selected.includes(id));
    setSelected(cur=>all?cur.filter(id=>!ids.includes(id)):Array.from(new Set([...cur,...ids])));
  };
  const activeLeadIds=(ids)=>ids.filter(id=>{
    const item=leads.find(x=>x.id===id);
    return item && !isPrepItem(item);
  });
  const clearSelection=(ids=null)=>{
    if(!ids) return setSelected([]);
    setSelected(cur=>cur.filter(id=>!ids.includes(id)));
  };
  const bulkSend=(ids=selected, date=activeDate)=>{
    setHideCompleted(false);
    const target=activeLeadIds(ids);
    if(!target.length) return alert("請先勾選要寄出的客戶名單。");
    commitLeads(cur=>cur.map(x=>target.includes(x.id)?{
      ...x,
      sentDate:date,
      followUpDate:nextFollowUpDate(date),
      status:"已寄信",
      nextAction:"3 個工作日後檢查是否回覆，若無回覆再決定是否寄短版追蹤。",
      completed:true,
      completedDate:date,
      completedDates:{...(x.completedDates||{}),[date]:true},
      notes:`${x.notes||""}${x.notes?"\n":""}${date}：已批次標記為已寄信，追蹤日 ${nextFollowUpDate(date)}`
    }:x));
    clearSelection(target);
  };
  const bulkFollowUp=(ids=selected, date=activeDate)=>{
    setHideCompleted(false);
    const target=activeLeadIds(ids);
    if(!target.length) return alert("請先勾選要追蹤的客戶名單。");
    commitLeads(cur=>cur.map(x=>target.includes(x.id)?{
      ...x,
      actualFollowUpDate:date,
      followUpDate:"",
      status:"已追蹤一次",
      nextAction:`已於 ${date} 補寄 / 追蹤；後續等回覆，暫不安排下一次追蹤。`,
      completed:true,
      completedDate:date,
      completedDates:{...(x.completedDates||{}),[date]:true},
      notes:`${x.notes||""}${x.notes?"\n":""}${date}：已批次標記為已追蹤一次，後續不自動安排下一次追蹤`
    }:x));
    clearSelection(target);
  };
  const bulkDelete=(ids=selected)=>{
    if(!ids.length) return alert("請先勾選要刪除的項目。");
    if(!confirm(`確定刪除已勾選的 ${ids.length} 筆資料嗎？`)) return;
    commitLeads(cur=>cur.filter(x=>!ids.includes(x.id)),`刪除已勾選 ${ids.length} 筆`);
    clearSelection(ids);
  };
  const bulkTomorrow=(ids=selected, date=activeDate)=>{
    if(!ids.length) return alert("請先勾選要延後的項目。");
    const nd=addDays(date,1);
    commitLeads(cur=>cur.map(x=>{
      if(!ids.includes(x.id)) return x;
      const completedDates={...(x.completedDates||{})};
      delete completedDates[date];
      const isPlanned=x.plannedContactDate===date || (!x.plannedContactDate && !x.sentDate && !x.followUpDate && !isPrepItem(x));
      const isFollow=x.followUpDate===date;
      const isWork=x.workDate===date;
      const isDelivery=x.deliveryDate===date;
      const isPrep=isPrepItem(x);
      return {
        ...x,
        completed:Object.keys(completedDates).length>0,
        completedDates,
        completedDate:x.completedDate===date?"":x.completedDate,
        plannedContactDate:isPlanned?nd:x.plannedContactDate,
        followUpDate:(isFollow||isPrep)?nd:x.followUpDate,
        workDate:isWork?nd:x.workDate,
        deliveryDate:isDelivery?nd:x.deliveryDate,
        nextAction:x.nextAction||x.need||"延後處理",
        notes:`${x.notes||""}${x.notes?"\n":""}${date}：批次延後到 ${nd}`
      };
    }));
    if(monthStr(nd)!==calMonth) setCalMonth(monthStr(nd));
    clearSelection(ids);
  };
  const applyBulk=()=>{
    if(!bulkDate) return alert("請先選擇要套用的寄出日期。");
    if(!selected.length) return alert("請先勾選要修改的名單。");
    bulkSend(selected, bulkDate);
  };
  const applyBulkFollowUpDate=()=>{
    if(!bulkFollowUpDate) return alert("請先選擇要套用的追蹤日。");
    if(!selected.length) return alert("請先勾選要修改的名單。");
    const target=activeLeadIds(selected);
    if(!target.length) return alert("請先勾選客戶名單，不包含準備事項。");
    commitLeads(cur=>cur.map(x=>target.includes(x.id)?{
      ...x,
      followUpDate:bulkFollowUpDate,
      nextAction:x.nextAction||`預計於 ${bulkFollowUpDate} 追蹤。`,
      notes:`${x.notes||""}${x.notes?"\n":""}${today()}：批次套用追蹤日 ${bulkFollowUpDate}`
    }:x),`批次套用追蹤日 ${bulkFollowUpDate}`);
    clearSelection(target);
  };
  const applyBulkStatus=()=>{
    if(!bulkStatusValue) return alert("請先選擇要套用的狀態。");
    if(!selected.length) return alert("請先勾選要修改的名單。");
    const target=activeLeadIds(selected);
    if(!target.length) return alert("請先勾選客戶名單，不包含準備事項。");
    for(const id of target) updateStatus(id, bulkStatusValue);
    clearSelection(target);
  };
  const clearSelectedFollowUpDate=()=>{
    if(!selected.length) return alert("請先勾選要修改的名單。");
    const target=activeLeadIds(selected);
    if(!target.length) return alert("請先勾選客戶名單，不包含準備事項。");
    if(!confirm(`確定清空已勾選 ${target.length} 筆的追蹤日嗎？`)) return;
    commitLeads(cur=>cur.map(x=>target.includes(x.id)?{
      ...x,
      followUpDate:"",
      notes:`${x.notes||""}${x.notes?"\n":""}${today()}：批次清空追蹤日`
    }:x),`批次清空追蹤日 ${target.length} 筆`);
    clearSelection(target);
  };
  const downloadCsv=(filename, headers, rows)=>{
    if(!rows.length) return alert("目前沒有資料可以匯出。");
    const csv = [headers, ...rows]
      .map(row=>row.map(csvEscape).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const exportOutreachSummary=()=>{
    const rows = uniqueLeadsByName(leads.filter(l=>!isPrepItem(l)))
      .map(l=>{
        const hasSent = Boolean(l.sentDate);
        const hasFollowedUp = Boolean(l.actualFollowUpDate) || l.status === "已追蹤一次";
        const hasReplied = isRepliedLead(l);
        return [
          (l.name||"未命名單位").trim(),
          (l.email||"").trim(),
          l.status||"",
          hasSent ? "是" : "否",
          l.sentDate||"",
          hasFollowedUp ? "是" : "否",
          l.actualFollowUpDate||"",
          l.followUpDate||"",
          hasReplied ? "是" : "否",
          hasReplied ? replyCategory(l) : "尚未回覆",
          isEffectiveOpportunity(l)?"是":"否",
          isRejectedOrNoNeed(l)?"是":"否",
          getLeadQuality(l),
          getFocusFit(l),
          money(l.estimatedAmount),
          l.projectPlan||"尚未設定方案",
          l.lastReply||"",
          l.nextAction||"",
          l.notes||""
        ];
      });
    if(!rows.length) return alert("目前沒有名單可以匯出。");
    downloadCsv(
      `名單追蹤總表_${today()}.csv`,
      ["單位名稱","Email","狀態","是否已寄出","寄出日期","是否追蹤過","補追/追蹤日期","下一次追蹤日","是否回覆","回覆分類","是否有效案源","是否無需求/實習/未成交","名單品質","主線匹配度","預計收益","方案","回覆內容/對方反應","下一步","備註"],
      rows
    );
  };
  const importText=(text,mode="lead")=>{
    const lines=text
      .split(String.fromCharCode(10))
      .map(x=>x.replace(String.fromCharCode(13),"").trim())
      .filter(Boolean);

    if(lines.length<1) return alert("請至少貼上一筆資料。");

    const firstLine=lines[0]||"";
    const hasLeadHeader =
      firstLine.includes("單位名稱") ||
      firstLine.includes("Email") ||
      firstLine.includes("客戶方案") ||
      firstLine.includes("可能需求");
    const hasPrepHeader =
      firstLine.includes("準備事項") ||
      firstLine.includes("安排日期") ||
      firstLine.includes("準備內容");
    const hasHeader = mode==="prep" ? hasPrepHeader : hasLeadHeader;
    const dataLines = hasHeader ? lines.slice(1) : lines;

    if(dataLines.length<1) return alert("沒有讀到可匯入的資料。");

    const rows=dataLines.map(line=>line.split(String.fromCharCode(9)));
    const batchId=`import-${Date.now()}`;
    const imported=mode==="prep"
      ? rows.filter(c=>c[0]||c[2]||c[3]).map(c=>{
          const [name,date,need,nextAction,notes]=c;
          const d=normalizeDate(date)||today();
          return {...prep(d),importBatchId:batchId,importedAt:today(),name:name?.trim()||"準備事項",followUpDate:d,need:need?.trim()||"",nextAction:nextAction?.trim()||need?.trim()||"待處理",notes:notes?.trim()||""};
        })
      : rows.filter(c=>c[0]||c[2]).map(c=>{
          const [name,t,email,plan,need,date,priority,source,notes]=c;
          const d=normalizeDate(date);
          const base={...emptyLead(d),importBatchId:batchId,importedAt:today(),name:name?.trim()||"未命名單位",type:typeOptions.includes(t?.trim())?t.trim():"其他",email:email?.trim()||"",projectPlan:plan?.trim()||"",need:need?.trim()||"",plannedContactDate:d,followUpDate:"",source:source?.trim()||"",notes:notes?.trim()||"",nextAction:d?`建議於 ${d} 第一次聯絡 / 私訊`:"待安排聯絡時間"};
          return {...base,leadQuality:inferLeadQuality(base),focusFit:inferFocusFit(base)};
        });
    if(!imported.length) return alert(mode==="prep"?"沒有讀到可匯入的準備事項。":"沒有讀到可匯入的名單。");
    const ids=imported.map(x=>x.id);
    const firstDate=firstScheduleDate(imported[0]);
    commitLeads(cur=>[...imported,...cur],`批量匯入 ${imported.length} 筆${mode==="prep"?"準備事項":"名單"}`);
    setLastImport({ids,count:imported.length,mode,batchId,firstDate});
    setSelected(ids);
    setBulk(false);
    if(mode==="prep") setShowPrepAll(true); else setShowLeadsAll(true);
    focusDate(firstDate);
    alert(`已匯入 ${imported.length} 筆，已自動勾選並跳到 ${firstDate}。若貼錯，可按「復原上一步」或「刪除最近匯入」。`);
  };

  return <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef4ff_45%,#e8edf7_100%)] text-slate-900"><div className="mx-auto max-w-7xl px-5 py-8">
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700"><ClipboardList className="h-4 w-4"/>Eason Lead Tracker</div><h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">潛在客戶追蹤系統</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">管理高品質案源、主線匹配度、預計聯絡、寄信追蹤、回覆狀況、下一步、預估收益、實際收入與未來維護機會。</p></div><div className="flex flex-wrap gap-3"><button onClick={()=>setBulk(true)} className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-blue-700 shadow-sm hover:bg-blue-50"><Upload className="h-4 w-4"/>批量貼上</button><button onClick={exportOutreachSummary} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-emerald-700 shadow-sm hover:bg-emerald-50"><Download className="h-4 w-4"/>匯出名單追蹤總表</button><button onClick={()=>setShowLeadsAll(v=>!v)} className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm ${showLeadsAll?"border-blue-500 bg-blue-50 text-blue-700":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><ClipboardList className="h-4 w-4"/>{showLeadsAll?"隱藏名單一覽":"名單一覽"}</button><button onClick={()=>setShowPrepAll(v=>!v)} className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm ${showPrepAll?"border-slate-500 bg-slate-100 text-slate-700":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><CalendarDays className="h-4 w-4"/>{showPrepAll?"隱藏準備事項":"準備事項一覽"}</button><button onClick={()=>setShowQuotedPlans(v=>!v)} className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm ${showQuotedPlans?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><DollarSign className="h-4 w-4"/>{showQuotedPlans?"隱藏報價/合約分類":"報價/合約方案分類"}</button></div></header>

    <section className={`mt-6 rounded-3xl border p-4 shadow-sm ${supabase?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50"}`}><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><p className={`text-sm font-bold ${supabase?"text-emerald-800":"text-amber-800"}`}>{cloudSaving?"雲端同步中":cloudStatus}</p><p className="mt-1 text-sm leading-6 text-slate-600">{cloudMessage}</p>{cloudLastSavedAt&&<p className="mt-1 text-xs text-slate-500">最後同步：{cloudLastSavedAt}</p>}</div><div className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">資料來源：{supabase?"Supabase 雲端 + 本機備份":"本機備份模式"}</div></div></section>

    <section className="mt-8 grid gap-4 md:grid-cols-4 xl:grid-cols-5"><Stat icon={ClipboardList} label="客戶名單總數" value={stats.total}/><Stat icon={Clock3} label="未寄" value={stats.unsentCount} active={activeStatKey==="unsent"} onClick={()=>setActiveStatKey(activeStatKey==="unsent"?"":"unsent")}/><Stat icon={Mail} label="已寄" value={stats.sentCount} active={activeStatKey==="sent"} onClick={()=>setActiveStatKey(activeStatKey==="sent"?"":"sent")}/><Stat icon={Mail} label="已補追" value={stats.actualFollowUpCount} active={activeStatKey==="actualFollowUp"} onClick={()=>setActiveStatKey(activeStatKey==="actualFollowUp"?"":"actualFollowUp")}/><Stat icon={CheckCircle2} label="有回覆" value={stats.replied} active={activeStatKey==="replied"} onClick={()=>setActiveStatKey(activeStatKey==="replied"?"":"replied")}/><Stat icon={Clock3} label="有效案源" value={stats.activeOpportunity} active={activeStatKey==="active"} onClick={()=>setActiveStatKey(activeStatKey==="active"?"":"active")}/><Stat icon={AlertCircle} label="無需求/實習/未成交" value={stats.rejected} active={activeStatKey==="rejected"} onClick={()=>setActiveStatKey(activeStatKey==="rejected"?"":"rejected")}/><Stat icon={DollarSign} label="有預計收益案源" value={stats.estimatedCount} active={activeStatKey==="estimated"} onClick={()=>setActiveStatKey(activeStatKey==="estimated"?"":"estimated")}/><Stat icon={DollarSign} label="預計收益總累積" value={money(stats.projected)}/><Stat icon={DollarSign} label="目前總收益" value={money(stats.actual)}/></section>

    {activeStatDetail&&<section className="mt-4 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4 md:flex-row md:items-start md:justify-between"><div><p className="font-bold text-slate-950">{activeStatDetail.title}名單（{activeStatDetail.items.length} 筆）</p><p className="mt-1 text-sm leading-6 text-slate-500">{activeStatDetail.description}</p></div><button onClick={()=>setActiveStatKey("")} className="w-fit rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">關閉</button></div><div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">{activeStatDetail.items.length===0?<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3"><AlertCircle className="mx-auto mb-3 h-8 w-8"/><p>目前沒有符合這個統計的名單。</p></div>:activeStatDetail.items.map(item=><div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-950">{item.name||"未命名單位"}</p><p className="mt-1 text-xs text-slate-500">{item.contact||"尚未填窗口"}・{item.type||"其他"}・{item.status}</p></div><button onClick={()=>setEditing(item)} className="shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"><Pencil className="h-4 w-4"/></button></div><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${qualityBadgeClass(getLeadQuality(item))}`}>{getLeadQuality(item)}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{getFocusFit(item)}</span></div><div className="mt-3 space-y-1 text-sm leading-6 text-slate-600"><p>預計收益：<span className="font-semibold text-blue-700">{money(item.estimatedAmount)}</span></p><p>方案：{item.projectPlan||"尚未設定方案"}</p><p>寄出日：{item.sentDate||"尚未寄出"}</p><p>追蹤日：{item.followUpDate||"無追蹤日"}</p><p>補追日：{item.actualFollowUpDate||"尚未補追"}</p><p className="line-clamp-2">下一步：{item.nextAction||"尚未設定下一步"}</p></div></div>)}</div></section>}

    <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-semibold text-slate-950">批量更新</p><p className="mt-1 text-sm text-slate-500">名單一覽或每日區塊都可以勾選。常用操作可一鍵寄出、追蹤、批次改追蹤日、批次改狀態、刪除或延後；一鍵寄出 / 一鍵追蹤會使用目前日期滾輪選到的日期，不會偷用電腦今天日期；寄出會自動把追蹤日設為 +3 個工作日，假日不算；補寄 / 追蹤完成後會清空追蹤日，不再自動二追。前一天沒完成的待辦，下次進來會自動移到今天，手動延後也保留。</p></div><div className="flex flex-wrap items-end gap-3"><label className="block"><span className="text-sm font-medium text-slate-700">指定寄出日期</span><input type="date" value={bulkDate} onChange={e=>setBulkDate(e.target.value)} className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label><button onClick={applyBulk} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">套用寄出日期</button><label className="block"><span className="text-sm font-medium text-slate-700">指定追蹤日</span><input type="date" value={bulkFollowUpDate} onChange={e=>setBulkFollowUpDate(e.target.value)} className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label><button onClick={applyBulkFollowUpDate} className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400">套用追蹤日</button><label className="block"><span className="text-sm font-medium text-slate-700">指定狀態</span><select value={bulkStatusValue} onChange={e=>setBulkStatusValue(e.target.value)} className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option value="">選擇狀態</option>{statusOptions.filter(s=>s!=="準備事項").map(s=><option key={s} value={s}>{s}</option>)}</select></label><button onClick={applyBulkStatus} className="rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-600">套用狀態</button><button onClick={openSelectedEmailHelper} className="rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white hover:bg-violet-400">寄信助手</button><button onClick={()=>bulkSend(selected,activeDate)} className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">一鍵寄出</button><button onClick={()=>bulkFollowUp(selected,activeDate)} className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-400">一鍵追蹤</button><button onClick={clearSelectedFollowUpDate} className="rounded-2xl border border-amber-200 bg-white px-5 py-3 font-semibold text-amber-700 hover:bg-amber-50">清空追蹤日</button><button onClick={()=>bulkTomorrow(selected,activeDate)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">延到明天</button><button onClick={()=>bulkDelete(selected)} className="rounded-2xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 hover:bg-red-50">刪除勾選</button></div></div></section>

    <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">操作復原 / 最近匯入</p>
          <p className="mt-1 text-sm text-slate-500">貼錯、刪錯、批量改錯都可以先按復原；最近一次批量匯入也可以直接刪掉。</p>
          {lastAction&&<p className="mt-2 text-xs text-blue-600">最近操作：{lastAction}</p>}
          {lastImport&&<p className="mt-1 text-xs text-emerald-700">最近匯入：{lastImport.count} 筆，日期 {lastImport.firstDate}，目前已自動勾選。</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={undoLast} disabled={!history.length} className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold ${history.length?"border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100":"border border-slate-200 bg-slate-100 text-slate-400"}`}><Undo2 className="h-4 w-4"/>復原上一步</button>
          <button onClick={()=>viewImportedBatch()} disabled={!lastImport} className={`rounded-2xl px-5 py-3 font-semibold ${lastImport?"border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100":"border border-slate-200 bg-slate-100 text-slate-400"}`}>查看最近匯入</button>
          <button onClick={()=>deleteImportedBatch()} disabled={!lastImport} className={`rounded-2xl px-5 py-3 font-semibold ${lastImport?"border border-red-200 bg-red-50 text-red-600 hover:bg-red-100":"border border-slate-200 bg-slate-100 text-slate-400"}`}>刪除最近匯入</button>
        </div>
      </div>
    </section>

    <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold text-slate-950">日期滾輪</p><p className="mt-1 text-sm text-slate-500">用滾輪選日期。預計聯絡、實際寄出、預計追蹤、實際補追、進行中工作、交付日、準備事項都會顯示在下面。</p></div><div className="flex items-center gap-2"><button onClick={()=>{const m=addMonths(calMonth,-1);setCalMonth(m);setActiveDate(`${m}-01`)}} className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"><ChevronLeft className="h-5 w-5"/></button><button onClick={goToday} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">回到今天</button><button onClick={()=>{const m=addMonths(calMonth,1);setCalMonth(m);setActiveDate(`${m}-01`)}} className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"><ChevronRight className="h-5 w-5"/></button></div></div><h2 className="mb-4 text-2xl font-bold text-slate-950">{monthTitle(calMonth)}</h2>
    <div ref={calendarScrollRef} className="flex gap-3 overflow-x-auto pb-3">{calDays.map(d=>{const items=dailyBoardItems(d);const planned=items.filter(x=>x.plannedContactDate===d&&!isPrepItem(x)).length;const send=items.filter(x=>x.sentDate===d&&!isPrepItem(x)).length;const follow=items.filter(x=>x.followUpDate===d&&!isPrepItem(x)).length;const actualFollow=items.filter(x=>x.actualFollowUpDate===d&&!isPrepItem(x)).length;const work=items.filter(x=>x.workDate===d&&!isPrepItem(x)).length;const delivery=items.filter(x=>x.deliveryDate===d&&!isPrepItem(x)).length;const prepC=items.filter(x=>isPrepItem(x)).length;const isToday=d===today();const active=d===activeDate;return <button key={d} data-calendar-date={d} onClick={()=>setActiveDate(d)} className={`min-w-[128px] shrink-0 rounded-2xl border px-4 py-3 text-left transition ${active?"border-blue-500 bg-blue-50 shadow-sm":"border-slate-200 bg-white hover:bg-slate-50"}`}><div className="flex items-center justify-between gap-2"><p className={`text-sm font-bold ${active?"text-blue-700":"text-slate-800"}`}>{isToday?"今天":dateLabel(d)}</p>{isToday&&<span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">今</span>}</div><p className="mt-1 text-xs text-slate-500">{d}</p><div className="mt-2 flex flex-wrap gap-1">{planned>0&&<span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700">聯 {planned}</span>}{send>0&&<span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">寄 {send}</span>}{follow>0&&<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">追 {follow}</span>}{actualFollow>0&&<span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-700">補 {actualFollow}</span>}{work>0&&<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">工 {work}</span>}{delivery>0&&<span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-700">交 {delivery}</span>}{prepC>0&&<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">準 {prepC}</span>}{items.length===0&&<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">空</span>}</div></button>})}</div>
    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold text-slate-950">{activeDate===today()?"今天":dateLabel(activeDate)}</p>
          <p className="mt-1 text-sm text-slate-500">{activeDate}</p>
          {completedTodayCount>0&&<p className="mt-1 text-xs text-slate-400">已達成 {completedTodayCount} 筆{hideCompleted?"，目前已隱藏":""}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>setHideCompleted(v=>!v)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${hideCompleted?"border-blue-200 bg-blue-50 text-blue-700":"border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>
            {hideCompleted?"顯示已達成":"隱藏已達成"}
          </button>
          <button onClick={()=>setDraft(emptyLead(activeDate))} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"><Plus className="mr-1 inline h-4 w-4"/>新增名單</button>
          <button onClick={()=>setDraft(prep(activeDate))} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Plus className="mr-1 inline h-4 w-4"/>準備事項</button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={activeItemIds.length>0&&activeItemIds.every(id=>selected.includes(id))} onChange={toggleAllActive}/>
            勾選本日全部
          </label>
          <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">本日已選 {selectedActiveIds.length} 筆</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openSelectedEmailHelper} className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400">產生寄信</button><button onClick={()=>bulkSend(selectedActiveIds,activeDate)} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400">一鍵寄出</button>
          <button onClick={()=>bulkFollowUp(selectedActiveIds,activeDate)} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-400">一鍵追蹤</button>
          <button onClick={()=>bulkTomorrow(selectedActiveIds,activeDate)} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100">延到明天</button>
          <button onClick={()=>bulkDelete(selectedActiveIds)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">刪除</button>
          <button onClick={()=>clearSelection(activeItemIds)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">清除本日勾選</button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {activeItems.length===0?
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-400">
            {activeItemsRaw.length>0&&hideCompleted?"這一天未完成事項已清空；按「顯示已達成」可查看今天完成的是寄信、追蹤、補追或聯絡。":"這一天目前沒有安排。"}
          </div>
          :activeItems.map(item=>{
            const itemDone=isCompletedOn(item,activeDate);
            const eventType=isPrepItem(item)?"準備":item.deliveryDate===activeDate?"交付":item.workDate===activeDate?"工作":item.actualFollowUpDate===activeDate?"補追":item.sentDate===activeDate?"寄信":item.followUpDate===activeDate?"追蹤":"聯絡";
            const typeLabel=itemDone?`已達成｜${eventType}`:eventType;
            return <div key={item.id} className={`rounded-2xl border p-4 ${itemDone?"border-blue-200 bg-blue-50":"border-slate-200 bg-white"}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selected.includes(item.id)} onChange={()=>toggle(item.id)} className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"/>
                <button onClick={()=>setEditing(item)} className="block min-w-0 flex-1 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`truncate font-semibold ${itemDone?"text-blue-800":"text-slate-900"}`}>{item.name||item.need||"未命名"}</p>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] ${itemDone?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-500"}`}>{typeLabel}</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.deliveryDate===activeDate?(item.deliveryNote||"交付 / 截止事項"):item.workDate===activeDate?(item.workTask||"進行中工作"):item.actualFollowUpDate===activeDate?"已完成補寄 / 追蹤，等待回覆":item.nextAction||item.need||"尚未設定下一步"}</p>
                </button>
              </div>
              {itemDone?
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-center text-xs font-semibold text-blue-700">✓ 這一天已達成｜{eventType}，如需調整請點開編輯</div>
                :<div className="mt-4 grid grid-cols-2 gap-2">{!isPrepItem(item)&&<button onClick={()=>openEmailHelper(item)} className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100">寄信助手</button>}<button onClick={()=>markDone(item.id,activeDate)} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">✓ 達成</button><button onClick={()=>tomorrow(item.id,activeDate)} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100">未達成 → 明天</button></div>}
            </div>;
          })}
      </div>
    </div></section>

    {(showLeadsAll||showPrepAll||showQuotedPlans)&&<section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 xl:grid-cols-[1.2fr_0.65fr_0.65fr_0.8fr_0.8fr_auto_auto]">
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">關鍵字搜尋</span><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') applySearch();}} placeholder="搜尋單位、Email、需求、回覆、備註..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-400"/></div></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">狀態篩選</span><select value={status} onChange={e=>setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{statusOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">類型篩選</span><select value={type} onChange={e=>setType(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{typeOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">名單品質</span><select value={quality} onChange={e=>setQuality(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{leadQualityOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">主線匹配</span><select value={focusFit} onChange={e=>setFocusFit(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{focusFitOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <div className="flex items-end"><button onClick={applySearch} className="w-full rounded-2xl bg-blue-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-400">搜尋</button></div>
      <div className="flex items-end"><button onClick={clearFilters} className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50">清除</button></div>
    </div>{query&&<p className="mt-3 text-sm text-slate-500">目前搜尋：<span className="font-semibold text-slate-700">{query}</span></p>}</section>}
    {showQuotedPlans&&<section className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm"><div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4"><p className="font-bold text-slate-950">報價/合約方案分類（{quotedPlanTotal} 筆）</p><p className="mt-1 text-sm text-slate-500">只統計狀態為「已報價」或「談合約」的客戶，並且會套用上方的關鍵字、狀態與類型篩選。</p></div><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{quotedPlanGroups.length===0?<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3"><AlertCircle className="mx-auto mb-3 h-8 w-8"/><p>目前沒有狀態為「已報價」或「談合約」的名單。</p></div>:quotedPlanGroups.map(group=><div key={group.plan} className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-700">{group.plan}</p><p className="mt-2 text-2xl font-bold text-slate-950">{group.count} 筆</p></div><div className="rounded-2xl bg-white px-3 py-2 text-right text-xs text-slate-500 shadow-sm"><p>預計</p><p className="font-bold text-emerald-700">{money(group.projected)}</p><p className="mt-1">已收 {money(group.actual)}</p></div></div><div className="mt-4 space-y-3">{group.items.map(item=><div key={item.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.name||"未命名單位"}</p><p className="mt-1 text-xs text-slate-500">{item.contact||"尚未填窗口"}・{item.type||"其他"}・{item.status}</p></div><button onClick={()=>setEditing(item)} className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Pencil className="h-4 w-4"/></button></div><div className="mt-3 grid gap-2 text-xs text-slate-600"><p>預計收益：<span className="font-semibold text-blue-700">{money(item.estimatedAmount)}</span></p><p>追蹤日：{item.followUpDate||"無追蹤日"}</p><p>補追日期：{item.actualFollowUpDate||"尚未追蹤"}</p><p>下一步：{item.nextAction||"尚未設定下一步"}</p>{item.need&&<p className="line-clamp-2">需求：{item.need}</p>}</div></div>)}</div></div>)}</div></section>}
    {showLeadsAll&&<section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-blue-50 px-5 py-4"><p className="font-bold text-slate-950">名單一覽（{filteredLeads.length} 筆）</p><p className="mt-1 text-sm text-slate-500">這裡顯示所有非準備事項的客戶名單；優先看 A / B 名單，小店或不符合主線的名單請標成 C / D，避免浪費開發時間。</p></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4"><input type="checkbox" checked={filteredLeads.length>0&&filteredLeads.every(l=>selected.includes(l.id))} onChange={toggleAll}/></th><th className="px-5 py-4">排序</th><th className="px-5 py-4">單位 / 窗口</th><th className="px-5 py-4">狀態</th><th className="px-5 py-4">品質 / 主線</th><th className="px-5 py-4">客戶方案</th><th className="px-5 py-4">時間</th><th className="px-5 py-4">下一步</th><th className="px-5 py-4">需求摘要</th><th className="px-5 py-4">收益</th><th className="px-5 py-4">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredLeads.map((l,i)=><tr key={l.id} className="align-top hover:bg-slate-50"><td className="px-5 py-4"><input type="checkbox" checked={selected.includes(l.id)} onChange={()=>toggle(l.id)}/></td><td className="px-5 py-4">#{i+1}</td><td className="px-5 py-4 min-w-[240px]"><p className="font-semibold">{l.name||"未命名單位"}</p><p className="text-slate-500">{l.contact||"尚未填窗口"}</p>{l.email?<a href={`mailto:${l.email}`} className="text-blue-700 hover:underline">{l.email}</a>:<p className="text-slate-400">尚未填 Email</p>}</td><td className="px-5 py-4"><select value={l.status} onChange={e=>updateStatus(l.id,e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2">{statusOptions.map(s=><option key={s}>{s}</option>)}</select><p className="mt-2 text-xs text-slate-400">{l.type}</p></td><td className="px-5 py-4 min-w-[180px]"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${qualityBadgeClass(getLeadQuality(l))}`}>{getLeadQuality(l)}</span><p className="mt-2 text-xs text-slate-500">{getFocusFit(l)}</p></td><td className="px-5 py-4 min-w-[220px]"><p className="font-medium text-slate-700">{l.projectPlan||"尚未設定方案"}</p></td><td className="px-5 py-4 min-w-[160px]"><p>聯：{l.plannedContactDate||"未安排"}</p><p>寄：{l.sentDate||"尚未寄出"}</p><p>追：{l.followUpDate||"無追蹤日"}</p><p>補追：{l.actualFollowUpDate||"尚未追蹤"}</p><p>工：{l.workDate||"未安排"}</p><p>交：{l.deliveryDate||"未設定"}</p><p className="text-xs text-slate-400">時程：{l.expectedClose||"待確認"}</p></td><td className="px-5 py-4 max-w-[260px]"><p>{l.nextAction||"尚未設定下一步"}</p>{l.workTask&&<p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">工作：{l.workTask}</p>}{l.deliveryNote&&<p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">交付：{l.deliveryNote}</p>}</td><td className="px-5 py-4 max-w-[280px]">{l.need||"尚未填需求"}{l.lastReply&&<p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">{l.lastReply}</p>}</td><td className="px-5 py-4 whitespace-nowrap"><p className="font-semibold text-blue-700">預計 {money(l.estimatedAmount)}</p><p className="text-xs text-slate-500">已收 {money(l.receivedAmount)}</p></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={()=>openEmailHelper(l,filteredLeads.map(x=>x.id))} title="寄信助手" className="rounded-xl border border-violet-200 p-2 text-violet-600 hover:bg-violet-50"><Mail className="h-4 w-4"/></button><button onClick={()=>setEditing(l)} className="rounded-xl border border-slate-200 p-2"><Pencil className="h-4 w-4"/></button><button onClick={()=>remove(l.id)} className="rounded-xl border border-red-200 p-2 text-red-500"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div>{filteredLeads.length===0&&<div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-slate-400"><AlertCircle className="h-8 w-8"/><p>沒有符合條件的名單。</p></div>}</section>}
    {showPrepAll&&<section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-slate-50 px-5 py-4"><p className="font-bold text-slate-950">準備事項一覽（{filteredPreps.length} 筆）</p><p className="mt-1 text-sm text-slate-500">這裡只顯示內部準備事項，不會混進客戶名單統計。</p></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">排序</th><th className="px-5 py-4">日期</th><th className="px-5 py-4">準備事項</th><th className="px-5 py-4">內容</th><th className="px-5 py-4">狀態</th><th className="px-5 py-4">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredPreps.map((l,i)=><tr key={l.id} className="align-top hover:bg-slate-50"><td className="px-5 py-4">#{i+1}</td><td className="px-5 py-4 min-w-[140px]">{l.followUpDate||"未安排"}</td><td className="px-5 py-4 min-w-[220px]"><p className="font-semibold">{l.name||"準備事項"}</p><p className="text-xs text-slate-400">{l.completed?`已於 ${l.completedDate||"未記錄日期"} 達成`:"尚未達成"}</p></td><td className="px-5 py-4 max-w-[420px]"><p>{l.nextAction||l.need||"尚未設定內容"}</p>{l.notes&&<p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{l.notes}</p>}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${l.completed?"bg-blue-100 text-blue-700":"bg-amber-100 text-amber-700"}`}>{l.completed?"已達成":"待完成"}</span></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={()=>setEditing(l)} className="rounded-xl border border-slate-200 p-2"><Pencil className="h-4 w-4"/></button><button onClick={()=>remove(l.id)} className="rounded-xl border border-red-200 p-2 text-red-500"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div>{filteredPreps.length===0&&<div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-slate-400"><AlertCircle className="h-8 w-8"/><p>沒有符合條件的準備事項。</p></div>}</section>}

  </div>{bulk&&<BulkImport onImport={importText} onClose={()=>setBulk(false)}/>} {editing&&<LeadForm lead={editing} onSave={save} onCancel={()=>setEditing(null)}/>} {draft&&<LeadForm lead={draft} onSave={save} onCancel={()=>setDraft(null)}/>} {emailHelperLead&&<EmailDraftModal lead={emailHelperLead} queuePosition={emailHelperQueuePosition} queueTotal={emailHelperQueueIds.length} onClose={()=>setEmailHelper(null)} onMarkScheduled={markEmailScheduled} onNext={goNextEmailHelper}/>}</div>
}
