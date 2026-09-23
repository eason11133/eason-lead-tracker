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

const statusOptions = ["準備事項","未聯絡","已寄信","已追蹤一次","對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","待主管評估","留存參考","需求確認中","已約討論","洽談中","已報價","報價後停滯","談合約","進行中","成交","無回覆暫放","無需求","內部無需求但可能有實習機會","未成交","已放棄"];
const statusRank = Object.fromEntries(statusOptions.map((s,i)=>[s,i]));
const typeOptions = ["環境教育","地方創生","社區營造","營隊/活動","課程/補習","公益/社福","小店/品牌","餐飲/夜市","市集/攤商","個人品牌/自由工作者","既有合作案","準備事項","其他"];
const leadQualityOptions = ["A｜真商機｜有痛點＋明確下一步","B｜中度商機｜有痛點但預算/時程未確認","C｜低度商機｜有興趣但沒有承諾","D｜假商機 / 無需求 / 暫放"];
const focusFitOptions = ["查詢 / 導覽 / FAQ 主線","資源 / 據點查詢","資料回報 / 缺口整理","課程 / 活動入口","LINE / Web 輕量工具","泛用後台 / CRM 待驗證","不符合","其他"];
const mainProductOptions = ["","LINE / Web 自助查詢入口","FAQ / 服務流程導覽","資源 / 據點查詢系統","資料回報 / 缺口整理工具","課程 / 活動資訊導覽","會員 / 點數 / 存摺查詢入口","簡易後台維護配套","實驗方向｜小型 CRM / 後台","實驗方向｜小型網頁 / Landing Page","不適合目前主線","其他／待評估"];
const painPointTypeOptions = ["","重複詢問","資訊分散","據點 / 資源不好查","報名流程不清楚","資料會過期","使用者常找不到入口","需要資料回報 / 錯誤回報","會員或使用者需要查詢狀態","只是一般後台 / 網頁需求","不明確"];
const whyPayOptions = ["","節省人工重複回覆","減少錯誤詢問 / 找錯窗口","提升服務效率與使用者體驗","讓民眾 / 會員 / 家長自助查詢","資料需要長期更新與維護","減少活動 / 課程報名前溝通成本","既有系統做不到輕量入口","沒有明確付費理由"];
const credibilityOptions = ["","公廁 LINE Bot 3 萬+ 使用者可類比","野灣救傷 LINE Bot 可類比","資料缺口 Dashboard 可類比","LINE 查詢 / 位置推薦經驗可類比","課程/活動 FAQ 導覽可類比但案例較弱","沒有明確案例支撐"];
const opportunityLevelOptions = leadQualityOptions;
const nextCommitmentOptions = ["","已約會議","要提供資料","要主管討論","要回覆報價","要確認功能範圍","要確認預算 / 時程","報價後停滯","無明確下一步","暫放 / 不追"];
const sourceOptions = ["對方主動來信 / 既有合作案","公開聯絡信箱","官網聯絡頁","Facebook / IG","LINE 官方帳號","朋友介紹","我主動開發","內部準備事項","其他"];
const amountOptions = ["","30000","50000","70000","90000","100000","150000","200000"];
const timeOptions = ["","待確認","約 1 個月","約 2–3 個月","約 4 個月以上","簽約後約 1 個月","簽約後約 2 個月","簽約後約 3 個月以上","依功能範圍評估"];
const planOptions = [
  "",
  "LINE / Web 自助查詢入口｜第一版｜NT$ 30,000 起",
  "FAQ / 服務流程導覽｜第一版｜NT$ 25,000–50,000",
  "資源 / 據點查詢系統｜第一版｜NT$ 50,000 起",
  "資料回報 / 缺口整理工具｜第一版｜NT$ 50,000 起",
  "課程 / 活動資訊導覽｜第一版｜NT$ 25,000–60,000",
  "會員 / 點數 / 存摺查詢入口｜第一版｜依範圍評估",
  "簡易後台維護配套｜搭配查詢/導覽工具",
  "實驗方向｜小型 CRM / 後台｜需明確痛點才評估",
  "實驗方向｜小型網頁 / Landing Page｜非主力",
  "維護｜每月基礎維護｜NT$ 1,500–6,000 起 / 月",
  "其他／待評估"
];
const needOptions = [
  "LINE / Web 自助查詢入口：常見問題、服務流程、報名入口、聯絡窗口",
  "FAQ / 服務流程導覽：使用者依選項找到正確資訊，減少人工重複回覆",
  "資源 / 據點查詢：救傷中心、服務地點、合作據點、會員機構、資源清單",
  "資料回報 / 缺口整理：使用者回報錯誤、過期或缺漏資料，管理者確認後更新",
  "課程 / 活動資訊導覽：課程資訊、報名連結、繳費方式、證書、退費與行前通知",
  "會員 / 點數 / 存摺查詢：會員身分、剩餘點數、服務紀錄或查詢狀態",
  "簡易後台維護：讓單位自行更新 FAQ、據點、課程、回報資料與統計",
  "實驗方向：小型 CRM / 後台，需先證明不是既有流程可解決",
  "不適合目前主線 / 先不寄",
  "整理下一波名單與寄信內容",
  "追蹤已寄信單位回覆狀況",
  "準備客戶業務理解卡與會議問題",
  "其他，需進一步討論"
];
const replyOptions = ["尚未回覆","對方表示有興趣，待約時間","對方詢問價格 / 報價方式","前期簡單了解需求與初步判斷不收費。如果後續確認有適合開發的方向，才會依實際功能範圍報價。","對方需要內部討論","已轉知相關人員 / 留存參考","對方目前沒有需求","已安排線上討論","已寄出報價 / 功能範圍","目前等待合約確認"];
const nextOptions = ["待安排寄送時間","補齊客戶業務理解卡，再決定是否寄信","確認是否有重複詢問 / 資訊分散 / 自助查詢痛點","請對方提供目前 FAQ、LINE、官網或報名流程資料","約 15–30 分鐘確認第一版範圍","整理第一版功能範圍與時程","寄出報價單 / 合作流程說明","報價後確認是否依原方向前進、調整範圍或暫放","已補寄 / 已追蹤一次，等回覆，暫不二追","追蹤後 5–7 天仍無回覆，先暫放","已轉知相關人員 / 留存參考，不排追蹤；若未來有新切入點再聯繫","已加 LINE，改在 LINE 上持續聯繫","已轉到 LINE 洽談，等待對方提供需求","等待合約；合約收到後檢查功能範圍、付款節點、驗收標準、UI/素材、主機費與維護條款。","整理下一波可聯絡名單","暫時放棄，之後再追蹤"];


const outreachTemplateOptions = [
  { value:"auto", label:"自動判斷主推產品" },
  { value:"A", label:"查詢入口｜課程／活動／FAQ" },
  { value:"B", label:"資源查詢｜公益／協會／服務據點" },
  { value:"C", label:"資料回報｜缺口／錯誤資料／更新維護" },
  { value:"followUp", label:"追蹤信｜第一次補追" }
];
const templateSubjects = {
  A:"LINE / Web 查詢導覽工具初步詢問",
  B:"服務資訊與資源查詢工具初步詢問",
  C:"資料回報與查詢導覽工具初步詢問",
  followUp:"Re: LINE / Web 查詢導覽工具初步詢問"
};
const easonSignature = `謝謝您，祝順心。\n\n黃元逸 Eason\nEason Systems\nEmail：easonlsy1019@gmail.com\nLINE ID：1234567890eason60708`;
function detectTemplateType(lead={}){
  const text=[lead.type, lead.focusFit, lead.need, lead.notes, lead.projectPlan, lead.mainProduct, lead.painPointType, lead.customerBusiness].join(" ");
  if(/回報|缺口|錯誤|過期|資料更新|補資料/.test(text)) return "C";
  if(/據點|資源|地圖|位置|救傷|服務點|合作店家|會員機構|存摺|點數/.test(text)) return "B";
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
  const source=sourceLabel(lead.source);
  const context = cleanSnippet(lead.painPointEvidence || lead.need || lead.notes || lead.type || "");
  const product = lead.mainProduct || (t==="B" ? "資源 / 據點查詢系統" : t==="C" ? "資料回報 / 缺口整理工具" : "LINE / Web 自助查詢入口");
  const question = t==="B"
    ? "貴單位是否常遇到民眾、會員或合作單位需要查詢服務據點、資源清單、申請流程或正確窗口，但資訊分散在官網、PDF、表單或 LINE 訊息裡，需要人工重複回覆？"
    : t==="C"
      ? "貴單位是否會遇到資料過期、民眾回報錯誤、資源清單需要更新，或使用者查不到資料時需要人工整理的情況？"
      : "貴單位是否常遇到民眾、家長、會員或參與者重複詢問課程、活動、報名方式、繳費、證明、服務流程或 FAQ，需要窗口反覆說明？";

  return `您好，我是黃元逸 Eason，目前以 Eason Systems 承接小型 LINE / Web 工具開發。

我主要協助協會、課程單位與服務型組織，把民眾常問的問題、服務流程、報名入口、據點資訊或 FAQ，整理成 LINE / Web 上可以自助查詢的入口，減少窗口重複回覆。

我做過公共廁所查詢 LINE Bot，累積超過 3 萬名使用者；近期也有野生動物救傷中心查詢 LINE Bot 的外部合作案。這類系統的重點不是單純做網頁，而是把使用者「找不到、問錯人、重複問」的資訊整理成可查詢的服務入口。

我這次是從${source}看到貴單位相關資訊${context ? `，也注意到可能有${context}相關內容` : ""}。想初步請教，${question}

若方向適合，我可以再依貴單位實際流程評估是否適合做「${product}」的小型第一版。前期簡單了解需求不收費；正式功能規劃、流程設計、系統開發、部署與上線協助會依實際範圍報價。

案例參考：公共廁所查詢 LINE Bot / Dashboard
https://toilet-mvp-dev.vercel.app/#media

服務網站：
https://eason-systems.vercel.app/

${easonSignature}`;
}

