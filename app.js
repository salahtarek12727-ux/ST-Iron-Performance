const DB_KEY = "stIronPerformance_v1";
const $ = id => document.getElementById(id);
const days = ["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
let clients = load();
function load(){try{return JSON.parse(localStorage.getItem(DB_KEY)||"[]")}catch{return []}}
function save(){localStorage.setItem(DB_KEY,JSON.stringify(clients));renderClients();fillWorkoutClients()}
function uid(){return "c"+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function num(v){return Number(v)||0}
function today(){return new Date().toISOString().slice(0,10)}
function switchView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name));document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name))}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
function renderClients(){
 const q=$("search").value.trim().toLowerCase(), list=$("clientList");
 const filtered=clients.filter(c=>[c.id,c.name,c.phone].some(x=>String(x||"").toLowerCase().includes(q)));
 list.innerHTML=filtered.map(c=>{const latest=(c.inbody||[]).slice(-1)[0]||{};const remaining=Math.max(0,num(c.total)-num(c.used));
 return `<article class="client-card"><div class="client-title"><div><h3>${esc(c.name)}</h3><div class="client-id">ID: ${esc(c.id)}</div></div><div class="client-id">${remaining} جلسة متبقية</div></div>
 <div class="details"><div class="detail"><b>التليفون</b>${esc(c.phone||"—")}</div><div class="detail"><b>السن</b>${esc(c.age||"—")}</div><div class="detail"><b>الباقة</b>${esc(c.package||"—")}</div><div class="detail"><b>الجلسات</b>${num(c.used)} مستخدمة / ${num(c.total)} إجمالي</div><div class="detail"><b>تاريخ الاشتراك</b>${esc(c.date||"—")}</div><div class="detail"><b>آخر InBody</b>${latest.weight?esc(latest.weight)+" kg": "غير مسجل"}</div></div>
 <div class="card-actions"><button data-edit="${c.key}">تعديل البيانات</button><button data-workout="${c.key}">جدول التمرين</button><button class="delete" data-delete="${c.key}">حذف</button></div></article>`}).join("");
 $("emptyClients").style.display=filtered.length?"none":"block";
 list.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openClient(b.dataset.edit));
 list.querySelectorAll("[data-workout]").forEach(b=>b.onclick=()=>{switchView("workouts");$("workoutClient").value=b.dataset.workout;renderWorkout()});
 list.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{const c=clients.find(x=>x.key===b.dataset.delete);if(c&&confirm(`حذف ملف ${c.name} وكل بياناته؟`)){clients=clients.filter(x=>x.key!==c.key);save();renderWorkout()}});
}
$("search").addEventListener("input",renderClients);
function openClient(key){
 $("clientForm").reset();$("clientKey").value=key||"";$("dialogTitle").textContent=key?"تعديل بيانات العميل":"إضافة عميل";
 const c=clients.find(x=>x.key===key);
 ["cId","cName","cPhone","cAge","cPackage","cTotal","cUsed","cDate","cAssessment"].forEach(id=>$(id).value="");
 ["iDate","iWeight","iFat","iMuscle","iNotes"].forEach(id=>$(id).value="");
 if(c){$("cId").value=c.id;$("cName").value=c.name;$("cPhone").value=c.phone||"";$("cAge").value=c.age||"";$("cPackage").value=c.package||"";$("cTotal").value=c.total||0;$("cUsed").value=c.used||0;$("cDate").value=c.date||"";$("cAssessment").value=c.assessment||"";
 const i=(c.inbody||[]).slice(-1)[0];if(i){$("iDate").value=i.date||"";$("iWeight").value=i.weight||"";$("iFat").value=i.fat||"";$("iMuscle").value=i.muscle||"";$("iNotes").value=i.notes||""}}
 $("clientDialog").showModal()
}
$("addClient").onclick=()=>openClient();
$("closeDialog").onclick=$("cancelDialog").onclick=()=>$("clientDialog").close();
$("clientForm").addEventListener("submit",e=>{
 e.preventDefault();const key=$("clientKey").value||uid();let c=clients.find(x=>x.key===key);
 const data={key,id:$("cId").value.trim(),name:$("cName").value.trim(),phone:$("cPhone").value.trim(),age:$("cAge").value,package:$("cPackage").value.trim(),total:num($("cTotal").value),used:num($("cUsed").value),date:$("cDate").value,assessment:$("cAssessment").value, inbody:c?.inbody||[],workouts:c?.workouts||{}};
 if(!data.id||!data.name)return;
 if($("iWeight").value||$("iFat").value||$("iMuscle").value){const entry={date:$("iDate").value||today(),weight:$("iWeight").value,fat:$("iFat").value,muscle:$("iMuscle").value,notes:$("iNotes").value};const last=data.inbody[data.inbody.length-1];if(last&&last.date===entry.date)data.inbody[data.inbody.length-1]=entry;else data.inbody.push(entry);data.inbody.sort((a,b)=>(a.date||"").localeCompare(b.date||""))}
 if(c)clients=clients.map(x=>x.key===key?data:x);else clients.push(data);
 save();$("clientDialog").close()
});
function fillWorkoutClients(){const sel=$("workoutClient"),old=sel.value;sel.innerHTML='<option value="">— اختار العميل —</option>'+clients.map(c=>`<option value="${c.key}">${esc(c.name)} (ID: ${esc(c.id)})</option>`).join("");if(clients.some(c=>c.key===old))sel.value=old;renderWorkout()}
$("workoutClient").onchange=renderWorkout;
function renderWorkout(){
 const c=clients.find(x=>x.key===$("workoutClient").value),root=$("workoutEditor");
 if(!c){root.innerHTML='<p class="empty">أضف عميلًا أولًا، ثم اختاره لإدارة جدول تمرينه.</p>';return}
 if(!c.workouts)c.workouts={};
 root.innerHTML=`<p>العميل: <strong>${esc(c.name)}</strong> — ID: ${esc(c.id)}</p><div class="workout-top"><label class="field">اسم البرنامج<input id="programName" placeholder="مثال: Upper / Lower" value="${esc(c.workouts.programName||"")}"></label><label class="field">الأسبوع يبدأ في<input id="weekDate" type="date" value="${esc(c.workouts.weekDate||today())}"></label></div><div id="daysRoot"></div><button id="saveWorkout" class="primary">حفظ جدول التمرين</button><p id="workoutStatus" class="status"></p>`;
 const daysRoot=$("daysRoot");
 days.forEach(day=>{const d=(c.workouts.days||{})[day]||{rest:false,exercises:[]};
 daysRoot.insertAdjacentHTML("beforeend",`<section class="day-block" data-day="${day}"><div class="day-head"><h3>${day}</h3><label><input type="checkbox" class="rest-check" ${d.rest?"checked":""}> يوم راحة</label><button type="button" class="add-exercise">+ تمرين</button></div><div class="table-wrap"><table><thead><tr><th>التمرين</th><th>Sets</th><th>Reps</th><th>الوزن (kg)</th><th>الراحة</th><th>ملاحظات</th><th>حذف</th></tr></thead><tbody>${(d.exercises||[]).map(ex=>exerciseRow(ex)).join("")}</tbody></table></div></section>`)});
 daysRoot.querySelectorAll(".add-exercise").forEach(b=>b.onclick=()=>{const tbody=b.closest(".day-block").querySelector("tbody");tbody.insertAdjacentHTML("beforeend",exerciseRow({name:"",sets:3,reps:10,weight:"",rest:"60 ثانية",notes:""}));});
 $("saveWorkout").onclick=()=>{
 const workouts={programName:$("programName").value,weekDate:$("weekDate").value,days:{}};
 daysRoot.querySelectorAll(".day-block").forEach(block=>{const day=block.dataset.day;workouts.days[day]={rest:block.querySelector(".rest-check").checked,exercises:[...block.querySelectorAll("tbody tr")].map(tr=>({name:tr.querySelector('[data-f="name"]').value,sets:tr.querySelector('[data-f="sets"]').value,reps:tr.querySelector('[data-f="reps"]').value,weight:tr.querySelector('[data-f="weight"]').value,rest:tr.querySelector('[data-f="rest"]').value,notes:tr.querySelector('[data-f="notes"]').value})).filter(x=>x.name.trim())}});
 c.workouts=workouts;localStorage.setItem(DB_KEY,JSON.stringify(clients));$("workoutStatus").textContent="تم حفظ جدول التمرين على الجهاز.";renderClients()
 };
}
function exerciseRow(ex){return `<tr><td><input data-f="name" placeholder="اسم التمرين" value="${esc(ex.name||"")}"></td><td><input data-f="sets" type="number" min="0" value="${esc(ex.sets??3)}"></td><td><input data-f="reps" placeholder="8–12" value="${esc(ex.reps??10)}"></td><td><input data-f="weight" placeholder="مثال 20" value="${esc(ex.weight||"")}"></td><td><input data-f="rest" placeholder="60 ثانية" value="${esc(ex.rest||"60 ثانية")}"></td><td><input data-f="notes" placeholder="ملاحظات" value="${esc(ex.notes||"")}"></td><td><button type="button" class="remove-row" aria-label="حذف التمرين" onclick="this.closest('tr').remove()">×</button></td></tr>`}
$("exportData").onclick=()=>{const blob=new Blob([JSON.stringify({app:"ST Iron Performance",version:1,exportedAt:new Date().toISOString(),clients},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="st-iron-performance-backup.json";a.click();URL.revokeObjectURL(a.href);$("backupStatus").textContent="تم تجهيز ملف النسخة الاحتياطية."};
$("importData").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const obj=JSON.parse(await file.text());const incoming=Array.isArray(obj)?obj:obj.clients;if(!Array.isArray(incoming))throw Error("invalid");if(confirm("الاستيراد سيستبدل البيانات الحالية. هل تريد المتابعة؟")){clients=incoming;save();$("backupStatus").textContent="تم استيراد البيانات بنجاح."}}catch{$("backupStatus").textContent="تعذر قراءة الملف. اختار نسخة احتياطية صحيحة."}e.target.value=""};
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
renderClients();fillWorkoutClients();
