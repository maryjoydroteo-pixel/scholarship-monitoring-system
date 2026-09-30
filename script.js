const defaultPrograms=[
 {id:1,name:"University Merit Scholarship",requiredGwa:1.75,minUnits:15,allowFailing:false,active:true},
 {id:2,name:"Government Scholarship",requiredGwa:2.00,minUnits:15,allowFailing:false,active:true},
 {id:3,name:"Private Academic Scholarship",requiredGwa:2.25,minUnits:12,allowFailing:true,active:true}
];

let state=JSON.parse(localStorage.getItem("smsState")||"null")||{
 users:[{name:"System Administrator",email:"admin@scholarship.com",password:"admin123",role:"admin"}],
 scholars:[],
 programs:defaultPrograms,
 grades:[]
};

// Keep old prototype data usable and make registered-account login more reliable.
state.users=Array.isArray(state.users)?state.users:[];
state.scholars=Array.isArray(state.scholars)?state.scholars:[];
state.programs=Array.isArray(state.programs)&&state.programs.length?state.programs:defaultPrograms;
state.grades=Array.isArray(state.grades)?state.grades:[];

const adminUser={name:"System Administrator",email:"admin@scholarship.com",password:"admin123",role:"admin"};
if(!state.users.some(u=>String(u.email||"").trim().toLowerCase()===adminUser.email)){
 state.users.push(adminUser);
}
let currentUser=null;
save();