function buildFollowUpEmailBody(lead={}){
  return `您好，我是黃元逸 Eason，前幾天有寄信向貴單位詢問 LINE / Web 自助查詢、服務導覽或 FAQ 分流相關需求，這封想簡單確認是否有機會進一步了解。

我這邊主要不是取代貴單位既有官網、表單或後台，而是協助整理使用者查詢入口，讓民眾、會員、家長或參與者先自行找到正確資訊，減少窗口重複回覆。

如果貴單位目前確實有「資訊分散、重複詢問、服務流程不易查、據點或資源不好找」這類情況，我可以再依實際流程評估小型第一版範圍；正式功能規劃與開發會依範圍報價。

案例參考：公共廁所查詢 LINE Bot，累積超過 3 萬名使用者，並有後台 Dashboard 與查詢資料整理：
https://toilet-mvp-dev.vercel.app/#media

謝謝您。

${easonSignature}`;
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
function gmailSearchUrl(query=""){
  return `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query||"")}`;
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

const pasteTemplate = `單位名稱	類型	Email	主推產品	客戶方案	可能需求	客戶在幹嘛	痛點類型	痛點證據	為什麼可能付錢	信服力來源	商機等級	下一步承諾	預計聯絡日	優先度	來源	備註
範例協會	公益/社福	hello@example.com	資源 / 據點查詢系統	資源 / 據點查詢系統｜第一版｜NT$ 50,000 起	民眾常問服務流程與據點資訊，可做 LINE / Web 自助查詢入口	提供民眾服務與資源轉介	資訊分散	官網服務資訊分散在多個頁面，使用者需要人工詢問窗口	節省人工重複回覆	公廁 LINE Bot 3 萬+ 使用者可類比	B｜中度商機｜有痛點但預算/時程未確認	無明確下一步	2026-05-30	高	官網聯絡頁	示範：不要只寫有活動，要寫清楚痛點與付費理由`;

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

function normalizeDuplicateText(v=""){
  return String(v||"")
    .trim()
    .replace(/https?:\/\/\S+/g,"")
    .replace(/[\s\-＿_.,，。:：;；/\\|()（）【】\[\]「」『』·・•]+/g,"")
    .replace(/股份有限公司|有限公司|基金會|協會|學會|社團法人|財團法人|合作社|工作室|公司|官方網站|官網/g,"")
    .toLowerCase();
}
function emailKeyForDuplicate(v=""){
  return String(v||"").trim().toLowerCase();
}
function emailDomainForDuplicate(v=""){
  const email=emailKeyForDuplicate(v);
  const m=email.match(/@([^@\s>]+)$/);
  if(!m) return "";
  const domain=m[1].replace(/[>）)\].,，。]+$/g,"");
  const common=["gmail.com","yahoo.com","yahoo.com.tw","hotmail.com","outlook.com","icloud.com","msa.hinet.net"];
  return common.includes(domain)?"":domain;
}
function domainFromTextForDuplicate(v=""){
  const raw=String(v||"").trim().toLowerCase();
  if(!raw) return "";
  const url=raw.match(/https?:\/\/([^\/\s]+)/);
  if(url) return url[1].replace(/^www\./,"").replace(/[>）)\].,，。]+$/g,"");
  const email=raw.match(/[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})/i);
  if(email) return email[1].replace(/^www\./,"");
  const plain=raw.match(/(?:www\.)?([a-z0-9-]+\.)+[a-z]{2,}/i);
  if(plain) return plain[0].replace(/^www\./,"").replace(/[>）)\].,，。]+$/g,"");
  return "";
}
function isSimilarDuplicateName(a="", b=""){
  const x=normalizeDuplicateText(a);
  const y=normalizeDuplicateText(b);
  if(!x || !y) return false;
  if(x===y) return true;
  if(x.length>=4 && y.length>=4 && (x.includes(y) || y.includes(x))) return true;
  return false;
}
function duplicateReasonsForLead(newLead={}, existingLead={}){
  const reasons=[];
  const newEmail=emailKeyForDuplicate(newLead.email);
  const oldEmail=emailKeyForDuplicate(existingLead.email);
  if(newEmail && oldEmail && newEmail===oldEmail) reasons.push("Email 完全相同");

  const newName=normalizeDuplicateText(newLead.name);
  const oldName=normalizeDuplicateText(existingLead.name);
  if(newName && oldName && newName===oldName) reasons.push("單位名稱相同");
  else if(isSimilarDuplicateName(newLead.name, existingLead.name)) reasons.push("單位名稱相近");

  const newEmailDomain=emailDomainForDuplicate(newLead.email);
  const oldEmailDomain=emailDomainForDuplicate(existingLead.email);
  if(newEmailDomain && oldEmailDomain && newEmailDomain===oldEmailDomain){
    reasons.push("Email 網域相同");
  }

  const newSourceDomain=domainFromTextForDuplicate(newLead.source || newLead.notes);
  const oldSourceDomain=domainFromTextForDuplicate(existingLead.source || existingLead.notes);
  if(newSourceDomain && oldSourceDomain && newSourceDomain===oldSourceDomain){
    reasons.push("來源 / 網站網域相同");
  }

  const newContact=normalizeDuplicateText(newLead.contact);
  const oldContact=normalizeDuplicateText(existingLead.contact);
  if(newContact && oldContact && newContact.length>=2 && newContact===oldContact){
    reasons.push("聯絡人相同");
  }

  return Array.from(new Set(reasons));
}
function findImportDuplicateReports(imported=[], existing=[]){
  const existingNormal=existing.filter(l=>!isPrepItem(l));
  const reports=[];
  const previousImported=[];
  for(const item of imported){
    if(isPrepItem(item)){
      previousImported.push({...item,__duplicateSource:"本次貼上"});
      continue;
    }
    const matches=[];
    for(const old of [...existingNormal, ...previousImported]){
      const reasons=duplicateReasonsForLead(item, old);
      if(reasons.length){
        matches.push({
          id:old.id,
          name:old.name||"未命名單位",
          email:old.email||"",
          status:old.status||"",
          sentDate:old.sentDate||"",
          actualFollowUpDate:old.actualFollowUpDate||"",
          followUpDate:old.followUpDate||"",
          source:old.source||old.__duplicateSource||"CRM 既有資料",
          reasons,
          isNewImport:Boolean(old.__duplicateSource)
        });
      }
    }
    if(matches.length) reports.push({importedId:item.id, imported:item, matches});
    previousImported.push({...item,__duplicateSource:"本次貼上"});
  }
  return reports;
}
function isRepliedLead(l={}){
  return ["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","待主管評估","留存參考","需求確認中","已約討論","洽談中","已報價","報價後停滯","談合約","進行中","成交","無需求","內部無需求但可能有實習機會","未成交"].includes(l.status);
}
function isEffectiveOpportunity(l={}){
  return (l.opportunityLevel || getLeadQuality(l)).startsWith("A");
}

function isRejectedOrNoNeed(l={}){
  return ["無需求","內部無需求但可能有實習機會","未成交"].includes(l.status);
}
function replyCategory(l={}){
  if(["留存參考"].includes(l.status)) return "留存參考";
  if(["無需求"].includes(l.status)) return "無需求";
  if(["內部無需求但可能有實習機會"].includes(l.status)) return "無需求但可能有實習機會";
  if(["未成交"].includes(l.status)) return "未成交";
  if(isEffectiveOpportunity(l)) return "真商機";
  return "其他回覆";
}

function leadReplyText(l={}){
  return [l.name,l.lastReply,l.nextAction,l.notes].join(" ");
}
function autoReplyClassification(l={}){
  if(isPrepItem(l)) return null;
  const raw=leadReplyText(l);
  if(!raw.trim()) return null;
  const noNeedRe=/(目前|現階段|近期|暫時).{0,8}(沒有|無).{0,6}需求|沒有這樣的需求|不需要|不適用|已有既定|既定作業方式|無額外.{0,6}預算|沒有預算|婉謝|謝絕/;
  const supervisorRe=/(主管|總幹事|方若嘉|方總|報告主管|轉述.{0,8}主管|轉述.{0,8}總幹事|主管.{0,8}評估)/;
  const discussionRe=/(內部.{0,8}(評估|討論)|評估中|討論中|相關部門.{0,8}(討論|評估)|轉.{0,8}部門.{0,8}(討論|評估))/;
  const referenceRe=/(先[瞭了]解|留存參考|先行參考|先參考|如有需要.{0,12}聯繫|有需要.{0,12}再.{0,12}聯繫|未來.{0,12}需求.{0,12}聯繫|轉知.{0,12}相關.{0,12}人員|轉知.{0,12}工作人員|負責.{0,12}同仁.{0,12}主動聯繫)/;

  if(noNeedRe.test(raw)) return {status:"無需求", nextAction:"對方已明確表示目前無需求或不適用；不再主動追蹤。", reason:"明確無需求"};
  if(supervisorRe.test(raw)) return {status:"待主管評估", followUpDate:internalDiscussionDate(today()), nextAction:`對方已轉主管 / 總幹事評估；${internalDiscussionDate(today())} 再檢查是否需要短版追蹤。`, reason:"待主管評估"};
  if(discussionRe.test(raw)) return {status:"內部討論中", followUpDate:internalDiscussionDate(today()), nextAction:`對方表示內部討論 / 評估；${internalDiscussionDate(today())} 再檢查是否需要短版追蹤。`, reason:"內部討論 / 評估"};
  if(referenceRe.test(raw)) return {status:"留存參考", nextAction:"留存參考，不排追蹤；若未來有新切入點再聯繫。", reason:"留存參考"};
  return null;
}
function shouldAutoReclassifyLead(l={}, classification=null){
  if(!classification || isPrepItem(l)) return false;
  const protectedStatuses=["已加 LINE","LINE 洽談中","需求確認中","已約討論","洽談中","已報價","報價後停滯","談合約","進行中","成交","內部無需求但可能有實習機會","未成交","已放棄"];
  if(protectedStatuses.includes(l.status)) return false;
  return l.status !== classification.status;
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
  if(l.focusFit) return l.focusFit;
  const text=[l.name,l.type,l.need,l.projectPlan,l.notes,l.mainProduct,l.painPointType,l.painPointEvidence].join(" ");
  if(/回報|缺口|錯誤|過期|補資料|資料更新/.test(text)) return "資料回報 / 缺口整理";
  if(/據點|資源|地圖|定位|位置|多據點|服務點|救傷中心|合作店家|會員機構/.test(text)) return "資源 / 據點查詢";
  if(/課程|活動|營隊|報名|繳費|證書|積分|FAQ|常見問題|流程導覽/.test(text)) return "課程 / 活動入口";
  if(/LINE|查詢|導覽|自助|入口/.test(text)) return "查詢 / 導覽 / FAQ 主線";
  if(/CRM|後台|管理工具|網頁|Landing/.test(text)) return "泛用後台 / CRM 待驗證";
  return "其他";
}

function inferLeadQuality(l={}){
  if(l.opportunityLevel) return l.opportunityLevel;
  if(["成交","談合約","已報價","洽談中","已約討論","需求確認中","LINE 洽談中"].includes(l.status)) return "A｜真商機｜有痛點＋明確下一步";
  if(["無需求","未成交","無回覆暫放","已放棄","留存參考"].includes(l.status)) return "D｜假商機 / 無需求 / 暫放";
  const text=[l.name,l.type,l.need,l.projectPlan,l.notes,l.mainProduct,l.painPointType,l.painPointEvidence,l.whyPay,l.nextCommitment].join(" ");
  const hasPain=/重複詢問|資訊分散|不好查|報名流程|資料過期|查不到|自助查詢|痛點|人工|窗口|FAQ|據點|資源/.test(text);
  const hasCommitment=/已約會議|提供資料|回覆報價|確認功能|確認預算|確認時程|主管討論/.test(text);
  if(hasPain && hasCommitment) return "A｜真商機｜有痛點＋明確下一步";
  if(hasPain) return "B｜中度商機｜有痛點但預算/時程未確認";
  if(["對方已回覆","願意交流","後續回信中","內部討論中","待主管評估"].includes(l.status)) return "C｜低度商機｜有興趣但沒有承諾";
  return "C｜低度商機｜有興趣但沒有承諾";
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
  return {id:crypto.randomUUID(), name:"", type:"其他", email:"", contact:"", source:"", status:"未聯絡", plannedContactDate:date, sentDate:"", followUpDate:"", actualFollowUpDate:"", projectPlan:"", mainProduct:"", painPointType:"", painPointEvidence:"", whyPay:"", credibilitySource:"", opportunityLevel:"", nextCommitment:"", customerBusiness:"", customerUsers:"", doNotPromise:"", estimatedAmount:"", receivedAmount:"", expectedClose:"", workDate:"", workTask:"", deliveryDate:"", deliveryNote:"", leadQuality:"", focusFit:"", need:"", lastReply:"", nextAction:"", notes:"", completed:false, completedDate:"", completedDates:{}};
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
  if(!l || !date) return false;
  return Boolean(
    l?.completedDates?.[date] ||
    (l?.completed && l?.completedDate === date) ||
    (!isPrepItem(l) && (l?.sentDate === date || l?.actualFollowUpDate === date))
  );
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

  // 實際補追日期要直接吃 actualFollowUpDate，不需要另外點「達成」才算在日期上。
  if(!isPrepItem(l) && l.actualFollowUpDate === date) return true;

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
      return {...p,status:v,followUpDate:internalDiscussionDate(now),nextAction:`對方表示內部討論 / 評估；${internalDiscussionDate(now)} 再檢查是否需要短版追蹤。`};
    }
    if(v==="待主管評估"){
      return {...p,status:v,followUpDate:internalDiscussionDate(now),nextAction:`對方已轉主管 / 總幹事評估；${internalDiscussionDate(now)} 再檢查是否需要短版追蹤。`};
    }
    if(v==="留存參考"){
      return {...p,status:v,followUpDate:"",nextAction:"留存參考，不排追蹤；若未來有新切入點再聯繫。"};
    }
    if(v==="內部無需求但可能有實習機會"){
      return {...p,status:v,leadQuality:p.leadQuality||"D｜假商機 / 無需求 / 暫放",opportunityLevel:p.opportunityLevel||"D｜假商機 / 無需求 / 暫放",followUpDate:"",nextAction:"內部暫無合作需求，但可能有實習機會；之後可整理履歷 / 作品集再聯繫。"};
    }
    if(v==="無需求"){
      return {...p,status:v,opportunityLevel:"D｜假商機 / 無需求 / 暫放",leadQuality:"D｜假商機 / 無需求 / 暫放",followUpDate:"",nextAction:"對方已回覆目前暫無需求，不再主動追蹤；之後若有新需求再聯繫。"};
    }
    if(v==="未成交"){
      return {...p,status:v,opportunityLevel:"D｜假商機 / 無需求 / 暫放",leadQuality:"D｜假商機 / 無需求 / 暫放",followUpDate:"",nextAction:"對方已回覆但未成交，先結案不再追蹤。"};
    }
    if(v==="報價後停滯"){
      return {...p,status:v,opportunityLevel:"C｜低度商機｜有興趣但沒有承諾",leadQuality:"C｜低度商機｜有興趣但沒有承諾",nextCommitment:"報價後停滯",followUpDate:"",nextAction:"報價後停滯；只做一次收口確認，若無回覆就暫放。"};
    }
    if(v==="已放棄"){
      return {...p,status:v,opportunityLevel:"D｜假商機 / 無需求 / 暫放",leadQuality:"D｜假商機 / 無需求 / 暫放",focusFit:"不符合",followUpDate:"",nextAction:"非目前主攻方向或不適合開發，主動暫停追蹤。"};
    }
    return {...p,status:v};
  });
  return <Modal onClose={onCancel}><div><p className="text-sm font-semibold text-blue-600">Lead Editor</p><h2 className="mt-1 text-2xl font-bold text-slate-950">編輯項目</h2></div><div className="mt-6 grid gap-4 md:grid-cols-2">
    <Input label="單位 / 項目名稱" value={f.name} onChange={v=>u("name",v)}/>
    <Input label="Email" value={f.email} onChange={v=>u("email",v)}/>
    <SelectBox label="類型" value={f.type} options={typeOptions} onChange={v=>u("type",v)}/>
    <SelectBox label="狀態" value={f.status} options={statusOptions} onChange={handleStatusChange}/>
    <SelectBox label="商機等級（嚴格，不把留存參考當有效）" value={f.opportunityLevel || f.leadQuality || inferLeadQuality(f)} options={opportunityLevelOptions} onChange={v=>{u("opportunityLevel",v); u("leadQuality",v);}}/>
    <SelectBox label="主線匹配度 / 產品方向" value={f.focusFit || inferFocusFit(f)} options={focusFitOptions} onChange={v=>u("focusFit",v)}/>
    <Input label="聯絡人 / 窗口" value={f.contact} onChange={v=>u("contact",v)}/>
    <SelectCustom label="來源 / 公開頁面" value={f.source} options={sourceOptions} onChange={v=>u("source",v)}/>
    <SelectCustom label="主推產品" value={f.mainProduct} options={mainProductOptions} onChange={v=>u("mainProduct",v)} placeholder="例如：LINE / Web 自助查詢入口"/>
    <SelectCustom label="客戶方案（不是泛用網頁 / 後台，先選可賣第一版）" value={f.projectPlan} options={planOptions} onChange={v=>u("projectPlan",v)} placeholder="例如：FAQ / 服務流程導覽第一版"/>
    <SelectCustom label="客戶痛點類型" value={f.painPointType} options={painPointTypeOptions} onChange={v=>u("painPointType",v)} placeholder="例如：重複詢問 / 資訊分散"/>
    <SelectCustom label="為什麼可能付錢" value={f.whyPay} options={whyPayOptions} onChange={v=>u("whyPay",v)} placeholder="例如：節省人工重複回覆"/>
    <SelectCustom label="信服力來源" value={f.credibilitySource} options={credibilityOptions} onChange={v=>u("credibilitySource",v)} placeholder="例如：公廁 LINE Bot 3 萬+ 使用者可類比"/>
    <SelectCustom label="下一步承諾" value={f.nextCommitment} options={nextCommitmentOptions} onChange={v=>u("nextCommitment",v)} placeholder="例如：已約會議 / 要提供資料 / 無明確下一步"/>
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
    <Area label="單位在幹嘛（開會前必填，避免不知道對方業務）" value={f.customerBusiness} onChange={v=>u("customerBusiness",v)}/>
    <Area label="主要使用者 / 服務對象" value={f.customerUsers} onChange={v=>u("customerUsers",v)}/>
    <Area label="痛點證據（從官網、LINE、FAQ、報名頁看到什麼，不可空泛）" value={f.painPointEvidence} onChange={v=>u("painPointEvidence",v)}/>
    <Area label="不能承諾 / 不能亂賣的範圍" value={f.doNotPromise} onChange={v=>u("doNotPromise",v)}/>
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
      {mode==="lead"?"名單欄位：單位名稱、類型、Email、主推產品、客戶方案、可能需求、客戶在幹嘛、痛點類型、痛點證據、為什麼可能付錢、信服力來源、商機等級、下一步承諾、預計聯絡日、優先度、來源、備註。舊 9 欄格式仍可貼上。":"準備事項欄位：準備事項、安排日期、準備內容、下一步、備註。"}
    </div>
    <textarea value={text} onChange={e=>setText(e.target.value)} rows={16} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm outline-none focus:border-blue-400"/>
    <div className="mt-6 flex justify-end gap-3">
      <button onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3">取消</button>
      <button onClick={()=>onImport(text,mode)} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white">{mode==="lead"?"匯入名單":"匯入準備事項"}</button>
    </div>
  </Modal>
}