function save(){localStorage.setItem("smsState",JSON.stringify(state));}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.style.display="block";setTimeout(()=>t.style.display="none",2200)}
function showAuth(type="login"){
 const loginForm=document.getElementById("loginForm");
 if(loginForm) loginForm.classList.remove("hidden");
}
function register(e){
 e.preventDefault();
 const name=document.getElementById("regName").value.trim();
 const email=document.getElementById("regEmail").value.trim().toLowerCase();
 const p=document.getElementById("regPassword").value;
 const c=document.getElementById("regConfirm").value;
 if(!name||!email||!p||!c){toast("Please complete all fields.");return}
 if(p!==c){toast("Passwords do not match.");return}
 if(state.users.some(u=>String(u.email||"").trim().toLowerCase()===email)){toast("Email is already registered.");return}
 const newUser={name,email,password:p,role:"scholar"};
 state.users.push(newUser);
 save();
 e.target.reset();
 showAuth("login");
 document.getElementById("loginEmail").value=email;
 document.getElementById("loginPassword").value="";
 toast("Account created. Please log in.");
}
function login(e){
 e.preventDefault();
 const email=document.getElementById("loginEmail").value.trim().toLowerCase();
 const p=document.getElementById("loginPassword").value;
 
 // Compare normalized emails and string passwords so registered accounts from
 // this prototype continue to work even if their saved email has different casing.
 let user=state.users.find(u=>String(u.email||"").trim().toLowerCase()===email && String(u.password??"")===String(p));
 
 // Always keep the demo administrator available.
 if(!user && email===adminUser.email && p===adminUser.password){
   user=adminUser;
   if(!state.users.some(u=>String(u.email||"").trim().toLowerCase()===adminUser.email)){
     state.users.push(adminUser);
     save();
   }
 }
 if(!user){toast("Invalid email or password. Please use the same email and password you used during registration.");return}
 
 currentUser=user;
 document.getElementById("authPage").classList.add("hidden");
 document.getElementById("dashboardPage").classList.remove("hidden");
 document.getElementById("userName").textContent=user.name;
 renderAll();
 toast("Welcome, "+user.name+"!");
}
function logout(){currentUser=null;document.getElementById("dashboardPage").classList.add("hidden");document.getElementById("authPage").classList.remove("hidden");showAuth("login");}
function showSection(section,btn){
 document.querySelectorAll(".content-section").forEach(s=>s.classList.add("hidden"));
 document.getElementById(section+"Section").classList.remove("hidden");
 document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active"));btn.classList.add("active");
 const titles={dashboard:"Dashboard",scholars:"Scholar Management",programs:"Scholarship Programs",grades:"Grade Submissions",compliance:"Compliance Monitoring"};
 document.getElementById("pageTitle").textContent=titles[section];
 document.getElementById("welcomeText").textContent=section==="dashboard"?"Monitor scholar records and academic compliance.":"Manage the "+titles[section].toLowerCase()+".";
 renderAll();
}
function openScholarForm(){document.getElementById("scholarForm").classList.remove("hidden")}
function closeScholarForm(){document.getElementById("scholarForm").classList.add("hidden")}
function addScholar(){
 const sid=document.getElementById("studentId").value.trim(),name=document.getElementById("scholarName").value.trim(),degree=document.getElementById("degreeProgram").value.trim(),year=Number(document.getElementById("yearLevel").value),programId=Number(document.getElementById("scholarshipSelect").value),status=document.getElementById("scholarStatus").value;
 if(!sid||!name||!degree||!year||!programId){toast("Please complete all required fields.");return}
 if(state.scholars.some(s=>s.studentId===sid)){toast("Student ID must be unique.");return}
 state.scholars.push({id:Date.now(),studentId:sid,name,degree,year,programId,status});save();closeScholarForm();document.querySelector("#scholarForm").querySelectorAll("input").forEach(i=>i.value="");renderAll();toast("Scholar registered successfully.");
}
function openGradeForm(){document.getElementById("gradeForm").classList.remove("hidden")}
function closeGradeForm(){document.getElementById("gradeForm").classList.add("hidden")}
function addGrade(){
 const scholarId=Number(document.getElementById("gradeScholar").value),ay=document.getElementById("academicYear").value.trim(),sem=document.getElementById("semester").value,gwa=Number(document.getElementById("gwa").value),units=Number(document.getElementById("units").value),failed=Number(document.getElementById("failed").value),inc=Number(document.getElementById("incomplete").value);
 if(!scholarId||!ay||!gwa||units<0||failed<0||inc<0||gwa<1||gwa>5){toast("Please enter valid grade information.");return}
 state.grades.push({id:Date.now(),scholarId,academicYear:ay,semester:sem,gwa,units,failed,incomplete:inc,status:"Pending",verifiedAt:null});save();closeGradeForm();renderAll();toast("Grade submission saved as Pending.");
}
function verifyGrade(id){
 const g=state.grades.find(x=>x.id===id);if(!g)return;g.status="Verified";g.verifiedAt=new Date().toISOString();save();renderAll();toast("Submission verified.");
}
function getProgram(id){return state.programs.find(p=>p.id===id)}
function getScholar(id){return state.scholars.find(s=>s.id===id)}
function evaluate(g){
 const s=getScholar(g.scholarId),p=getProgram(s?.programId);if(!s||!p||g.status!=="Verified")return "Pending";
 const gwaOk=g.gwa<=p.requiredGwa,unitsOk=g.units>=p.minUnits,failOk=p.allowFailing||g.failed===0;
 return gwaOk&&unitsOk&&failOk?"Compliant":"With Deficiency";
}
function renderAll(){renderPrograms();renderScholarOptions();renderScholars();renderGrades();renderCompliance();renderStats()}
function renderPrograms(){
 document.getElementById("programCards").innerHTML=state.programs.map(p=>`<div class="program-card"><h4>${p.name}</h4><p><b>Required GWA:</b> ${p.requiredGwa}</p><p><b>Minimum Units:</b> ${p.minUnits}</p><p><b>Failing Grade:</b> ${p.allowFailing?"Allowed":"Not Allowed"}</p><span class="status verified">${p.active?"Active":"Inactive"}</span></div>`).join("");
}
function renderScholarOptions(){
 const opts='<option value="">Select Scholarship Program</option>'+state.programs.filter(p=>p.active).map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
 document.getElementById("scholarshipSelect").innerHTML=opts;
 document.getElementById("gradeScholar").innerHTML='<option value="">Select Scholar</option>'+state.scholars.map(s=>`<option value="${s.id}">${s.studentId} - ${s.name}</option>`).join("");
}
function renderScholars(){
 document.getElementById("scholarTable").innerHTML=state.scholars.length?state.scholars.map(s=>{const p=getProgram(s.programId);return `<tr><td>${s.studentId}</td><td>${s.name}</td><td>${s.degree}</td><td>${s.year}</td><td>${p?.name||"-"}</td><td><span class="status verified">${s.status}</span></td></tr>`}).join(""):'<tr><td colspan="6">No scholar records yet.</td></tr>';
}
function renderGrades(){
 document.getElementById("gradeTable").innerHTML=state.grades.length?state.grades.map(g=>{const s=getScholar(g.scholarId),r=g.status==="Verified"?"verified":"pending";return `<tr><td>${s?.name||"-"}</td><td>${g.semester}<br>${g.academicYear}</td><td>${g.gwa.toFixed(2)}</td><td>${g.units}</td><td><span class="status ${r}">${g.status}</span></td><td>${g.status==="Pending"?`<button class="primary-btn small" onclick="verifyGrade(${g.id})">Verify</button>`:"—"}</td></tr>`}).join(""):'<tr><td colspan="6">No grade submissions yet.</td></tr>';
}
function renderCompliance(){
 document.getElementById("complianceTable").innerHTML=state.grades.length?state.grades.map(g=>{const s=getScholar(g.scholarId),p=getProgram(s?.programId),result=evaluate(g),cls=result==="Compliant"?"compliant":result==="With Deficiency"?"deficiency":"pending";return `<tr><td>${s?.name||"-"}</td><td>${p?.name||"-"}</td><td>${g.gwa.toFixed(2)}</td><td>${g.units}</td><td><span class="status ${cls}">${result}</span></td></tr>`}).join(""):'<tr><td colspan="5">No compliance records yet.</td></tr>';
}
function renderStats(){
 document.getElementById("totalScholars").textContent=state.scholars.length;
 document.getElementById("pendingSubmissions").textContent=state.grades.filter(g=>g.status==="Pending").length;
 document.getElementById("verifiedSubmissions").textContent=state.grades.filter(g=>g.status==="Verified").length;
 document.getElementById("compliantScholars").textContent=state.grades.filter(g=>evaluate(g)==="Compliant").length;
 document.getElementById("deficiencyScholars").textContent=state.grades.filter(g=>evaluate(g)==="With Deficiency").length;
}
showAuth("login");