function DuplicateImportReviewModal({review,onConfirm,onCancel}){
  const duplicateIds=useMemo(()=>new Set((review?.duplicateReports||[]).map(r=>r.importedId)),[review]);
  const [includeDuplicateIds,setIncludeDuplicateIds]=useState([]);
  if(!review) return null;
  const includedSet=new Set(includeDuplicateIds);
  const duplicateReports=review.duplicateReports||[];
  const safeCount=(review.imported||[]).filter(item=>!duplicateIds.has(item.id)).length;
  const selectedDuplicateCount=includeDuplicateIds.length;
  const finalCount=safeCount+selectedDuplicateCount;
  const toggle=(id)=>setIncludeDuplicateIds(cur=>cur.includes(id)?cur.filter(x=>x!==id):[...cur,id]);
  const confirmSelected=()=>{
    const next=(review.imported||[]).filter(item=>!duplicateIds.has(item.id)||includedSet.has(item.id));
    onConfirm(next);
  };
  const confirmAll=()=>onConfirm(review.imported||[]);
  return <Modal onClose={onCancel}>
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-semibold text-amber-600">Duplicate Review</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">一鍵貼上前先檢查疑似重複</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">這次共讀到 {review.imported?.length||0} 筆，其中 {duplicateReports.length} 筆疑似重複。系統會先保留不重複的 {safeCount} 筆；疑似重複的項目需要你勾選後才會一起匯入。</p>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        會比對：Email、單位名稱、聯絡人、Email 網域、來源網站 / 網域，以及本次貼上內部是否重複。
      </div>
    </div>

    <div className="mt-6 max-h-[54vh] space-y-4 overflow-y-auto pr-2">
      {duplicateReports.map((report,idx)=><div key={report.importedId} className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={includedSet.has(report.importedId)} onChange={()=>toggle(report.importedId)} className="mt-1 h-5 w-5 rounded border-amber-300"/>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700">疑似重複 #{idx+1}</p>
                <p className="mt-1 text-lg font-bold text-slate-950">{report.imported.name||"未命名單位"}</p>
                <p className="mt-1 text-sm text-slate-600">{report.imported.email||"沒有 Email"}・{report.imported.type||"其他"}</p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${includedSet.has(report.importedId)?"bg-blue-100 text-blue-700":"bg-slate-200 text-slate-600"}`}>{includedSet.has(report.importedId)?"會匯入這筆":"預設略過這筆"}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {report.matches.map((m,i)=><div key={`${m.id}-${i}`} className="rounded-2xl border border-amber-200 bg-white p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">已存在 / 相近：{m.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{m.email||"沒有 Email"}・{m.status||"無狀態"}</p>
                  </div>
                  <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{m.isNewImport?"本次貼上內重複":"CRM 既有資料"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.reasons.map(reason=><span key={reason} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{reason}</span>)}
                </div>
                <div className="mt-3 grid gap-1 text-xs leading-5 text-slate-500 md:grid-cols-3">
                  <p>寄出日：{m.sentDate||"尚未寄出"}</p>
                  <p>補追日：{m.actualFollowUpDate||"尚未補追"}</p>
                  <p>追蹤日：{m.followUpDate||"無"}</p>
                </div>
              </div>)}
            </div>
          </div>
        </label>
      </div>)}
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
      即將匯入：不重複 {safeCount} 筆 + 已勾選疑似重複 {selectedDuplicateCount} 筆 = 共 {finalCount} 筆。
    </div>

    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button onClick={onCancel} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">取消匯入</button>
      <button onClick={confirmSelected} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">匯入不重複＋已勾選</button>
      <button onClick={confirmAll} className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-400">全部仍然匯入</button>
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
    setSubject(next==="followUp" ? "" : emailSubjectForTemplate(next));
    setBody(buildOutreachEmailBody(lead, next));
  };
  const isFollowUp = template === "followUp";
  const finishAfterOpen=(actionType=isFollowUp?"followUp":"sent")=>{
    if(!scheduleDate) return false;
    onMarkScheduled(lead.id, scheduleDate, scheduleTime, actionType);
    const actionLabel = actionType==="followUp" ? "已補追" : "已寄出";
    if(queueTotal>1 && queuePosition < queueTotal-1){
      setNotice(`已開啟 Gmail，並已在 CRM 標記為${actionLabel}：${scheduleDate} ${scheduleTime}；日期已計為達成。即將跳到下一筆…`);
      setTimeout(()=>onNext?.(), 1200);
    }else{
      setNotice(`已開啟 Gmail，並已在 CRM 標記為${actionLabel}：${scheduleDate} ${scheduleTime}；日期已計為達成。即將關閉…`);
      setTimeout(()=>onClose?.(), 1500);
    }
    return true;
  };
  const openFollowUpThread=async()=>{
    if(!lead.email) return alert("這筆名單沒有 Email，不能搜尋上次信件。");
    if(!scheduleDate) return alert("請先設定補追日期。");
    await copyText(body);
    window.open(gmailSearchUrl(`in:sent to:${lead.email}`), "_blank", "noopener,noreferrer");
    finishAfterOpen("followUp");
  };
  const openFull=()=>{
    if(isFollowUp) return openFollowUpThread();
    if(!lead.email) return alert("這筆名單沒有 Email，不能開 Gmail。");
    if(!scheduleDate) return alert("請先設定寄出日期。");
    window.open(gmailComposeUrl({to:lead.email, subject, body}), "_blank", "noopener,noreferrer");
    finishAfterOpen("sent");
  };
  const openSafe=async()=>{
    if(isFollowUp) return openFollowUpThread();
    if(!lead.email) return alert("這筆名單沒有 Email，不能開 Gmail。");
    if(!scheduleDate) return alert("請先設定寄出日期。");
    await copyText(body);
    window.open(gmailComposeUrl({to:lead.email, subject, body}), "_blank", "noopener,noreferrer");
    finishAfterOpen("sent");
  };
  const copyBodyOnly=async()=>{
    const ok=await copyText(body);
    setNotice(ok?"已複製內文。":"複製失敗，請手動全選內文複製。");
  };
  const mark=()=>{
    if(!scheduleDate) return alert(isFollowUp ? "請先設定補追日期。" : "請先設定寄出日期。");
    finishAfterOpen(isFollowUp ? "followUp" : "sent");
  };
  return <Modal onClose={onClose}>
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-sm font-semibold text-blue-600">Outreach Assistant</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">寄信助手</h2>
        <p className="mt-2 text-sm text-slate-500">{queueTotal>1?`批次第 ${queuePosition+1} / ${queueTotal} 筆｜`:""}{lead.name||"未命名單位"}・{lead.email||"尚未填 Email"}</p>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        {isFollowUp ? "追蹤信模式不另外開新主旨；會先複製追蹤內文，並開啟 Gmail 寄件備份搜尋。請點進上次那封信按回覆後貼上送出。CRM 會以補追日期計為達成。" : "按下開 Gmail 後，系統會同時把這筆 CRM 標記為已寄出，並以左側設定的寄出日期計為當天達成；是否真的寄出仍以 Gmail 畫面為準。"}
      </div>
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <label className="block"><span className="text-sm font-medium text-slate-700">模板</span><select value={template} onChange={e=>changeTemplate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400">{outreachTemplateOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
      <label className="block"><span className="text-sm font-medium text-slate-700">收件人</span><input value={lead.email||""} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"/></label>
      <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-700">主旨</span><input value={isFollowUp ? "追蹤回覆模式不使用新主旨，請接在上次那封信下面回覆" : subject} disabled={isFollowUp} onChange={e=>setSubject(e.target.value)} className={`mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 ${isFollowUp ? "bg-slate-50 text-slate-500" : "bg-white"}`}/></label>
      <label className="block"><span className="text-sm font-medium text-slate-700">{isFollowUp ? "CRM 記錄補追日期（會用這天計為達成）" : "CRM 記錄寄出日期（點開 Gmail 後會用這天計為達成）"}</span><input type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
      <label className="block"><span className="text-sm font-medium text-slate-700">建議排程時間</span><input type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label>
      <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-700">內文，可先編輯再開 Gmail</span><textarea value={body} onChange={e=>setBody(e.target.value)} rows={18} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-blue-400"/></label>
    </div>

    {notice&&<div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>}

    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button onClick={copyBodyOnly} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">只複製內文</button>
      <button onClick={openSafe} className="rounded-2xl border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50">{isFollowUp ? "搜尋上次信件＋複製追蹤內文＋標記已補追" : "開 Gmail（含內文）＋複製備份＋標記已寄出"}</button>
      {!isFollowUp&&<button onClick={openFull} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">開 Gmail（含內文）＋標記已寄出</button>}
      <button onClick={mark} className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">{isFollowUp ? "不開 Gmail，只標記已補追" : "不開 Gmail，只標記已寄出"}</button>
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
  const [duplicateReview,setDuplicateReview]=useState(null);
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
  const [bulkActualFollowUpDate,setBulkActualFollowUpDate]=useState("");
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
    const repliedStatuses=["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","待主管評估","留存參考","需求確認中","已約討論","洽談中","已報價","報價後停滯","談合約","進行中","成交","無需求","內部無需求但可能有實習機會","未成交"];
    const rejectedStatuses=["無需求","內部無需求但可能有實習機會","未成交"];
    const replied=normal.filter(l=>repliedStatuses.includes(l.status)).length;
    const activeOpportunity=normal.filter(l=>(l.opportunityLevel || getLeadQuality(l)).startsWith("A")).length;
    const rejected=normal.filter(l=>rejectedStatuses.includes(l.status)).length;
    const quoted=normal.filter(l=>["已報價","報價後停滯","洽談中","談合約","進行中","成交"].includes(l.status)).length;
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
        description:"包含對方已回覆、後續回信中、已加 LINE、LINE 洽談中、內部討論中、待主管評估、留存參考、需求確認中、已約討論、洽談中、已報價、談合約、進行中、成交、無需求、內部無需求但可能有實習機會、未成交。",
        items:normal.filter(l=>["對方已回覆","願意交流","後續回信中","已加 LINE","LINE 洽談中","內部討論中","待主管評估","留存參考","需求確認中","已約討論","洽談中","已報價","報價後停滯","談合約","進行中","成交","無需求","內部無需求但可能有實習機會","未成交"].includes(l.status))
      },
      active:{
        title:"真商機",
        description:"只統計 A｜真商機：有具體痛點，而且已有明確下一步、功能確認、報價、會議、預算/時程或合約推進。留存參考、轉知、問問看都不算。",
        items:normal.filter(l=>(l.opportunityLevel || getLeadQuality(l)).startsWith("A"))
      },
      rejected:{
        title:"無需求 / 未成交",
        description:"已明確無合作需求、留存參考後暫放，或已結案未成交的名單。",
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

  const autoReclassifyCandidates=useMemo(()=>leads
    .map(l=>({lead:l, classification:autoReplyClassification(l)}))
    .filter(x=>shouldAutoReclassifyLead(x.lead,x.classification)),[leads]);

  const autoReclassifySummary=useMemo(()=>{
    const counts={};
    for(const item of autoReclassifyCandidates){
      const key=item.classification?.status || "其他";
      counts[key]=(counts[key]||0)+1;
    }
    return Object.entries(counts).map(([k,v])=>`${k} ${v} 筆`).join("、");
  },[autoReclassifyCandidates]);

  const autoReclassifyReplies=()=>{
    if(!autoReclassifyCandidates.length) return alert("目前沒有偵測到需要自動重分的回覆狀態。");
    const summary=autoReclassifySummary || `${autoReclassifyCandidates.length} 筆`;
    if(!confirm(`系統偵測到 ${autoReclassifyCandidates.length} 筆可能需要重分狀態：${summary}\n\n會依回覆文字把「轉主管 / 討論中」與「轉知 / 留存參考 / 如有需要再聯繫」分開。確定套用嗎？`)) return;
    const targetMap=new Map(autoReclassifyCandidates.map(x=>[x.lead.id,x.classification]));
    commitLeads(cur=>cur.map(x=>{
      const c=targetMap.get(x.id);
      if(!c) return x;
      const nextFollow = c.status==="內部討論中" || c.status==="待主管評估" ? (x.followUpDate || c.followUpDate || internalDiscussionDate(today())) : "";
      const newOpportunity = c.status==="無需求" || c.status==="留存參考" ? "D｜假商機 / 無需求 / 暫放" : c.status==="內部討論中" || c.status==="待主管評估" ? "C｜低度商機｜有興趣但沒有承諾" : (x.opportunityLevel || x.leadQuality || inferLeadQuality(x));
      return {
        ...x,
        status:c.status,
        opportunityLevel:newOpportunity,
        leadQuality:newOpportunity,
        followUpDate:nextFollow,
        nextAction:c.nextAction || x.nextAction,
        notes:`${x.notes||""}${x.notes?"\n":""}${today()}：系統依回覆文字自動重分狀態為「${c.status}」（${c.reason}）`
      };
    }), `自動重分回覆狀態 ${autoReclassifyCandidates.length} 筆`);
    setSelected(autoReclassifyCandidates.map(x=>x.lead.id));
    setShowLeadsAll(true);
  };

  const filteredLeads=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return leads.filter(l=>{
      if(isPrepItem(l)) return false;
      const mq=!q||[l.name,l.email,l.type,getLeadQuality(l),getFocusFit(l),l.mainProduct,l.projectPlan,l.painPointType,l.painPointEvidence,l.whyPay,l.credibilitySource,l.nextCommitment,l.customerBusiness,l.customerUsers,l.doNotPromise,l.need,l.notes,l.lastReply,l.nextAction,l.actualFollowUpDate].join(" ").toLowerCase().includes(q);
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
    const allowedStatuses=["已報價","報價後停滯","談合約","洽談中"];
    const quoted=leads.filter(l=>{
      if(isPrepItem(l)) return false;
      if(!allowedStatuses.includes(l.status)) return false;
      if(status!=="全部" && l.status!==status) return false;
      if(type!=="全部" && l.type!==type) return false;
      if(quality!=="全部" && getLeadQuality(l)!==quality) return false;
      if(focusFit!=="全部" && getFocusFit(l)!==focusFit) return false;
      const mq=!q||[l.name,l.email,l.type,getLeadQuality(l),getFocusFit(l),l.mainProduct,l.projectPlan,l.painPointType,l.painPointEvidence,l.whyPay,l.credibilitySource,l.nextCommitment,l.customerBusiness,l.customerUsers,l.doNotPromise,l.need,l.notes,l.lastReply,l.nextAction,l.actualFollowUpDate,l.contact].join(" ").toLowerCase().includes(q);
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
  const markEmailScheduled=(id, date, time="09:10", actionType="sent")=>{
    if(!id || !date) return;
    const follow=nextFollowUpDate(date);
    commitLeads(cur=>cur.map(x=>{
      if(x.id!==id) return x;
      const completedDates={...(x.completedDates||{}),[date]:true};
      if(actionType==="followUp"){
        return {
          ...x,
          status:"已追蹤一次",
          actualFollowUpDate:date,
          followUpDate:"",
          nextAction:`已於 ${date} 補寄 / 追蹤；後續等回覆，暫不安排下一次追蹤。`,
          completed:true,
          completedDate:date,
          completedDates,
          notes:`${x.notes||""}${x.notes?"\n":""}${today()}：已用寄信助手開啟 Gmail 上次信件搜尋，並以 ${date} ${time} 標記為已補追 / 已達成`
        };
      }
      return {
        ...x,
        status:"已寄信",
        sentDate:date,
        followUpDate:follow,
        nextAction:"第一次寄出後 3 個工作日追蹤一次",
        completed:true,
        completedDate:date,
        completedDates,
        notes:`${x.notes||""}${x.notes?"\n":""}${today()}：已用寄信助手開啟 Gmail，並以 ${date} ${time} 標記為已寄出 / 已達成；追蹤日 ${follow}`
      };
    }), actionType==="followUp" ? `寄信助手標記已補追：${date} ${time}` : `寄信助手標記已寄出：${date} ${time}`);
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
      return {...x,status:v,followUpDate:internalDiscussionDate(now),nextAction:`對方表示內部討論 / 評估；${internalDiscussionDate(now)} 再檢查是否需要短版追蹤。`};
    }
    if(v==="待主管評估"){
      return {...x,status:v,followUpDate:internalDiscussionDate(now),nextAction:`對方已轉主管 / 總幹事評估；${internalDiscussionDate(now)} 再檢查是否需要短版追蹤。`};
    }
    if(v==="留存參考"){
      return {...x,status:v,followUpDate:"",nextAction:"留存參考，不排追蹤；若未來有新切入點再聯繫。"};
    }
    if(v==="願意交流"){
      return {...x,status:v,followUpDate:"",nextAction:"對方願意交流或提供具體回饋，先補充背景與案例，後續視對方回覆再推進。"};
    }
    if(v==="內部無需求但可能有實習機會"){
      return {...x,status:v,opportunityLevel:x.opportunityLevel||"D｜假商機 / 無需求 / 暫放",leadQuality:x.leadQuality||"D｜假商機 / 無需求 / 暫放",followUpDate:"",nextAction:"內部暫無合作需求，但可能有實習機會；之後可整理履歷 / 作品集再聯繫。"};
    }
    if(v==="無需求"){
      return {...x,status:v,opportunityLevel:"D｜假商機 / 無需求 / 暫放",leadQuality:"D｜假商機 / 無需求 / 暫放",followUpDate:"",nextAction:"對方已回覆目前暫無需求，不再主動追蹤；之後若有新需求再聯繫。"};
    }
    if(v==="未成交"){
      return {...x,status:v,opportunityLevel:"D｜假商機 / 無需求 / 暫放",leadQuality:"D｜假商機 / 無需求 / 暫放",followUpDate:"",nextAction:"對方已回覆但未成交，先結案不再追蹤。"};
    }
    if(v==="報價後停滯"){
      return {...x,status:v,opportunityLevel:"C｜低度商機｜有興趣但沒有承諾",leadQuality:"C｜低度商機｜有興趣但沒有承諾",nextCommitment:"報價後停滯",followUpDate:"",nextAction:"報價後停滯；只做一次收口確認，若無回覆就暫放。"};
    }
    if(v==="已放棄"){
      return {...x,status:v,opportunityLevel:"D｜假商機 / 無需求 / 暫放",leadQuality:"D｜假商機 / 無需求 / 暫放",focusFit:"不符合",followUpDate:"",nextAction:"非目前主攻方向或不適合開發，主動暫停追蹤。"};
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
  const applyBulkActualFollowUpDate=()=>{
    if(!bulkActualFollowUpDate) return alert("請先選擇要套用的補追日期。");
    if(!selected.length) return alert("請先勾選要修改的名單。");
    const target=activeLeadIds(selected);
    if(!target.length) return alert("請先勾選客戶名單，不包含準備事項。");
    commitLeads(cur=>cur.map(x=>target.includes(x.id)?{
      ...x,
      actualFollowUpDate:bulkActualFollowUpDate,
      followUpDate:"",
      status:"已追蹤一次",
      nextAction:`已於 ${bulkActualFollowUpDate} 補寄 / 追蹤；後續等回覆，暫不安排下一次追蹤。`,
      completed:true,
      completedDate:bulkActualFollowUpDate,
      completedDates:{...(x.completedDates||{}),[bulkActualFollowUpDate]:true},
      notes:`${x.notes||""}${x.notes?"\n":""}${today()}：批次套用補追日期 ${bulkActualFollowUpDate}，並清空追蹤日`
    }:x),`批次套用補追日期 ${bulkActualFollowUpDate}`);
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
          l.type||"",
          l.status||"",
          hasSent ? "是" : "否",
          l.sentDate||"",
          hasFollowedUp ? "是" : "否",
          l.actualFollowUpDate||"",
          l.followUpDate||"",
          hasReplied ? "是" : "否",
          hasReplied ? replyCategory(l) : "尚未回覆",
          l.opportunityLevel || getLeadQuality(l),
          getFocusFit(l),
          l.mainProduct||"",
          l.projectPlan||"尚未設定方案",
          l.painPointType||"",
          l.painPointEvidence||"",
          l.whyPay||"",
          l.credibilitySource||"",
          l.nextCommitment||"",
          l.customerBusiness||"",
          l.customerUsers||"",
          l.doNotPromise||"",
          money(l.estimatedAmount),
          l.lastReply||"",
          l.nextAction||"",
          l.notes||""
        ];
      });
    if(!rows.length) return alert("目前沒有名單可以匯出。");
    downloadCsv(
      `名單追蹤總表_${today()}.csv`,
      ["單位名稱","Email","類型","狀態","是否已寄出","寄出日期","是否追蹤過","補追/追蹤日期","下一次追蹤日","是否回覆","回覆分類","商機等級","主線匹配度","主推產品","方案","痛點類型","痛點證據","為什麼可能付錢","信服力來源","下一步承諾","客戶在幹嘛","主要使用者","不能承諾","預計收益","回覆內容/對方反應","下一步","備註"],
      rows
    );
  };

  const finalizeImportedBatch=(items,mode="lead",batchId=`import-${Date.now()}`)=>{
    if(!items?.length){
      setDuplicateReview(null);
      return alert("沒有選擇任何要匯入的資料。");
    }
    const ids=items.map(x=>x.id);
    const firstDate=firstScheduleDate(items[0]);
    commitLeads(cur=>[...items,...cur],`批量匯入 ${items.length} 筆${mode==="prep"?"準備事項":"名單"}`);
    setLastImport({ids,count:items.length,mode,batchId,firstDate});
    setSelected(ids);
    setBulk(false);
    setDuplicateReview(null);
    if(mode==="prep") setShowPrepAll(true); else setShowLeadsAll(true);
    focusDate(firstDate);
    alert(`已匯入 ${items.length} 筆，已自動勾選並跳到 ${firstDate}。若貼錯，可按「復原上一步」或「刪除最近匯入」。`);
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
    const headerCells = hasHeader ? firstLine.split(String.fromCharCode(9)).map(x=>x.trim()) : [];
    const col = (c, names, fallbackIndex="")=>{
      if(hasHeader){
        const idx = names.map(n=>headerCells.indexOf(n)).find(i=>i>=0);
        if(idx>=0) return c[idx];
      }
      return fallbackIndex==="" ? "" : c[fallbackIndex];
    };
    const imported=mode==="prep"
      ? rows.filter(c=>c[0]||c[2]||c[3]).map(c=>{
          const name=col(c,["準備事項"],0);
          const date=col(c,["安排日期"],1);
          const need=col(c,["準備內容"],2);
          const nextAction=col(c,["下一步"],3);
          const notes=col(c,["備註"],4);
          const d=normalizeDate(date)||today();
          return {...prep(d),importBatchId:batchId,importedAt:today(),name:name?.trim()||"準備事項",followUpDate:d,need:need?.trim()||"",nextAction:nextAction?.trim()||need?.trim()||"待處理",notes:notes?.trim()||""};
        })
      : rows.filter(c=>c[0]||c[2]).map(c=>{
          const name=col(c,["單位名稱","單位"],0);
          const t=col(c,["類型"],1);
          const email=col(c,["Email","信箱"],2);
          const mainProduct=col(c,["主推產品","產品方向"],"");
          const plan=col(c,["客戶方案","方案"], hasHeader ? "" : 3);
          const need=col(c,["可能需求","需求"], hasHeader ? "" : 4);
          const customerBusiness=col(c,["客戶在幹嘛","單位在幹嘛","業務理解"],"");
          const painPointType=col(c,["痛點類型"],"");
          const painPointEvidence=col(c,["痛點證據"],"");
          const whyPay=col(c,["為什麼可能付錢","付費理由"],"");
          const credibilitySource=col(c,["信服力來源","案例支撐"],"");
          const opportunityLevel=col(c,["商機等級","名單品質"],"");
          const nextCommitment=col(c,["下一步承諾"],"");
          const date=col(c,["預計聯絡日","預計聯絡日期"], hasHeader ? "" : 5);
          const priority=col(c,["優先度"], hasHeader ? "" : 6);
          const source=col(c,["來源"], hasHeader ? "" : 7);
          const notes=col(c,["備註"], hasHeader ? "" : 8);
          const d=normalizeDate(date);
          const base={...emptyLead(d),importBatchId:batchId,importedAt:today(),name:name?.trim()||"未命名單位",type:typeOptions.includes(t?.trim())?t.trim():"其他",email:email?.trim()||"",mainProduct:mainProduct?.trim()||"",projectPlan:plan?.trim()||"",need:need?.trim()||"",customerBusiness:customerBusiness?.trim()||"",painPointType:painPointType?.trim()||"",painPointEvidence:painPointEvidence?.trim()||"",whyPay:whyPay?.trim()||"",credibilitySource:credibilitySource?.trim()||"",opportunityLevel:opportunityLevel?.trim()||"",nextCommitment:nextCommitment?.trim()||"",plannedContactDate:d,followUpDate:"",source:source?.trim()||"",notes:notes?.trim()||"",nextAction:d?`建議於 ${d} 第一次聯絡 / 私訊`:"待安排聯絡時間"};
          return {...base,leadQuality:opportunityLevel?.trim()||inferLeadQuality(base),focusFit:inferFocusFit(base)};
        });
    if(!imported.length) return alert(mode==="prep"?"沒有讀到可匯入的準備事項。":"沒有讀到可匯入的名單。");

    if(mode!=="prep"){
      const duplicateReports=findImportDuplicateReports(imported, leads);
      if(duplicateReports.length){
        setBulk(false);
        setDuplicateReview({imported,mode,batchId,duplicateReports});
        return;
      }
    }

    finalizeImportedBatch(imported,mode,batchId);
  };

  return <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef4ff_45%,#e8edf7_100%)] text-slate-900"><div className="mx-auto max-w-7xl px-5 py-8">
    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700"><ClipboardList className="h-4 w-4"/>Eason Lead Tracker</div><h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">潛在客戶追蹤系統</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">管理客戶業務理解、主推產品、痛點證據、付費理由、信服力來源、商機等級、寄信追蹤與下一步承諾。</p></div><div className="flex flex-wrap gap-3"><button onClick={()=>setBulk(true)} className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-blue-700 shadow-sm hover:bg-blue-50"><Upload className="h-4 w-4"/>批量貼上</button><button onClick={exportOutreachSummary} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-emerald-700 shadow-sm hover:bg-emerald-50"><Download className="h-4 w-4"/>匯出名單追蹤總表</button><button onClick={()=>setShowLeadsAll(v=>!v)} className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm ${showLeadsAll?"border-blue-500 bg-blue-50 text-blue-700":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><ClipboardList className="h-4 w-4"/>{showLeadsAll?"隱藏名單一覽":"名單一覽"}</button><button onClick={()=>setShowPrepAll(v=>!v)} className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm ${showPrepAll?"border-slate-500 bg-slate-100 text-slate-700":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><CalendarDays className="h-4 w-4"/>{showPrepAll?"隱藏準備事項":"準備事項一覽"}</button><button onClick={()=>setShowQuotedPlans(v=>!v)} className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 shadow-sm ${showQuotedPlans?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}><DollarSign className="h-4 w-4"/>{showQuotedPlans?"隱藏報價/合約分類":"報價/合約方案分類"}</button></div></header>

    <section className={`mt-6 rounded-3xl border p-4 shadow-sm ${supabase?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50"}`}><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><p className={`text-sm font-bold ${supabase?"text-emerald-800":"text-amber-800"}`}>{cloudSaving?"雲端同步中":cloudStatus}</p><p className="mt-1 text-sm leading-6 text-slate-600">{cloudMessage}</p>{cloudLastSavedAt&&<p className="mt-1 text-xs text-slate-500">最後同步：{cloudLastSavedAt}</p>}</div><div className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">資料來源：{supabase?"Supabase 雲端 + 本機備份":"本機備份模式"}</div></div></section>

    <section className="mt-8 grid gap-4 md:grid-cols-4 xl:grid-cols-5"><Stat icon={ClipboardList} label="客戶名單總數" value={stats.total}/><Stat icon={Clock3} label="未寄" value={stats.unsentCount} active={activeStatKey==="unsent"} onClick={()=>setActiveStatKey(activeStatKey==="unsent"?"":"unsent")}/><Stat icon={Mail} label="已寄" value={stats.sentCount} active={activeStatKey==="sent"} onClick={()=>setActiveStatKey(activeStatKey==="sent"?"":"sent")}/><Stat icon={Mail} label="已補追" value={stats.actualFollowUpCount} active={activeStatKey==="actualFollowUp"} onClick={()=>setActiveStatKey(activeStatKey==="actualFollowUp"?"":"actualFollowUp")}/><Stat icon={CheckCircle2} label="有回覆" value={stats.replied} active={activeStatKey==="replied"} onClick={()=>setActiveStatKey(activeStatKey==="replied"?"":"replied")}/><Stat icon={Clock3} label="真商機" value={stats.activeOpportunity} active={activeStatKey==="active"} onClick={()=>setActiveStatKey(activeStatKey==="active"?"":"active")}/><Stat icon={AlertCircle} label="無需求/未成交" value={stats.rejected} active={activeStatKey==="rejected"} onClick={()=>setActiveStatKey(activeStatKey==="rejected"?"":"rejected")}/><Stat icon={DollarSign} label="有預計收益案源" value={stats.estimatedCount} active={activeStatKey==="estimated"} onClick={()=>setActiveStatKey(activeStatKey==="estimated"?"":"estimated")}/><Stat icon={DollarSign} label="預計收益總累積" value={money(stats.projected)}/><Stat icon={DollarSign} label="目前總收益" value={money(stats.actual)}/></section>

    {activeStatDetail&&<section className="mt-4 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4 md:flex-row md:items-start md:justify-between"><div><p className="font-bold text-slate-950">{activeStatDetail.title}名單（{activeStatDetail.items.length} 筆）</p><p className="mt-1 text-sm leading-6 text-slate-500">{activeStatDetail.description}</p></div><button onClick={()=>setActiveStatKey("")} className="w-fit rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">關閉</button></div><div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">{activeStatDetail.items.length===0?<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3"><AlertCircle className="mx-auto mb-3 h-8 w-8"/><p>目前沒有符合這個統計的名單。</p></div>:activeStatDetail.items.map(item=><div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-950">{item.name||"未命名單位"}</p><p className="mt-1 text-xs text-slate-500">{item.contact||"尚未填窗口"}・{item.type||"其他"}・{item.status}</p></div><button onClick={()=>setEditing(item)} className="shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"><Pencil className="h-4 w-4"/></button></div><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${qualityBadgeClass(getLeadQuality(item))}`}>{getLeadQuality(item)}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{getFocusFit(item)}</span></div><div className="mt-3 space-y-1 text-sm leading-6 text-slate-600"><p>預計收益：<span className="font-semibold text-blue-700">{money(item.estimatedAmount)}</span></p><p>方案：{item.projectPlan||"尚未設定方案"}</p><p>寄出日：{item.sentDate||"尚未寄出"}</p><p>追蹤日：{item.followUpDate||"無追蹤日"}</p><p>補追日：{item.actualFollowUpDate||"尚未補追"}</p><p className="line-clamp-2">下一步：{item.nextAction||"尚未設定下一步"}</p></div></div>)}</div></section>}

    <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-semibold text-slate-950">批量更新</p><p className="mt-1 text-sm text-slate-500">名單一覽或每日區塊都可以勾選。常用操作可一鍵寄出、追蹤、批次改追蹤日、批次改補追日期、批次改狀態、刪除或延後；一鍵寄出 / 一鍵追蹤會使用目前日期滾輪選到的日期，不會偷用電腦今天日期；寄出會自動把追蹤日設為 +3 個工作日，假日不算；補寄 / 追蹤完成後會清空追蹤日，不再自動二追。前一天沒完成的待辦，下次進來會自動移到今天，手動延後也保留。</p></div><div className="flex flex-wrap items-end gap-3"><label className="block"><span className="text-sm font-medium text-slate-700">指定寄出日期</span><input type="date" value={bulkDate} onChange={e=>setBulkDate(e.target.value)} className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label><button onClick={applyBulk} className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-400">套用寄出日期</button><label className="block"><span className="text-sm font-medium text-slate-700">指定追蹤日</span><input type="date" value={bulkFollowUpDate} onChange={e=>setBulkFollowUpDate(e.target.value)} className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label><button onClick={applyBulkFollowUpDate} className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white hover:bg-indigo-400">套用追蹤日</button><label className="block"><span className="text-sm font-medium text-slate-700">指定補追日期</span><input type="date" value={bulkActualFollowUpDate} onChange={e=>setBulkActualFollowUpDate(e.target.value)} className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"/></label><button onClick={applyBulkActualFollowUpDate} className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-400">套用補追日期</button><label className="block"><span className="text-sm font-medium text-slate-700">指定狀態</span><select value={bulkStatusValue} onChange={e=>setBulkStatusValue(e.target.value)} className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option value="">選擇狀態</option>{statusOptions.filter(s=>s!=="準備事項").map(s=><option key={s} value={s}>{s}</option>)}</select></label><button onClick={applyBulkStatus} className="rounded-2xl bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-600">套用狀態</button><button onClick={openSelectedEmailHelper} className="rounded-2xl bg-violet-500 px-5 py-3 font-semibold text-white hover:bg-violet-400">寄信助手</button><button onClick={()=>bulkSend(selected,activeDate)} className="rounded-2xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400">一鍵寄出</button><button onClick={()=>bulkFollowUp(selected,activeDate)} className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-400">一鍵追蹤</button><button onClick={clearSelectedFollowUpDate} className="rounded-2xl border border-amber-200 bg-white px-5 py-3 font-semibold text-amber-700 hover:bg-amber-50">清空追蹤日</button><button onClick={()=>bulkTomorrow(selected,activeDate)} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">延到明天</button><button onClick={()=>bulkDelete(selected)} className="rounded-2xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 hover:bg-red-50">刪除勾選</button></div></div></section>

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
          <button onClick={autoReclassifyReplies} disabled={!autoReclassifyCandidates.length} className={`rounded-2xl px-5 py-3 font-semibold ${autoReclassifyCandidates.length?"border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100":"border border-slate-200 bg-slate-100 text-slate-400"}`}>自動重分回覆狀態{autoReclassifyCandidates.length?`（${autoReclassifyCandidates.length}）`:""}</button>
          <button onClick={()=>viewImportedBatch()} disabled={!lastImport} className={`rounded-2xl px-5 py-3 font-semibold ${lastImport?"border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100":"border border-slate-200 bg-slate-100 text-slate-400"}`}>查看最近匯入</button>
          <button onClick={()=>deleteImportedBatch()} disabled={!lastImport} className={`rounded-2xl px-5 py-3 font-semibold ${lastImport?"border border-red-200 bg-red-50 text-red-600 hover:bg-red-100":"border border-slate-200 bg-slate-100 text-slate-400"}`}>刪除最近匯入</button>
        </div>
      </div>
    </section>

    <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold text-slate-950">日期滾輪</p><p className="mt-1 text-sm text-slate-500">用滾輪選日期。預計聯絡、實際寄出、預計追蹤、實際補追、進行中工作、交付日、準備事項都會顯示在下面；上方「補」會直接依照補追日期 actualFollowUpDate 統計。</p></div><div className="flex items-center gap-2"><button onClick={()=>{const m=addMonths(calMonth,-1);setCalMonth(m);setActiveDate(`${m}-01`)}} className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"><ChevronLeft className="h-5 w-5"/></button><button onClick={goToday} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">回到今天</button><button onClick={()=>{const m=addMonths(calMonth,1);setCalMonth(m);setActiveDate(`${m}-01`)}} className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50"><ChevronRight className="h-5 w-5"/></button></div></div><h2 className="mb-4 text-2xl font-bold text-slate-950">{monthTitle(calMonth)}</h2>
    <div ref={calendarScrollRef} className="flex gap-3 overflow-x-auto pb-3">{calDays.map(d=>{const items=calendarDayItems(d);const planned=items.filter(x=>x.plannedContactDate===d&&!isPrepItem(x)).length;const send=items.filter(x=>x.sentDate===d&&!isPrepItem(x)).length;const follow=items.filter(x=>x.followUpDate===d&&!isPrepItem(x)).length;const actualFollow=items.filter(x=>x.actualFollowUpDate===d&&!isPrepItem(x)).length;const work=items.filter(x=>x.workDate===d&&!isPrepItem(x)).length;const delivery=items.filter(x=>x.deliveryDate===d&&!isPrepItem(x)).length;const prepC=items.filter(x=>isPrepItem(x)).length;const isToday=d===today();const active=d===activeDate;return <button key={d} data-calendar-date={d} onClick={()=>setActiveDate(d)} className={`min-w-[128px] shrink-0 rounded-2xl border px-4 py-3 text-left transition ${active?"border-blue-500 bg-blue-50 shadow-sm":"border-slate-200 bg-white hover:bg-slate-50"}`}><div className="flex items-center justify-between gap-2"><p className={`text-sm font-bold ${active?"text-blue-700":"text-slate-800"}`}>{isToday?"今天":dateLabel(d)}</p>{isToday&&<span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">今</span>}</div><p className="mt-1 text-xs text-slate-500">{d}</p><div className="mt-2 flex flex-wrap gap-1">{planned>0&&<span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700">聯 {planned}</span>}{send>0&&<span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">寄 {send}</span>}{follow>0&&<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">追 {follow}</span>}{actualFollow>0&&<span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] text-orange-700">補 {actualFollow}</span>}{work>0&&<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">工 {work}</span>}{delivery>0&&<span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-700">交 {delivery}</span>}{prepC>0&&<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">準 {prepC}</span>}{items.length===0&&<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">空</span>}</div></button>})}</div>
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
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{isPrepItem(item) ? (item.deliveryDate===activeDate?(item.deliveryNote||"交付 / 截止事項"):item.workDate===activeDate?(item.workTask||"進行中工作"):item.nextAction||item.need||"尚未設定下一步") : (item.email || "未填 Email")}</p>
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
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">關鍵字搜尋</span><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') applySearch();}} placeholder="搜尋單位、Email、主推產品、痛點證據、付費理由、回覆、備註..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-blue-400"/></div></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">狀態篩選</span><select value={status} onChange={e=>setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{statusOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">類型篩選</span><select value={type} onChange={e=>setType(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{typeOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">商機等級</span><select value={quality} onChange={e=>setQuality(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{leadQualityOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <label className="block"><span className="mb-2 block text-xs font-semibold text-slate-500">主線 / 產品方向</span><select value={focusFit} onChange={e=>setFocusFit(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"><option>全部</option>{focusFitOptions.map(s=><option key={s}>{s}</option>)}</select></label>
      <div className="flex items-end"><button onClick={applySearch} className="w-full rounded-2xl bg-blue-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-400">搜尋</button></div>
      <div className="flex items-end"><button onClick={clearFilters} className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50">清除</button></div>
    </div>{query&&<p className="mt-3 text-sm text-slate-500">目前搜尋：<span className="font-semibold text-slate-700">{query}</span></p>}</section>}
    {showQuotedPlans&&<section className="mt-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm"><div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4"><p className="font-bold text-slate-950">報價/合約方案分類（{quotedPlanTotal} 筆）</p><p className="mt-1 text-sm text-slate-500">只統計狀態為「已報價」或「談合約」的客戶，並且會套用上方的關鍵字、狀態與類型篩選。</p></div><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{quotedPlanGroups.length===0?<div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3"><AlertCircle className="mx-auto mb-3 h-8 w-8"/><p>目前沒有狀態為「已報價」或「談合約」的名單。</p></div>:quotedPlanGroups.map(group=><div key={group.plan} className="rounded-3xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-700">{group.plan}</p><p className="mt-2 text-2xl font-bold text-slate-950">{group.count} 筆</p></div><div className="rounded-2xl bg-white px-3 py-2 text-right text-xs text-slate-500 shadow-sm"><p>預計</p><p className="font-bold text-emerald-700">{money(group.projected)}</p><p className="mt-1">已收 {money(group.actual)}</p></div></div><div className="mt-4 space-y-3">{group.items.map(item=><div key={item.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.name||"未命名單位"}</p><p className="mt-1 text-xs text-slate-500">{item.contact||"尚未填窗口"}・{item.type||"其他"}・{item.status}</p></div><button onClick={()=>setEditing(item)} className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Pencil className="h-4 w-4"/></button></div><div className="mt-3 grid gap-2 text-xs text-slate-600"><p>預計收益：<span className="font-semibold text-blue-700">{money(item.estimatedAmount)}</span></p><p>追蹤日：{item.followUpDate||"無追蹤日"}</p><p>補追日期：{item.actualFollowUpDate||"尚未追蹤"}</p><p>下一步：{item.nextAction||"尚未設定下一步"}</p>{item.need&&<p className="line-clamp-2">需求：{item.need}</p>}</div></div>)}</div></div>)}</div></section>}
    {showLeadsAll&&<section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-blue-50 px-5 py-4"><p className="font-bold text-slate-950">名單一覽（{filteredLeads.length} 筆）</p><p className="mt-1 text-sm text-slate-500">這裡顯示所有非準備事項的客戶名單；優先看「真商機」與有明確查詢/導覽/回報痛點的名單。留存參考、轉知、問問看都不要當有效。</p></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4"><input type="checkbox" checked={filteredLeads.length>0&&filteredLeads.every(l=>selected.includes(l.id))} onChange={toggleAll}/></th><th className="px-5 py-4">排序</th><th className="px-5 py-4">單位 / 窗口</th><th className="px-5 py-4">狀態</th><th className="px-5 py-4">商機 / 主推產品</th><th className="px-5 py-4">方案 / 付費理由</th><th className="px-5 py-4">時間</th><th className="px-5 py-4">下一步</th><th className="px-5 py-4">業務 / 痛點證據</th><th className="px-5 py-4">收益</th><th className="px-5 py-4">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredLeads.map((l,i)=><tr key={l.id} className="align-top hover:bg-slate-50"><td className="px-5 py-4"><input type="checkbox" checked={selected.includes(l.id)} onChange={()=>toggle(l.id)}/></td><td className="px-5 py-4">#{i+1}</td><td className="px-5 py-4 min-w-[240px]"><p className="font-semibold">{l.name||"未命名單位"}</p><p className="text-slate-500">{l.contact||"尚未填窗口"}</p>{l.email?<a href={`mailto:${l.email}`} className="text-blue-700 hover:underline">{l.email}</a>:<p className="text-slate-400">尚未填 Email</p>}</td><td className="px-5 py-4"><select value={l.status} onChange={e=>updateStatus(l.id,e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2">{statusOptions.map(s=><option key={s}>{s}</option>)}</select><p className="mt-2 text-xs text-slate-400">{l.type}</p></td><td className="px-5 py-4 min-w-[220px]"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${qualityBadgeClass(l.opportunityLevel || getLeadQuality(l))}`}>{l.opportunityLevel || getLeadQuality(l)}</span><p className="mt-2 text-xs font-semibold text-slate-700">{l.mainProduct||"尚未設定主推產品"}</p><p className="mt-1 text-xs text-slate-500">{getFocusFit(l)}</p></td><td className="px-5 py-4 min-w-[260px]"><p className="font-medium text-slate-700">{l.projectPlan||"尚未設定方案"}</p>{l.whyPay&&<p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">付費理由：{l.whyPay}</p>}{l.credibilitySource&&<p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">信服力：{l.credibilitySource}</p>}</td><td className="px-5 py-4 min-w-[160px]"><p>聯：{l.plannedContactDate||"未安排"}</p><p>寄：{l.sentDate||"尚未寄出"}</p><p>追：{l.followUpDate||"無追蹤日"}</p><p>補追：{l.actualFollowUpDate||"尚未追蹤"}</p><p>工：{l.workDate||"未安排"}</p><p>交：{l.deliveryDate||"未設定"}</p><p className="text-xs text-slate-400">時程：{l.expectedClose||"待確認"}</p></td><td className="px-5 py-4 max-w-[260px]"><p>{l.nextAction||"尚未設定下一步"}</p>{l.workTask&&<p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">工作：{l.workTask}</p>}{l.deliveryNote&&<p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">交付：{l.deliveryNote}</p>}</td><td className="px-5 py-4 max-w-[320px]"><p className="font-semibold text-slate-700">{l.customerBusiness||"尚未填：單位在幹嘛"}</p>{l.painPointType&&<p className="mt-1 text-xs text-slate-500">痛點：{l.painPointType}</p>}{l.painPointEvidence&&<p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">證據：{l.painPointEvidence}</p>}{l.need&&<p className="mt-2 text-xs text-slate-600">需求：{l.need}</p>}{l.doNotPromise&&<p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">不能承諾：{l.doNotPromise}</p>}{l.lastReply&&<p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">{l.lastReply}</p>}</td><td className="px-5 py-4 whitespace-nowrap"><p className="font-semibold text-blue-700">預計 {money(l.estimatedAmount)}</p><p className="text-xs text-slate-500">已收 {money(l.receivedAmount)}</p></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={()=>openEmailHelper(l,filteredLeads.map(x=>x.id))} title="寄信助手" className="rounded-xl border border-violet-200 p-2 text-violet-600 hover:bg-violet-50"><Mail className="h-4 w-4"/></button><button onClick={()=>setEditing(l)} className="rounded-xl border border-slate-200 p-2"><Pencil className="h-4 w-4"/></button><button onClick={()=>remove(l.id)} className="rounded-xl border border-red-200 p-2 text-red-500"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div>{filteredLeads.length===0&&<div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-slate-400"><AlertCircle className="h-8 w-8"/><p>沒有符合條件的名單。</p></div>}</section>}
    {showPrepAll&&<section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 bg-slate-50 px-5 py-4"><p className="font-bold text-slate-950">準備事項一覽（{filteredPreps.length} 筆）</p><p className="mt-1 text-sm text-slate-500">這裡只顯示內部準備事項，不會混進客戶名單統計。</p></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">排序</th><th className="px-5 py-4">日期</th><th className="px-5 py-4">準備事項</th><th className="px-5 py-4">內容</th><th className="px-5 py-4">狀態</th><th className="px-5 py-4">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredPreps.map((l,i)=><tr key={l.id} className="align-top hover:bg-slate-50"><td className="px-5 py-4">#{i+1}</td><td className="px-5 py-4 min-w-[140px]">{l.followUpDate||"未安排"}</td><td className="px-5 py-4 min-w-[220px]"><p className="font-semibold">{l.name||"準備事項"}</p><p className="text-xs text-slate-400">{l.completed?`已於 ${l.completedDate||"未記錄日期"} 達成`:"尚未達成"}</p></td><td className="px-5 py-4 max-w-[420px]"><p>{l.nextAction||l.need||"尚未設定內容"}</p>{l.notes&&<p className="mt-2 whitespace-pre-line rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{l.notes}</p>}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${l.completed?"bg-blue-100 text-blue-700":"bg-amber-100 text-amber-700"}`}>{l.completed?"已達成":"待完成"}</span></td><td className="px-5 py-4"><div className="flex gap-2"><button onClick={()=>setEditing(l)} className="rounded-xl border border-slate-200 p-2"><Pencil className="h-4 w-4"/></button><button onClick={()=>remove(l.id)} className="rounded-xl border border-red-200 p-2 text-red-500"><Trash2 className="h-4 w-4"/></button></div></td></tr>)}</tbody></table></div>{filteredPreps.length===0&&<div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-slate-400"><AlertCircle className="h-8 w-8"/><p>沒有符合條件的準備事項。</p></div>}</section>}

  </div>{bulk&&<BulkImport onImport={importText} onClose={()=>setBulk(false)}/>} {duplicateReview&&<DuplicateImportReviewModal review={duplicateReview} onConfirm={(items)=>finalizeImportedBatch(items,duplicateReview.mode,duplicateReview.batchId)} onCancel={()=>setDuplicateReview(null)}/>} {editing&&<LeadForm lead={editing} onSave={save} onCancel={()=>setEditing(null)}/>} {draft&&<LeadForm lead={draft} onSave={save} onCancel={()=>setDraft(null)}/>} {emailHelperLead&&<EmailDraftModal lead={emailHelperLead} queuePosition={emailHelperQueuePosition} queueTotal={emailHelperQueueIds.length} onClose={()=>setEmailHelper(null)} onMarkScheduled={markEmailScheduled} onNext={goNextEmailHelper}/>}</div>
}
