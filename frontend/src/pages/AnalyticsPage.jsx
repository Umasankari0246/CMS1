import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { cmsRoles, getValidRole } from '../data/roleConfig';
import Layout from '../components/Layout';
import { getRealAnalyticsData } from '../services/analyticsService';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = {
  Grad:     ()=><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 2.26L19.02 9 12 12.74 4.98 9 12 5.26zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  Menu:     ()=><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  Logout:   ()=><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  Back:     ()=><svg viewBox="0 0 24 24" width="18" height="18" fill="#6b7280"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  Up:       ()=><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>,
  Down:     ()=><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>,
  Calendar: ()=><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.89 3 3 3.9 3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v9z"/></svg>,
  Download: ()=><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"/></svg>,
  ChevL:    ()=><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>,
  ChevR:    ()=><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>,
  Close:    ()=><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  People:   ()=><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  Finance:  ()=><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
  Chart:    ()=><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zM16.2 13h2.8v6h-2.8v-6z"/></svg>,
  Alert:    ()=><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>,
};

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = { blue:'#2563eb', cyan:'#06b6d4', green:'#22c55e', orange:'#f97316', purple:'#8b5cf6', red:'#ef4444', teal:'#14b8a6', amber:'#f59e0b', indigo:'#6366f1' };
const DEPT_COLORS = { CS:C.blue, Phys:C.orange, Math:C.green, ECE:C.purple, Mech:C.cyan };
const PIE_COLS  = [C.green, C.orange, C.red, C.blue, C.purple];
const TT = { contentStyle:{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,.08)' } };
const H = 210, H2 = 240;

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS_ALL  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS       = [2024, 2025, 2026, 2027, 2028];
const DEPTS       = ['CS','Phys','Math','ECE','Mech'];
const DEPT_FULL   = { CS:'Computer Science', Phys:'Physics', Math:'Mathematics', ECE:'Electronics', Mech:'Mechanical' };
const SEMESTER_OPTS = ['Semester 6 (Current)','Semester 5','Semester 4','Semester 3','Semester 2','Semester 1'];
const DEPT_OPTS     = ['All Departments','Computer Science','Physics','Mathematics','Electronics','Mechanical'];
const COURSE_OPTS   = ['All Courses','DBMS','Data Structures','Physics','Mathematics','CS Elective'];
const DEPT_CODE     = { 'All Departments':null,'Computer Science':'CS','Physics':'Phys','Mathematics':'Math','Electronics':'ECE','Mechanical':'Mech' };

// Grade range keys (avoid < in JSX template literals)
const GRADE_F   = 'F (<50)';
const GRADE_O   = 'O (\u226590)';
const GRADE_Ap  = 'A+ (80-89)';
const GRADE_A   = 'A (70-79)';
const GRADE_Bp  = 'B+ (60-69)';
const GRADE_B   = 'B (50-59)';

// ─── MonthYear helpers ────────────────────────────────────────────────────────
function myToKey({month,year}){ 
  if (month == null || year == null) return null;
  return year*12+month;
}
function keyToMY(k){return{month:k%12,year:Math.floor(k/12)};}
function myLabel({month,year}){ 
  if (month == null || year == null) return '';
  return `${MONTHS_ALL[month]} ${year}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// DATA BANKS
// ══════════════════════════════════════════════════════════════════════════════

const adminAttByMonth = {
  Jan:[{dept:'CS',avg:86},{dept:'Phys',avg:82},{dept:'Math',avg:80},{dept:'ECE',avg:84},{dept:'Mech',avg:81}],
  Feb:[{dept:'CS',avg:88},{dept:'Phys',avg:84},{dept:'Math',avg:82},{dept:'ECE',avg:86},{dept:'Mech',avg:83}],
  Mar:[{dept:'CS',avg:87},{dept:'Phys',avg:83},{dept:'Math',avg:81},{dept:'ECE',avg:85},{dept:'Mech',avg:82}],
  Apr:[{dept:'CS',avg:84},{dept:'Phys',avg:80},{dept:'Math',avg:78},{dept:'ECE',avg:82},{dept:'Mech',avg:79}],
  May:[{dept:'CS',avg:80},{dept:'Phys',avg:76},{dept:'Math',avg:74},{dept:'ECE',avg:78},{dept:'Mech',avg:75}],
  Jun:[{dept:'CS',avg:82},{dept:'Phys',avg:78},{dept:'Math',avg:76},{dept:'ECE',avg:80},{dept:'Mech',avg:77}],
  Jul:[{dept:'CS',avg:85},{dept:'Phys',avg:81},{dept:'Math',avg:79},{dept:'ECE',avg:83},{dept:'Mech',avg:80}],
  Aug:[{dept:'CS',avg:89},{dept:'Phys',avg:85},{dept:'Math',avg:83},{dept:'ECE',avg:87},{dept:'Mech',avg:84}],
  Sep:[{dept:'CS',avg:86},{dept:'Phys',avg:82},{dept:'Math',avg:80},{dept:'ECE',avg:84},{dept:'Mech',avg:81}],
  Oct:[{dept:'CS',avg:91},{dept:'Phys',avg:87},{dept:'Math',avg:85},{dept:'ECE',avg:89},{dept:'Mech',avg:86}],
  Nov:[{dept:'CS',avg:83},{dept:'Phys',avg:79},{dept:'Math',avg:77},{dept:'ECE',avg:81},{dept:'Mech',avg:78}],
  Dec:[{dept:'CS',avg:79},{dept:'Phys',avg:75},{dept:'Math',avg:73},{dept:'ECE',avg:77},{dept:'Mech',avg:74}],
};
const adminExamByMonth = {
  Jan:[{dept:'CS',pass:88,fail:12},{dept:'Phys',pass:82,fail:18},{dept:'Math',pass:79,fail:21},{dept:'ECE',pass:85,fail:15},{dept:'Mech',pass:81,fail:19}],
  Feb:[{dept:'CS',pass:90,fail:10},{dept:'Phys',pass:84,fail:16},{dept:'Math',pass:81,fail:19},{dept:'ECE',pass:87,fail:13},{dept:'Mech',pass:83,fail:17}],
  Mar:[{dept:'CS',pass:94,fail:6},{dept:'Phys',pass:88,fail:12},{dept:'Math',pass:85,fail:15},{dept:'ECE',pass:91,fail:9},{dept:'Mech',pass:87,fail:13}],
  Apr:[{dept:'CS',pass:86,fail:14},{dept:'Phys',pass:80,fail:20},{dept:'Math',pass:77,fail:23},{dept:'ECE',pass:83,fail:17},{dept:'Mech',pass:79,fail:21}],
  May:[{dept:'CS',pass:82,fail:18},{dept:'Phys',pass:76,fail:24},{dept:'Math',pass:73,fail:27},{dept:'ECE',pass:79,fail:21},{dept:'Mech',pass:75,fail:25}],
  Jun:[{dept:'CS',pass:84,fail:16},{dept:'Phys',pass:78,fail:22},{dept:'Math',pass:75,fail:25},{dept:'ECE',pass:81,fail:19},{dept:'Mech',pass:77,fail:23}],
  Jul:[{dept:'CS',pass:87,fail:13},{dept:'Phys',pass:81,fail:19},{dept:'Math',pass:78,fail:22},{dept:'ECE',pass:84,fail:16},{dept:'Mech',pass:80,fail:20}],
  Aug:[{dept:'CS',pass:91,fail:9},{dept:'Phys',pass:85,fail:15},{dept:'Math',pass:82,fail:18},{dept:'ECE',pass:88,fail:12},{dept:'Mech',pass:84,fail:16}],
  Sep:[{dept:'CS',pass:89,fail:11},{dept:'Phys',pass:83,fail:17},{dept:'Math',pass:80,fail:20},{dept:'ECE',pass:86,fail:14},{dept:'Mech',pass:82,fail:18}],
  Oct:[{dept:'CS',pass:93,fail:7},{dept:'Phys',pass:87,fail:13},{dept:'Math',pass:84,fail:16},{dept:'ECE',pass:90,fail:10},{dept:'Mech',pass:86,fail:14}],
  Nov:[{dept:'CS',pass:85,fail:15},{dept:'Phys',pass:79,fail:21},{dept:'Math',pass:76,fail:24},{dept:'ECE',pass:82,fail:18},{dept:'Mech',pass:78,fail:22}],
  Dec:[{dept:'CS',pass:87,fail:13},{dept:'Phys',pass:81,fail:19},{dept:'Math',pass:78,fail:22},{dept:'ECE',pass:84,fail:16},{dept:'Mech',pass:80,fail:20}],
};
const adminCardsByMonth = {
  Jan:{students:'2,590',faculty:'388',depts:'5',courses:'44'},Feb:{students:'2,620',faculty:'392',depts:'5',courses:'46'},
  Mar:{students:'2,690',faculty:'400',depts:'5',courses:'48'},Apr:{students:'2,710',faculty:'402',depts:'5',courses:'48'},
  May:{students:'2,680',faculty:'398',depts:'5',courses:'46'},Jun:{students:'2,650',faculty:'394',depts:'5',courses:'44'},
  Jul:{students:'2,700',faculty:'400',depts:'5',courses:'47'},Aug:{students:'2,750',faculty:'406',depts:'5',courses:'49'},
  Sep:{students:'2,720',faculty:'402',depts:'5',courses:'48'},Oct:{students:'2,760',faculty:'408',depts:'5',courses:'50'},
  Nov:{students:'2,700',faculty:'400',depts:'5',courses:'47'},Dec:{students:'2,650',faculty:'394',depts:'5',courses:'44'},
};

const studentsByDept  = {CS:680,Phys:420,Math:390,ECE:580,Mech:510};
const studentsByYear  = {'Year 1':720,'Year 2':680,'Year 3':620,'Year 4':560};
const genderData      = [{name:'Male',value:58},{name:'Female',value:40},{name:'Other',value:2}];
const cgpaByDept      = {CS:8.4,Phys:7.9,Math:8.1,ECE:8.2,Mech:7.8};
const facultyByDept   = {CS:82,Phys:68,Math:58,ECE:94,Mech:86};
const facultyRankData = [
  {rank:'Professor',count:68},{rank:'Assoc. Prof',count:112},{rank:'Asst. Prof',count:158},{rank:'Lecturer',count:50},
];
const incomeExpenseByMonth = {
  Jan:{income:3200000,expense:2100000},Feb:{income:3400000,expense:2200000},Mar:{income:4100000,expense:2300000},
  Apr:{income:3600000,expense:2150000},May:{income:3100000,expense:2050000},Jun:{income:3300000,expense:2100000},
  Jul:{income:3500000,expense:2200000},Aug:{income:3900000,expense:2250000},Sep:{income:3700000,expense:2180000},
  Oct:{income:4300000,expense:2350000},Nov:{income:3500000,expense:2200000},Dec:{income:3300000,expense:2150000},
};

const financeColByMonth = {
  Jan:[{week:'Wk1',collected:820000,target:900000},{week:'Wk2',collected:950000,target:900000},{week:'Wk3',collected:780000,target:900000},{week:'Wk4',collected:860000,target:900000}],
  Feb:[{week:'Wk1',collected:880000,target:900000},{week:'Wk2',collected:920000,target:900000},{week:'Wk3',collected:840000,target:900000},{week:'Wk4',collected:900000,target:900000}],
  Mar:[{week:'Wk1',collected:950000,target:1000000},{week:'Wk2',collected:880000,target:1000000},{week:'Wk3',collected:1020000,target:1000000},{week:'Wk4',collected:940000,target:1000000}],
  Apr:[{week:'Wk1',collected:760000,target:900000},{week:'Wk2',collected:820000,target:900000},{week:'Wk3',collected:800000,target:900000},{week:'Wk4',collected:840000,target:900000}],
  May:[{week:'Wk1',collected:700000,target:850000},{week:'Wk2',collected:760000,target:850000},{week:'Wk3',collected:740000,target:850000},{week:'Wk4',collected:800000,target:850000}],
  Jun:[{week:'Wk1',collected:780000,target:900000},{week:'Wk2',collected:820000,target:900000},{week:'Wk3',collected:860000,target:900000},{week:'Wk4',collected:900000,target:900000}],
  Jul:[{week:'Wk1',collected:830000,target:900000},{week:'Wk2',collected:870000,target:900000},{week:'Wk3',collected:820000,target:900000},{week:'Wk4',collected:880000,target:900000}],
  Aug:[{week:'Wk1',collected:900000,target:950000},{week:'Wk2',collected:940000,target:950000},{week:'Wk3',collected:920000,target:950000},{week:'Wk4',collected:960000,target:950000}],
  Sep:[{week:'Wk1',collected:860000,target:920000},{week:'Wk2',collected:900000,target:920000},{week:'Wk3',collected:880000,target:920000},{week:'Wk4',collected:920000,target:920000}],
  Oct:[{week:'Wk1',collected:960000,target:1000000},{week:'Wk2',collected:1000000,target:1000000},{week:'Wk3',collected:980000,target:1000000},{week:'Wk4',collected:1020000,target:1000000}],
  Nov:[{week:'Wk1',collected:820000,target:900000},{week:'Wk2',collected:860000,target:900000},{week:'Wk3',collected:840000,target:900000},{week:'Wk4',collected:880000,target:900000}],
  Dec:[{week:'Wk1',collected:780000,target:850000},{week:'Wk2',collected:820000,target:850000},{week:'Wk3',collected:800000,target:850000}],
};
const financePieByMonth = {
  Jan:[{name:'Paid',value:68},{name:'Pending',value:22},{name:'Overdue',value:10}],
  Feb:[{name:'Paid',value:70},{name:'Pending',value:20},{name:'Overdue',value:10}],
  Mar:[{name:'Paid',value:72},{name:'Pending',value:18},{name:'Overdue',value:10}],
  Apr:[{name:'Paid',value:65},{name:'Pending',value:25},{name:'Overdue',value:10}],
  May:[{name:'Paid',value:62},{name:'Pending',value:28},{name:'Overdue',value:10}],
  Jun:[{name:'Paid',value:66},{name:'Pending',value:24},{name:'Overdue',value:10}],
  Jul:[{name:'Paid',value:69},{name:'Pending',value:21},{name:'Overdue',value:10}],
  Aug:[{name:'Paid',value:74},{name:'Pending',value:17},{name:'Overdue',value:9}],
  Sep:[{name:'Paid',value:71},{name:'Pending',value:20},{name:'Overdue',value:9}],
  Oct:[{name:'Paid',value:76},{name:'Pending',value:16},{name:'Overdue',value:8}],
  Nov:[{name:'Paid',value:68},{name:'Pending',value:22},{name:'Overdue',value:10}],
  Dec:[{name:'Paid',value:70},{name:'Pending',value:20},{name:'Overdue',value:10}],
};
const financeDeptByMonth = {
  Jan:[{dept:'CS',paid:580,pending:120,overdue:80},{dept:'Phys',paid:280,pending:90,overdue:50},{dept:'Math',paid:240,pending:80,overdue:40},{dept:'ECE',paid:380,pending:100,overdue:60},{dept:'Mech',paid:320,pending:90,overdue:50}],
  Feb:[{dept:'CS',paid:610,pending:100,overdue:70},{dept:'Phys',paid:295,pending:80,overdue:45},{dept:'Math',paid:255,pending:70,overdue:35},{dept:'ECE',paid:400,pending:88,overdue:52},{dept:'Mech',paid:338,pending:80,overdue:42}],
  Mar:[{dept:'CS',paid:680,pending:88,overdue:52},{dept:'Phys',paid:320,pending:62,overdue:38},{dept:'Math',paid:280,pending:54,overdue:26},{dept:'ECE',paid:440,pending:72,overdue:48},{dept:'Mech',paid:370,pending:68,overdue:42}],
  Apr:[{dept:'CS',paid:560,pending:130,overdue:90},{dept:'Phys',paid:260,pending:100,overdue:60},{dept:'Math',paid:220,pending:90,overdue:50},{dept:'ECE',paid:360,pending:110,overdue:70},{dept:'Mech',paid:300,pending:100,overdue:60}],
  May:[{dept:'CS',paid:520,pending:150,overdue:100},{dept:'Phys',paid:240,pending:112,overdue:68},{dept:'Math',paid:200,pending:104,overdue:56},{dept:'ECE',paid:340,pending:122,overdue:78},{dept:'Mech',paid:280,pending:112,overdue:68}],
  Jun:[{dept:'CS',paid:570,pending:120,overdue:80},{dept:'Phys',paid:268,pending:94,overdue:58},{dept:'Math',paid:228,pending:86,overdue:46},{dept:'ECE',paid:370,pending:106,overdue:64},{dept:'Mech',paid:308,pending:96,overdue:56}],
  Jul:[{dept:'CS',paid:600,pending:108,overdue:72},{dept:'Phys',paid:285,pending:82,overdue:53},{dept:'Math',paid:245,pending:74,overdue:41},{dept:'ECE',paid:390,pending:94,overdue:56},{dept:'Mech',paid:328,pending:84,overdue:48}],
  Aug:[{dept:'CS',paid:640,pending:92,overdue:58},{dept:'Phys',paid:302,pending:70,overdue:48},{dept:'Math',paid:262,pending:62,overdue:36},{dept:'ECE',paid:415,pending:80,overdue:55},{dept:'Mech',paid:348,pending:72,overdue:50}],
  Sep:[{dept:'CS',paid:618,pending:100,overdue:62},{dept:'Phys',paid:290,pending:76,overdue:54},{dept:'Math',paid:250,pending:68,overdue:42},{dept:'ECE',paid:402,pending:86,overdue:52},{dept:'Mech',paid:337,pending:77,overdue:46}],
  Oct:[{dept:'CS',paid:666,pending:82,overdue:52},{dept:'Phys',paid:310,pending:60,overdue:40},{dept:'Math',paid:270,pending:52,overdue:28},{dept:'ECE',paid:428,pending:68,overdue:44},{dept:'Mech',paid:358,pending:62,overdue:40}],
  Nov:[{dept:'CS',paid:590,pending:112,overdue:78},{dept:'Phys',paid:275,pending:88,overdue:57},{dept:'Math',paid:235,pending:80,overdue:45},{dept:'ECE',paid:376,pending:98,overdue:66},{dept:'Mech',paid:314,pending:88,overdue:58}],
  Dec:[{dept:'CS',paid:572,pending:118,overdue:80},{dept:'Phys',paid:265,pending:95,overdue:60},{dept:'Math',paid:225,pending:87,overdue:48},{dept:'ECE',paid:363,pending:107,overdue:70},{dept:'Mech',paid:305,pending:97,overdue:58}],
};
const financeCardsByMonth = {
  Jan:{collected:'₹1.8Cr',pending:'₹58L',scholarships:'138',late:'32'},Feb:{collected:'₹2.0Cr',pending:'₹52L',scholarships:'140',late:'30'},
  Mar:{collected:'₹2.4Cr',pending:'₹48L',scholarships:'142',late:'28'},Apr:{collected:'₹1.7Cr',pending:'₹64L',scholarships:'135',late:'36'},
  May:{collected:'₹1.5Cr',pending:'₹72L',scholarships:'130',late:'40'},Jun:{collected:'₹1.6Cr',pending:'₹66L',scholarships:'132',late:'38'},
  Jul:{collected:'₹1.9Cr',pending:'₹55L',scholarships:'136',late:'34'},Aug:{collected:'₹2.2Cr',pending:'₹44L',scholarships:'140',late:'26'},
  Sep:{collected:'₹2.1Cr',pending:'₹50L',scholarships:'138',late:'30'},Oct:{collected:'₹2.5Cr',pending:'₹40L',scholarships:'144',late:'22'},
  Nov:{collected:'₹1.8Cr',pending:'₹58L',scholarships:'136',late:'32'},Dec:{collected:'₹1.9Cr',pending:'₹54L',scholarships:'138',late:'30'},
};
const expenseBreakdown  = [{name:'Salaries',value:58},{name:'Infrastructure',value:22},{name:'Maintenance',value:12},{name:'Events',value:5},{name:'Other',value:3}];
const paymentMethodData = [{name:'Online',value:52},{name:'Bank Transfer',value:30},{name:'Cash',value:18}];
const scholarshipByDept = [{dept:'CS',merit:45,needBased:22,sports:8},{dept:'Phys',merit:28,needBased:18,sports:5},{dept:'Math',merit:24,needBased:15,sports:3},{dept:'ECE',merit:38,needBased:20,sports:7},{dept:'Mech',merit:32,needBased:17,sports:6}];
const pendingStudents   = [
  {name:'Ravi Kumar',rollNo:'CS21041',dept:'CS',amount:'₹45,000',due:'Mar 25',days:5,sem:'Sem 4'},
  {name:'Sneha Patel',rollNo:'PH21053',dept:'Phys',amount:'₹42,000',due:'Mar 25',days:5,sem:'Sem 4'},
  {name:'Arjun Sharma',rollNo:'ME21022',dept:'Mech',amount:'₹38,000',due:'Mar 20',days:0,sem:'Sem 4'},
  {name:'Priya Nair',rollNo:'EC21034',dept:'ECE',amount:'₹44,000',due:'Mar 15',days:-5,sem:'Sem 3'},
  {name:'Vikram Singh',rollNo:'CS21067',dept:'CS',amount:'₹45,000',due:'Mar 10',days:-10,sem:'Sem 4'},
  {name:'Meena Patel',rollNo:'PH21044',dept:'Phys',amount:'₹42,000',due:'Mar 5',days:-15,sem:'Sem 3'},
];
const semesterFeeData   = [
  {sem:'Sem 1',collected:2800000,target:3000000},{sem:'Sem 2',collected:3100000,target:3200000},
  {sem:'Sem 3',collected:2900000,target:3100000},{sem:'Sem 4',collected:3400000,target:3500000},
];

const facultyAttByMonth = {
  Jan:[{week:'Wk1',CS6001:88,CS6002:84,Phy:82},{week:'Wk2',CS6001:90,CS6002:86,Phy:80},{week:'Wk3',CS6001:87,CS6002:83,Phy:78},{week:'Wk4',CS6001:91,CS6002:87,Phy:83}],
  Feb:[{week:'Wk1',CS6001:89,CS6002:85,Phy:81},{week:'Wk2',CS6001:92,CS6002:88,Phy:84},{week:'Wk3',CS6001:90,CS6002:86,Phy:82},{week:'Wk4',CS6001:93,CS6002:89,Phy:85}],
  Mar:[{week:'Wk1',CS6001:91,CS6002:87,Phy:83},{week:'Wk2',CS6001:89,CS6002:84,Phy:80},{week:'Wk3',CS6001:93,CS6002:90,Phy:85},{week:'Wk4',CS6001:87,CS6002:85,Phy:81}],
  Apr:[{week:'Wk1',CS6001:84,CS6002:80,Phy:76},{week:'Wk2',CS6001:88,CS6002:83,Phy:79},{week:'Wk3',CS6001:86,CS6002:82,Phy:77},{week:'Wk4',CS6001:90,CS6002:86,Phy:82}],
  May:[{week:'Wk1',CS6001:82,CS6002:78,Phy:74},{week:'Wk2',CS6001:85,CS6002:81,Phy:77},{week:'Wk3',CS6001:83,CS6002:79,Phy:75},{week:'Wk4',CS6001:87,CS6002:83,Phy:79}],
  Jun:[{week:'Wk1',CS6001:85,CS6002:81,Phy:77},{week:'Wk2',CS6001:88,CS6002:84,Phy:80},{week:'Wk3',CS6001:86,CS6002:82,Phy:78},{week:'Wk4',CS6001:90,CS6002:86,Phy:82}],
  Jul:[{week:'Wk1',CS6001:87,CS6002:83,Phy:79},{week:'Wk2',CS6001:89,CS6002:85,Phy:81},{week:'Wk3',CS6001:91,CS6002:87,Phy:83},{week:'Wk4',CS6001:88,CS6002:84,Phy:80}],
  Aug:[{week:'Wk1',CS6001:90,CS6002:86,Phy:82},{week:'Wk2',CS6001:92,CS6002:88,Phy:84},{week:'Wk3',CS6001:91,CS6002:87,Phy:83},{week:'Wk4',CS6001:93,CS6002:89,Phy:85}],
  Sep:[{week:'Wk1',CS6001:88,CS6002:84,Phy:80},{week:'Wk2',CS6001:90,CS6002:86,Phy:82},{week:'Wk3',CS6001:87,CS6002:83,Phy:79},{week:'Wk4',CS6001:91,CS6002:87,Phy:83}],
  Oct:[{week:'Wk1',CS6001:92,CS6002:88,Phy:84},{week:'Wk2',CS6001:94,CS6002:90,Phy:86},{week:'Wk3',CS6001:91,CS6002:87,Phy:83},{week:'Wk4',CS6001:93,CS6002:89,Phy:85}],
  Nov:[{week:'Wk1',CS6001:86,CS6002:82,Phy:78},{week:'Wk2',CS6001:88,CS6002:84,Phy:80},{week:'Wk3',CS6001:85,CS6002:81,Phy:77},{week:'Wk4',CS6001:87,CS6002:83,Phy:79}],
  Dec:[{week:'Wk1',CS6001:84,CS6002:80,Phy:76},{week:'Wk2',CS6001:86,CS6002:82,Phy:78},{week:'Wk3',CS6001:83,CS6002:79,Phy:75}],
};
const facultySubByMonth = {
  Jan:[{week:'Wk1',onTime:38,late:7,missing:5},{week:'Wk2',onTime:41,late:5,missing:4},{week:'Wk3',onTime:39,late:6,missing:5},{week:'Wk4',onTime:43,late:4,missing:3}],
  Feb:[{week:'Wk1',onTime:40,late:6,missing:4},{week:'Wk2',onTime:43,late:4,missing:3},{week:'Wk3',onTime:42,late:5,missing:3},{week:'Wk4',onTime:44,late:3,missing:3}],
  Mar:[{week:'Wk1',onTime:42,late:5,missing:3},{week:'Wk2',onTime:38,late:8,missing:4},{week:'Wk3',onTime:44,late:4,missing:2},{week:'Wk4',onTime:40,late:7,missing:3}],
  Apr:[{week:'Wk1',onTime:36,late:9,missing:5},{week:'Wk2',onTime:39,late:7,missing:4},{week:'Wk3',onTime:41,late:6,missing:3},{week:'Wk4',onTime:43,late:4,missing:3}],
  May:[{week:'Wk1',onTime:35,late:10,missing:5},{week:'Wk2',onTime:38,late:8,missing:4},{week:'Wk3',onTime:40,late:7,missing:3},{week:'Wk4',onTime:42,late:5,missing:3}],
  Jun:[{week:'Wk1',onTime:39,late:7,missing:4},{week:'Wk2',onTime:41,late:5,missing:4},{week:'Wk3',onTime:43,late:4,missing:3},{week:'Wk4',onTime:44,late:3,missing:3}],
  Jul:[{week:'Wk1',onTime:40,late:6,missing:4},{week:'Wk2',onTime:43,late:4,missing:3},{week:'Wk3',onTime:44,late:4,missing:2},{week:'Wk4',onTime:45,late:3,missing:2}],
  Aug:[{week:'Wk1',onTime:42,late:5,missing:3},{week:'Wk2',onTime:44,late:3,missing:3},{week:'Wk3',onTime:45,late:3,missing:2},{week:'Wk4',onTime:46,late:2,missing:2}],
  Sep:[{week:'Wk1',onTime:41,late:6,missing:3},{week:'Wk2',onTime:43,late:4,missing:3},{week:'Wk3',onTime:44,late:4,missing:2},{week:'Wk4',onTime:45,late:3,missing:2}],
  Oct:[{week:'Wk1',onTime:44,late:4,missing:2},{week:'Wk2',onTime:46,late:2,missing:2},{week:'Wk3',onTime:45,late:3,missing:2},{week:'Wk4',onTime:47,late:2,missing:1}],
  Nov:[{week:'Wk1',onTime:40,late:6,missing:4},{week:'Wk2',onTime:42,late:5,missing:3},{week:'Wk3',onTime:41,late:6,missing:3},{week:'Wk4',onTime:43,late:4,missing:3}],
  Dec:[{week:'Wk1',onTime:38,late:7,missing:5},{week:'Wk2',onTime:40,late:6,missing:4},{week:'Wk3',onTime:39,late:7,missing:4}],
};
const facultyCardsByMonth = {
  Jan:{students:'152',att:'86%',submitted:'580',pending:'45'},Feb:{students:'154',att:'88%',submitted:'598',pending:'38'},
  Mar:{students:'156',att:'87%',submitted:'612',pending:'34'},Apr:{students:'153',att:'83%',submitted:'570',pending:'50'},
  May:{students:'150',att:'80%',submitted:'548',pending:'62'},Jun:{students:'151',att:'82%',submitted:'560',pending:'55'},
  Jul:{students:'155',att:'85%',submitted:'588',pending:'42'},Aug:{students:'157',att:'89%',submitted:'620',pending:'30'},
  Sep:{students:'155',att:'86%',submitted:'600',pending:'36'},Oct:{students:'158',att:'91%',submitted:'634',pending:'22'},
  Nov:{students:'154',att:'84%',submitted:'575',pending:'46'},Dec:{students:'150',att:'81%',submitted:'548',pending:'52'},
};
const marksDistByMonth = {
  Jan:[{range:GRADE_O,count:6},{range:GRADE_Ap,count:12},{range:GRADE_A,count:20},{range:GRADE_Bp,count:14},{range:GRADE_B,count:8},{range:GRADE_F,count:6}],
  Feb:[{range:GRADE_O,count:8},{range:GRADE_Ap,count:14},{range:GRADE_A,count:21},{range:GRADE_Bp,count:13},{range:GRADE_B,count:7},{range:GRADE_F,count:5}],
  Mar:[{range:GRADE_O,count:12},{range:GRADE_Ap,count:18},{range:GRADE_A,count:22},{range:GRADE_Bp,count:14},{range:GRADE_B,count:8},{range:GRADE_F,count:4}],
  Apr:[{range:GRADE_O,count:9},{range:GRADE_Ap,count:15},{range:GRADE_A,count:19},{range:GRADE_Bp,count:15},{range:GRADE_B,count:9},{range:GRADE_F,count:5}],
  May:[{range:GRADE_O,count:7},{range:GRADE_Ap,count:13},{range:GRADE_A,count:18},{range:GRADE_Bp,count:16},{range:GRADE_B,count:10},{range:GRADE_F,count:6}],
  Jun:[{range:GRADE_O,count:8},{range:GRADE_Ap,count:14},{range:GRADE_A,count:20},{range:GRADE_Bp,count:14},{range:GRADE_B,count:9},{range:GRADE_F,count:5}],
  Jul:[{range:GRADE_O,count:10},{range:GRADE_Ap,count:16},{range:GRADE_A,count:21},{range:GRADE_Bp,count:13},{range:GRADE_B,count:8},{range:GRADE_F,count:4}],
  Aug:[{range:GRADE_O,count:13},{range:GRADE_Ap,count:19},{range:GRADE_A,count:22},{range:GRADE_Bp,count:12},{range:GRADE_B,count:7},{range:GRADE_F,count:3}],
  Sep:[{range:GRADE_O,count:11},{range:GRADE_Ap,count:17},{range:GRADE_A,count:21},{range:GRADE_Bp,count:13},{range:GRADE_B,count:8},{range:GRADE_F,count:4}],
  Oct:[{range:GRADE_O,count:15},{range:GRADE_Ap,count:20},{range:GRADE_A,count:23},{range:GRADE_Bp,count:11},{range:GRADE_B,count:6},{range:GRADE_F,count:3}],
  Nov:[{range:GRADE_O,count:9},{range:GRADE_Ap,count:15},{range:GRADE_A,count:20},{range:GRADE_Bp,count:14},{range:GRADE_B,count:9},{range:GRADE_F,count:5}],
  Dec:[{range:GRADE_O,count:10},{range:GRADE_Ap,count:16},{range:GRADE_A,count:20},{range:GRADE_Bp,count:13},{range:GRADE_B,count:8},{range:GRADE_F,count:5}],
};
const examResultsBySubject = [
  {subject:'DBMS',pass:88,fail:12,avg:79},{subject:'Data Structures',pass:84,fail:16,avg:76},
  {subject:'Physics',pass:78,fail:22,avg:71},{subject:'Mathematics',pass:82,fail:18,avg:74},
  {subject:'CS Elective',pass:92,fail:8,avg:83},
];
const studentRiskData = [
  {name:'Ravi Kumar',rollNo:'CS21041',att:'62%',marks:58,risk:'high',subject:'DBMS'},
  {name:'Sneha Patel',rollNo:'CS21053',att:'65%',marks:62,risk:'high',subject:'DS'},
  {name:'Arjun Sharma',rollNo:'PH21012',att:'68%',marks:65,risk:'medium',subject:'Phy'},
  {name:'Priya Nair',rollNo:'CS21034',att:'71%',marks:67,risk:'medium',subject:'DBMS'},
  {name:'Amit Singh',rollNo:'CS21067',att:'74%',marks:69,risk:'low',subject:'Math'},
];

// ══════════════════════════════════════════════════════════════════════════════
// AGGREGATION HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function avgCardField(cardMap,months,field){
  const vals=months.map(m=>{const v=cardMap[m]?.[field];if(!v)return null;const n=parseFloat(String(v).replace(/[^\d.]/g,''));return isNaN(n)?null:n;}).filter(x=>x!==null);
  if(!vals.length)return cardMap['Mar']?.[field]??'—';
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  const sample=String(cardMap[months[months.length-1]]?.[field]??'');
  if(sample.includes('%'))return`${avg.toFixed(0)}%`;
  if(sample.includes('₹'))return cardMap[months[months.length-1]][field];
  if(sample.includes('/')){const t=months.reduce((a,m)=>{const p=String(cardMap[m]?.[field]??'0/0').split('/');return[a[0]+(parseInt(p[0])||0),a[1]+(parseInt(p[1])||0)];},[0,0]);return`${t[0]}/${t[1]}`;}
  if(sample.includes(','))return Math.round(avg).toLocaleString();
  return`${Math.round(avg)}`;
}
function avgAdminAtt(months){return DEPTS.map(d=>({dept:d,avg:Math.round(months.reduce((s,m)=>{const r=(adminAttByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.avg??0)},0)/months.length)}));}
function avgAdminExam(months){return DEPTS.map(d=>({dept:d,pass:Math.round(months.reduce((s,m)=>{const r=(adminExamByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.pass??0)},0)/months.length),fail:Math.round(months.reduce((s,m)=>{const r=(adminExamByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.fail??0)},0)/months.length)}));}
function avgFinancePie(months){return['Paid','Pending','Overdue'].map(n=>({name:n,value:Math.round(months.reduce((s,m)=>{const r=(financePieByMonth[m]??[]).find(x=>x.name===n);return s+(r?.value??0)},0)/months.length)}));}
function avgFinanceDept(months){return DEPTS.map(d=>({dept:d,paid:Math.round(months.reduce((s,m)=>{const r=(financeDeptByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.paid??0)},0)/months.length),pending:Math.round(months.reduce((s,m)=>{const r=(financeDeptByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.pending??0)},0)/months.length),overdue:Math.round(months.reduce((s,m)=>{const r=(financeDeptByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.overdue??0)},0)/months.length)}));}
function avgMarksDist(months){
  const keys=[GRADE_O,GRADE_Ap,GRADE_A,GRADE_Bp,GRADE_B,GRADE_F];
  return keys.map(r=>({range:r,count:Math.round(months.reduce((s,m)=>{const d=(marksDistByMonth[m]??[]).find(x=>x.range===r);return s+(d?.count??0)},0)/months.length)}));
}
function fmt(n){return(n/100000).toFixed(1)+'L';}
function fmtCr(n){return n>=10000000?`₹${(n/10000000).toFixed(1)}Cr`:`₹${(n/100000).toFixed(1)}L`;}

// ── Universal inside-slice pie label ─────────────────────────────────────────
const RADIAN=Math.PI/180;
function PieLabelInside({cx,cy,midAngle,innerRadius,outerRadius,value,percent,name,labelType='pct',threshold=6}){
  const pct=Math.round((percent??0)*100);
  if(pct<threshold)return null;
  const r=innerRadius+(outerRadius-innerRadius)*0.55;
  const x=cx+r*Math.cos(-midAngle*RADIAN);
  const y=cy+r*Math.sin(-midAngle*RADIAN);
  const txt=labelType==='count'?`${value}`:labelType==='name'?`${String(name).split(' ')[0]}`:`${pct}%`;
  return<text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} style={{pointerEvents:'none'}}>{txt}</text>;
}


// ── Report Export (Excel/PDF) ────────────────────────────────────────────────────────
function exportReport(format, role, months, rangeLabel, tab, analyticsData) {
  try {
    console.log('=== Export Debug ===');
    console.log('Export params:', { format, role, months, rangeLabel, tab });
    console.log('Analytics data available:', !!analyticsData);
    console.log('Student analytics:', analyticsData?.studentAnalytics);
    console.log('Finance data:', analyticsData?.financeData);
    
    let headers = [];
    let rows = [];
    
    if (role === 'admin') {
      if (tab === 'students') {
        headers = ['Month', 'Total Students', 'Avg Attendance', 'Avg CGPA', 'Placement Rate'];
        
        if (analyticsData && analyticsData.studentAnalytics) {
          console.log('Using real student data for export');
          const studentData = analyticsData.studentAnalytics;
          rows = months.map(m => {
            return [
              m,
              studentData.demographics?.totalStudents || 11,
              studentData.attendance?.averageAttendance || 85.5,
              studentData.academicPerformance?.averageCGPA || 7.8,
              studentData.placements?.placementRate || 54.5
            ];
          });
        } else {
          console.log('Using mock student data for export');
          rows = months.map(m => {
            const c = adminCardsByMonth[m] || adminCardsByMonth['Mar'];
            const att = Math.round((adminAttByMonth[m] || []).reduce((s, d) => s + d.avg, 0) / 5);
            const pass = Math.round((adminExamByMonth[m] || []).reduce((s, d) => s + d.pass, 0) / 5);
            return [m, c.students, att, pass, c.courses];
          });
        }
      } else if (tab === 'faculty') {
        headers = ['Department', 'Faculty Count'];
        
        if (analyticsData && analyticsData.facultyData) {
          console.log('Using real faculty data for export');
          const facultyByDept = analyticsData.facultyData.facultyByDept || {};
          rows = Object.entries(facultyByDept).map(([dept, count]) => {
            return [dept, count];
          });
        } else {
          console.log('Using mock faculty data for export');
          rows = DEPTS.map(d => [d, facultyByDept[d] || 0]);
        }
      } else if (tab === 'finance') {
        headers = ['Metric', 'Amount'];
        
        if (analyticsData && analyticsData.financeData) {
          console.log('Using real finance data for export');
          const financeData = analyticsData.financeData;
          rows = [
            ['Total Collected', financeData.totalCollected || 0],
            ['Total Pending', financeData.totalPending || 0],
            ['Scholarships Awarded', financeData.scholarshipsAwarded || 0]
          ];
        } else {
          console.log('Using mock finance data for export');
          rows = [
            ['Total Collected', 2445000],
            ['Total Pending', 243000],
            ['Scholarships Awarded', 12]
          ];
        }
      }
    } else if (role === 'finance') {
      headers = ['Month', 'Collected', 'Pending', 'Total'];
      
      if (analyticsData && analyticsData.financeData) {
        console.log('Using real finance data for finance role export');
        const financeData = analyticsData.financeData;
        rows = months.map(m => {
          const monthRevenue = financeData.monthlyRevenue?.find(r => r.month === m) || financeData.monthlyRevenue[0];
          return [
            m,
            monthRevenue?.collected || 0,
            monthRevenue?.pending || 0,
            (monthRevenue?.collected || 0) + (monthRevenue?.pending || 0)
          ];
        });
      } else {
        console.log('Using mock finance data for finance role export');
        rows = months.map(m => {
          const c = financeCardsByMonth[m] || financeCardsByMonth['Mar'];
          return [m, c.collected || 0, c.pending || 0, (c.collected || 0) + (c.pending || 0)];
        });
      }
    }
    
    console.log('Export rows:', rows);
    console.log('Export headers:', headers);
    
    // Create CSV content
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    console.log('CSV content length:', csv.length);
    
    // Generate filename
    const filename = `CMS_${role}_${tab}_${rangeLabel.replace(/[\s\u2013\u2192]/g, '_')}_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'txt'}`;
    console.log('Generated filename:', filename);
    
    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Add to DOM and click
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Report exported successfully as ${format}:`, filename);
    alert(`Report exported as ${filename}`);
    
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Error exporting report: ' + error.message);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CALENDAR RANGE PICKER
// ══════════════════════════════════════════════════════════════════════════════
function CalendarRangePicker({startMY,endMY,onChange,onClose}){
  // Initialize with existing dates
  const [viewYear,  setViewYear]  = useState(startMY?.year??new Date().getFullYear());
  const [phase,     setPhase]     = useState(startMY && endMY && (myToKey(startMY) !== myToKey(endMY)) ? 'end' : 'start');
  const [hoverKey,  setHoverKey]  = useState(null);
  const [tempStart, setTempStart] = useState(null);

  const confirmedStartKey = startMY ? myToKey(startMY) : null;
  const confirmedEndKey   = endMY   ? myToKey(endMY)   : null;

  // Reset phase and tempStart when dates change externally
  useEffect(() => {
    if (startMY && endMY && (myToKey(startMY) !== myToKey(endMY))) {
      setPhase('end');
      setTempStart(null);
    } else {
      setPhase('start');
      setTempStart(null);
    }
  }, [startMY, endMY]);

  function clickMonth(mi){
    const clicked = {month:mi, year:viewYear};
    const ck = myToKey(clicked);
    console.log('clickMonth:', { mi, phase, tempStart, clicked, ck });
    if(phase==='start'){
      // First click — set start, preview same as start for now
      console.log('Setting tempStart to:', clicked);
      setTempStart(clicked);
      onChange({startMY:clicked, endMY:clicked});
      console.log('Setting phase to end');
      setPhase('end');
      
      // Add timeout to check if tempStart was set
      setTimeout(() => {
        console.log('tempStart after timeout should be set');
      }, 100);
      
    } else {
      // Second click — finalise range
      if (!tempStart) {
        console.log('tempStart is null, returning');
        return;
      }
      const sk = myToKey(tempStart);
      // Always ensure start is earlier than end
      if(ck < sk){ 
        console.log('Calling onChange with:', {startMY:clicked, endMY:tempStart});
        onChange({startMY:clicked, endMY:tempStart}); 
      } else { 
        console.log('Calling onChange with:', {startMY:tempStart, endMY:clicked});
        onChange({startMY:tempStart, endMY:clicked}); 
      }
      console.log('Setting tempStart to null and phase to start');
      setTempStart(null);
      setPhase('start');
      onClose();
    }
  }

  function cellStyle(mi){
    const k   = myToKey({month:mi, year:viewYear});
    
    // Determine start and end keys for styling
    let sk, ek;
    
    if (phase === 'end' && tempStart) {
      // During end selection, use tempStart as start
      sk = myToKey(tempStart);
      ek = hoverKey != null ? hoverKey : confirmedEndKey;
    } else {
      // Use confirmed dates
      sk = confirmedStartKey;
      ek = confirmedEndKey;
    }
    
    const lo  = (sk!=null && ek!=null) ? Math.min(sk,ek) : null;
    const hi  = (sk!=null && ek!=null) ? Math.max(sk,ek) : null;
    const isEdge  = (sk!=null && k===sk) || (ek!=null && k===ek);
    const inRange = lo!=null && k>lo && k<hi;
    
    return{
      width:'100%',height:40,borderRadius:8,border:'none',fontSize:13,fontWeight:700,
      cursor:'pointer',transition:'all 0.1s',
      background: isEdge?'#2563eb': inRange?'#dbeafe':'transparent',
      color:      isEdge?'#fff'   : inRange?'#1e40af':'#374151',
      boxShadow:  isEdge?'0 2px 8px rgba(37,99,235,.3)':'none',
    };
  }

  const displayStart = tempStart ?? startMY;
  const displayEnd   = phase==='end' && hoverKey ? keyToMY(hoverKey) : endMY;

  return(
    <div style={{position:'absolute',zIndex:99999,top:'calc(100% + 10px)',left:0,background:'#fff',borderRadius:18,border:'2px solid #2563eb',boxShadow:'0 12px 40px rgba(0,0,0,.16)',padding:22,minWidth:350,maxWidth:400}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setViewYear(y=>y-1)} style={{width:28,height:28,borderRadius:7,border:'1px solid #e5e7eb',background:'#f9fafb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico.ChevL/></button>
          <select value={viewYear} onChange={e=>setViewYear(Number(e.target.value))} style={{border:'1px solid #e5e7eb',borderRadius:7,padding:'2px 6px',fontWeight:700,fontSize:14,color:'#111827',cursor:'pointer',outline:'none'}}>
            {YEARS.map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={()=>setViewYear(y=>y+1)} style={{width:28,height:28,borderRadius:7,border:'1px solid #e5e7eb',background:'#f9fafb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico.ChevR/></button>
        </div>
        <div style={{fontSize:12,fontWeight:600,padding:'3px 10px',borderRadius:999,
          color:      phase==='start'?'#2563eb':'#f97316',
          background: phase==='start'?'#eff6ff':'#fff7ed',
          border:`1px solid ${phase==='start'?'#bfdbfe':'#fed7aa'}`}}>
          {phase==='start'?'① Start month':'② End month'}
        </div>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:'1px solid #e5e7eb',background:'#f9fafb',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#6b7280'}}><Ico.Close/></button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
        {MONTHS_ALL.map((m,mi)=>(
          <button key={m}
            style={cellStyle(mi)}
            onClick={()=>clickMonth(mi)}
            onMouseEnter={()=>{ if(phase==='end') setHoverKey(myToKey({month:mi,year:viewYear})); }}
            onMouseLeave={()=>setHoverKey(null)}>
            {m}
          </button>
        ))}
      </div>

      <div style={{marginTop:14,padding:'8px 14px',background:'#f0fdf4',borderRadius:10,border:'1px solid #bbf7d0',fontSize:12,fontWeight:700,color:'#15803d',textAlign:'center'}}>
        {phase==='end' && displayStart
          ? `\uD83D\uDCC5 ${myLabel(displayStart)} \u2192 ${displayEnd ? myLabel(displayEnd) : '...'}`
          : (displayStart && displayEnd)
            ? (myLabel(displayStart)===myLabel(displayEnd))
                ? `\uD83D\uDCC5 ${myLabel(displayStart)}`
                : `\uD83D\uDCC5 ${myLabel(displayStart)} \u2192 ${myLabel(displayEnd)}`
            : '\uD83D\uDCC5 Pick start month'
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// UI ATOMS
// ══════════════════════════════════════════════════════════════════════════════
function SCard({label,value,sub,tone,icon,trend}){
  const bg={blue:'#eff6ff',green:'#f0fdf4',purple:'#f5f3ff',orange:'#fff7ed',red:'#fef2f2',teal:'#f0fdfa',cyan:'#ecfeff'};
  const tc={blue:'#2563eb',green:'#16a34a',purple:'#7c3aed',orange:'#c2410c',red:'#ef4444',teal:'#0f766e',cyan:'#0e7490'};
  return(
    <div style={{background:bg[tone]??'#f9fafb',borderRadius:14,padding:'18px 20px',border:`1px solid ${bg[tone]??'#f3f4f6'}`,flex:1,minWidth:0}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:24,fontWeight:800,color:tc[tone]??'#111827',lineHeight:1.1,marginBottom:4,letterSpacing:'-0.5px'}}>{value}</div>
          <div style={{fontSize:12,fontWeight:600,color:'#6b7280',marginBottom:4}}>{label}</div>
          <div style={{display:'flex',alignItems:'center',gap:3,fontSize:11,color:'#9ca3af'}}>
            {trend==='up'&&<span style={{color:'#22c55e',display:'flex'}}><Ico.Up/></span>}
            {trend==='down'&&<span style={{color:'#ef4444',display:'flex'}}><Ico.Down/></span>}
            {sub}
          </div>
        </div>
        <span style={{fontSize:26,opacity:.45,marginLeft:8}}>{icon}</span>
      </div>
    </div>
  );
}

function CC({title,subtitle,children,span2,style,action}){
  return(
    <div className="content-card" style={{marginBottom:0,gridColumn:span2?'span 2':'span 1',...style}}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:'#111827'}}>{title}</div>
          {subtitle&&<div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

const tH={fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.4,padding:'6px 10px',textAlign:'left',whiteSpace:'nowrap',borderBottom:'1.5px solid #f3f4f6'};
const tD={fontSize:12,padding:'9px 10px',verticalAlign:'middle',borderBottom:'1px solid #f9fafb'};
const miniBtn={fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:7,border:'1.5px solid #e5e7eb',background:'#fff',color:'#6b7280',cursor:'pointer'};

function RoleTab({tabs,active,onChange}){
  return(
    <div style={{display:'flex',gap:4,background:'#f3f4f6',borderRadius:12,padding:4,marginBottom:24}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,height:36,borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,transition:'all 0.18s',
          background:active===t.id?'#fff':'transparent',
          color:active===t.id?'#2563eb':'#6b7280',
          boxShadow:active===t.id?'0 1px 6px rgba(0,0,0,.1)':'none'
        }}>{t.icon} {t.label}</button>
      ))}
    </div>
  );
}

function AlertBanner({items}){
  if(!items?.length)return null;
  return(
    <div style={{display:'flex',gap:10,alignItems:'flex-start',padding:'12px 18px',borderRadius:12,background:'#fff7ed',border:'1.5px solid #fed7aa',marginBottom:20}}>
      <span style={{fontSize:18,marginTop:1}}>⚠️</span>
      <div>
        <div style={{fontWeight:700,fontSize:13,color:'#92400e',marginBottom:2}}>Action Required</div>
        <div style={{fontSize:12,color:'#b45309'}}>{items.join(' · ')}</div>
      </div>
    </div>
  );
}

function MiniProgress({value,max=100,color=C.blue}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <div style={{flex:1,height:6,borderRadius:3,background:'#f3f4f6',overflow:'hidden'}}>
        <div style={{height:'100%',width:`${Math.min(100,(value/max)*100)}%`,background:color,borderRadius:3}}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,color:'#374151',minWidth:32,textAlign:'right'}}>{value}%</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN VIEW
// ══════════════════════════════════════════════════════════════════════════════
const FACULTY_LIST = {
  CS:[
    {name:'Dr. Ramesh Kumar',   designation:'Professor',     subject:'Database Systems',     att:'91%',passRate:'93%',exp:'12 yrs'},
    {name:'Prof. Lakshmi Nair', designation:'Assoc. Prof',   subject:'Data Structures',      att:'88%',passRate:'90%',exp:'8 yrs'},
    {name:'Dr. Anil Verma',     designation:'Asst. Prof',    subject:'OS & Networks',        att:'85%',passRate:'87%',exp:'5 yrs'},
    {name:'Ms. Priya Suresh',   designation:'Lecturer',      subject:'Web Technologies',     att:'82%',passRate:'84%',exp:'3 yrs'},
  ],
  Phys:[
    {name:'Dr. Sunita Sharma',  designation:'Professor',     subject:'Quantum Mechanics',    att:'89%',passRate:'86%',exp:'14 yrs'},
    {name:'Prof. Vikram Iyer',  designation:'Assoc. Prof',   subject:'Thermodynamics',       att:'84%',passRate:'82%',exp:'9 yrs'},
    {name:'Dr. Meena Pillai',   designation:'Asst. Prof',    subject:'Electromagnetism',     att:'80%',passRate:'79%',exp:'4 yrs'},
  ],
  Math:[
    {name:'Dr. Deepak Gupta',   designation:'Professor',     subject:'Linear Algebra',       att:'87%',passRate:'88%',exp:'11 yrs'},
    {name:'Prof. Anjali Mehta', designation:'Assoc. Prof',   subject:'Calculus',             att:'85%',passRate:'85%',exp:'7 yrs'},
    {name:'Ms. Divya Krishnan', designation:'Asst. Prof',    subject:'Statistics',           att:'81%',passRate:'81%',exp:'3 yrs'},
  ],
  ECE:[
    {name:'Dr. Suresh Babu',    designation:'Professor',     subject:'VLSI Design',          att:'92%',passRate:'92%',exp:'13 yrs'},
    {name:'Prof. Rekha Joshi',  designation:'Assoc. Prof',   subject:'Signal Processing',    att:'89%',passRate:'89%',exp:'9 yrs'},
    {name:'Dr. Arjun Patel',    designation:'Asst. Prof',    subject:'Microprocessors',      att:'86%',passRate:'86%',exp:'6 yrs'},
    {name:'Mr. Kiran Rao',      designation:'Lecturer',      subject:'Circuit Theory',       att:'83%',passRate:'83%',exp:'2 yrs'},
  ],
  Mech:[
    {name:'Dr. Venkat Reddy',   designation:'Professor',     subject:'Thermofluids',         att:'88%',passRate:'88%',exp:'10 yrs'},
    {name:'Prof. Smitha Das',   designation:'Assoc. Prof',   subject:'Machine Design',       att:'84%',passRate:'85%',exp:'8 yrs'},
    {name:'Dr. Rahul Nair',     designation:'Asst. Prof',    subject:'Manufacturing',        att:'81%',passRate:'82%',exp:'4 yrs'},
  ],
};

function AdminView({activeMonths,rangeLabel,department,semester,analyticsData}){
  const [tab,setTab]=useState('students');  // Set students as default tab
  const dc=DEPT_CODE[department];

  // Debug: Add this at top of AdminView component to see what data we have
  console.log('=== AdminView Data Debug ===');
  console.log('analyticsData prop:', analyticsData);
  console.log('analyticsData keys:', analyticsData ? Object.keys(analyticsData) : 'null');
  console.log('studentAnalytics:', analyticsData?.studentAnalytics);
  console.log('summaryData:', analyticsData?.summaryData);

  // Debug logging
  console.log('AdminView received analyticsData:', analyticsData);
  console.log('Student analytics available:', analyticsData?.studentAnalytics);
  console.log('Total students from analytics:', analyticsData?.studentAnalytics?.demographics?.totalStudents);

  // Use real analytics data if available, otherwise fall back to mock data
  const useRealData = analyticsData && 
                       (analyticsData.studentAnalytics || analyticsData.summaryData || analyticsData.studentsByDept);
  console.log('useRealData:', useRealData);
  
  // Real data processing
  const realData = useRealData ? {
    studentsByDept: analyticsData.studentsByDept || {},
    attendanceData: analyticsData.attendanceData || [],
    departmentAttendance: analyticsData.departmentAttendance || [],
    performanceData: analyticsData.performanceData || [],
    summaryData: analyticsData.summaryData || {},
    departmentData: analyticsData.departmentData || [],
    facultyData: analyticsData.facultyData || {},
    studentAnalytics: analyticsData.studentAnalytics || {},
    realDeptAttendance: analyticsData.studentAnalytics?.attendance?.byDepartment || {},
    passFailData: analyticsData.passFailData || []  // Use backend pass/fail data
  } : null;

  const aAttData  = useMemo(()=>{
    if (useRealData && realData.departmentAttendance && realData.departmentAttendance.length > 0) {
      return realData.departmentAttendance.map(d => ({dept: d.department, avg: d.attendance || 0}));
    } else if (useRealData && realData.realDeptAttendance) {
      return Object.entries(realData.realDeptAttendance).map(([dept, att]) => ({dept, avg: att}));
    } else if (useRealData && realData.attendanceData) {
      return realData.attendanceData.map(d => ({dept: d.department || 'All', avg: d.attendance || 0}));
    }
    return avgAdminAtt(activeMonths);
  },[activeMonths, useRealData, realData]);
  
  const aExamData = useMemo(()=>useRealData && realData.passFailData && realData.passFailData.length > 0 ? 
    realData.passFailData.map(d => ({dept: d.dept, pass: d.pass, fail: d.fail})) :
    useRealData && realData.examData ? 
    realData.examData.map(d => ({dept: d.department || 'All', pass: d.passRate || 0, fail: 100 - (d.passRate || 0)})) :
    avgAdminExam(activeMonths),[activeMonths, useRealData, realData]);

  const lastMonth = activeMonths[activeMonths.length-1];
  const aCards    = useMemo(()=>{
    console.log('=== Admin Cards Debug ===');
    console.log('useRealData:', useRealData);
    console.log('realData exists:', !!realData);
    console.log('realData.summaryData:', realData?.summaryData);
    console.log('realData.studentAnalytics:', realData?.studentAnalytics);
    console.log('avgAttendance from studentAnalytics:', realData?.studentAnalytics?.attendance?.averageAttendance);
    console.log('avgCGPA from studentAnalytics:', realData?.studentAnalytics?.academicPerformance?.averageCGPA);
    
    if (useRealData && realData && (realData.summaryData || realData.studentAnalytics)) {
      console.log('Using REAL data for cards');
      const cards = {
        students: realData.summaryData?.students || realData.summaryData?.totalStudents?.toString() || realData.studentAnalytics?.demographics?.totalStudents?.toString() || '0',
        faculty: realData.summaryData?.faculty || '0',
        courses: realData.summaryData?.courses || '44',
        avgAttendance: realData.studentAnalytics?.attendance?.averageAttendance ? 
          `${realData.studentAnalytics.attendance.averageAttendance}%` : 
          (realData.summaryData?.averageAttendance ? `${realData.summaryData.averageAttendance}%` : '85%'),
        avgCGPA: realData.studentAnalytics?.academicPerformance?.averageCGPA ? 
          realData.studentAnalytics.academicPerformance.averageCGPA.toFixed(1) : 
          (realData.summaryData?.averagePerformance ? realData.summaryData.averagePerformance.toFixed(1) : '7.8'),
        placementRate: realData.studentAnalytics?.placements?.placementRate ? 
          `${realData.studentAnalytics.placements.placementRate}%` : '54.5%'
      };
      console.log('Real cards data:', cards);
      return cards;
    }
    console.log('Using MOCK data for cards');
    return {
      students:avgCardField(adminCardsByMonth,activeMonths,'students'),
      faculty:avgCardField(adminCardsByMonth,activeMonths,'faculty'),
      courses:avgCardField(adminCardsByMonth,activeMonths,'courses'),
      avgAttendance: '85%',
      avgCGPA: '7.8',
      placementRate: '54.5%'
    };
  },[activeMonths, useRealData, realData]);

  const filteredAtt  = dc?aAttData.filter(d=>d.dept===dc):aAttData;
  const filteredExam = dc?aExamData.filter(d=>d.dept===dc):aExamData;

  const attTrendData  = activeMonths.map(mn=>{const row={month:mn};(dc?[dc]:DEPTS).forEach(d=>{const f=(adminAttByMonth[mn]??[]).find(x=>x.dept===d);row[d]=f?.avg??0;});return row;});
  const passTrendData = activeMonths.map(mn=>{const row={month:mn};(dc?[dc]:DEPTS).forEach(d=>{const f=(adminExamByMonth[mn]??[]).find(x=>x.dept===d);row[d]=f?.pass??0;});return row;});
  const incExpData    = activeMonths.map(mn=>({month:mn,...(incomeExpenseByMonth[mn]??{income:0,expense:0})}));

  const rankingData = useMemo(()=>{
    if (useRealData && realData.departmentData && realData.departmentData.length > 0) {
      return realData.departmentData.map(d => ({
        dept: d.name,
        att: d.avgAttendance || 85,
        pass: d.cgpa ? Math.round((d.cgpa - 6) * 10 + 85) : 85, // Estimate pass rate from CGPA
        cgpa: d.cgpa || 7.5,
        score: Math.round((d.avgAttendance || 85) * 0.3 + (d.cgpa ? Math.round((d.cgpa - 6) * 10 + 85) : 85) * 0.5 + (d.cgpa || 7.5) * 2.2),
        students: d.students || 0,
        faculty: d.faculty || 0
      }));
    }
    return DEPTS.map(d=>{
      const att=Math.round(activeMonths.reduce((s,m)=>{const f=(adminAttByMonth[m]??[]).find(x=>x.dept===d);return s+(f?.avg??0)},0)/activeMonths.length);
      const pass=Math.round(activeMonths.reduce((s,m)=>{const f=(adminExamByMonth[m]??[]).find(x=>x.dept===d);return s+(f?.pass??0)},0)/activeMonths.length);
      const cgpa=cgpaByDept[d]??0;
      const score=Math.round(att*0.3+pass*0.5+cgpa*2.2);
      return{dept:d,att,pass,cgpa,score,students:studentsByDept[d]??0,faculty:facultyByDept[d]??0};
    }).sort((a,b)=>b.score-a.score);
  },[activeMonths, useRealData, realData]);

  const alerts=[];
  rankingData.forEach(d=>{if(d.att<80)alerts.push(`${d.dept} attendance ${d.att}%`);});
  rankingData.forEach(d=>{if(d.pass<80)alerts.push(`${d.dept} pass rate ${d.pass}%`);});
  const deptPieData = useMemo(() => {
    if (useRealData && realData.studentsByDept && Object.keys(realData.studentsByDept).length > 0) {
      return Object.entries(realData.studentsByDept).map(([name, value]) => ({name, value}));
    } else if (useRealData && realData.studentAnalytics?.demographics?.byDepartment) {
      return Object.entries(realData.studentAnalytics.demographics.byDepartment).map(([name, value]) => ({name, value}));
    }
    return Object.entries(dc?{[dc]:studentsByDept[dc]}:studentsByDept).map(([k,v])=>({name:DEPT_FULL[k]??k,value:v}));
  }, [useRealData, realData, dc]);
  
  // Debug logging for charts
  console.log('=== Chart Data Debug ===');
  console.log('deptPieData:', deptPieData);
  console.log('yearPieData:', yearPieData);
  console.log('studentsByDept from realData:', realData?.studentsByDept);
  console.log('enrollment byYear from studentAnalytics:', realData?.studentAnalytics?.enrollment?.byYear);
  const facultyPieData=useRealData && realData.facultyData?.facultyByDept ?
    Object.entries(realData.facultyData.facultyByDept).map(([k,v])=>({name:k,value:v})) :
    Object.entries(dc?{[dc]:facultyByDept[dc]}:facultyByDept).map(([k,v])=>({name:k,value:v}));
  const cgpaDeptData = useRealData && realData.departmentData ? 
    realData.departmentData.map(d => ({dept: d.name, cgpa: d.cgpa || 7.5})) :
    (dc?[{dept:dc,cgpa:cgpaByDept[dc]}]:DEPTS.map(d=>({dept:d,cgpa:cgpaByDept[d]}))).filter(Boolean);

  const genderData = useMemo(() => {
  if (useRealData && realData.studentAnalytics?.demographics?.byGender) {
    return Object.entries(realData.studentAnalytics.demographics.byGender).map(([name, value]) => ({name, value}));
  }
  return [
    {name: "Male", value: 6},
    {name: "Female", value: 5}
  ];
}, [useRealData, realData]);

  const TABS=[{id:'students',icon:'🎓',label:'Students'},{id:'faculty',icon:'👨‍🏫',label:'Faculty'},{id:'finance',icon:'💰',label:'Finance'}];

  // Use real data for calculations if available
  const totalIncome  = useRealData && realData.summaryData?.income ? realData.summaryData.income : activeMonths.reduce((s,m)=>s+(incomeExpenseByMonth[m]?.income??0),0);
  const totalExpense = useRealData && realData.summaryData?.expense ? realData.summaryData.expense : activeMonths.reduce((s,m)=>s+(incomeExpenseByMonth[m]?.expense??0),0);
  const avgAtt       = useRealData && realData.summaryData?.averageAttendance ? realData.summaryData.averageAttendance : Math.round(activeMonths.reduce((s,m)=>(adminAttByMonth[m]??[]).reduce((a,d)=>a+d.avg,0)/5+s,0)/activeMonths.length);
  const avgPass      = useRealData && realData.summaryData?.averagePerformance ? realData.summaryData.averagePerformance : Math.round(activeMonths.reduce((s,m)=>(adminExamByMonth[m]??[]).reduce((a,d)=>a+d.pass,0)/5+s,0)/activeMonths.length);
  const deptCount    = useRealData && realData.summaryData?.departmentList ? realData.summaryData.departmentList.length : 5;

  return(
    <>
      <AlertBanner items={alerts}/>
      <RoleTab tabs={TABS} active={tab} onChange={setTab}/>

      {tab==='students'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            <SCard label="Total Students"   value={aCards.students} sub={rangeLabel}               tone="blue"   icon="🎓" trend="up"/>
            <SCard label="Avg Attendance"   value={aCards.avgAttendance} sub="College-wide" tone="green" icon="📅" trend="up"/>
            <SCard label="Avg CGPA"         value={aCards.avgCGPA} sub="Academic performance" tone="purple" icon="🎯" trend="up"/>
            <SCard label="Placement Rate"   value={aCards.placementRate} sub="Students placed" tone="orange"  icon="💼" trend="up"/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="👥 Students by Department" subtitle="Distribution across depts">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={deptPieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={<PieLabelInside labelType="count"/>} labelLine={false}>
                  {deptPieData.map((_,i)=><Cell key={i} fill={Object.values(DEPT_COLORS)[i%5]}/>)}
                </Pie><Tooltip {...TT}/></PieChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📊 Students by Year" subtitle="Year-wise enrollment">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={yearPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                  {yearPieData.map((_,i)=><Cell key={i} fill={[C.blue,C.cyan,C.green,C.purple][i]}/>)}
                </Pie><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:11}}/></PieChart>
              </ResponsiveContainer>
            </CC>
            <CC title="⚧ Gender Distribution" subtitle="Student gender breakdown">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={genderData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={<PieLabelInside labelType="pct"/>} labelLine={false}>
                  {genderData.map((_,i)=><Cell key={i} fill={[C.blue,C.orange,C.teal][i]}/>)}
                </Pie><Tooltip {...TT}/></PieChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="📅 Dept-wise Attendance" subtitle={`Avg % — ${rangeLabel}`}>
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={filteredAtt} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[60,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip {...TT} formatter={v=>`${v}%`}/>
                  <Bar dataKey="avg" name="Attendance%" radius={[6,6,0,0]}>{filteredAtt.map((d,i)=><Cell key={i} fill={d.avg<80?C.red:d.avg<85?C.orange:C.blue}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📝 Exam Pass vs Fail" subtitle={`Pass/fail breakdown — ${rangeLabel}`}>
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={filteredExam} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:12}}/>
                  <Bar dataKey="pass" name="Pass%" stackId="a" fill={C.green} radius={[0,0,0,0]}/><Bar dataKey="fail" name="Fail%" stackId="a" fill={C.red} radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="🎓 Average CGPA by Department" subtitle={dc?`${dc}`:'All departments'}>
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={cgpaDeptData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[7,10]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT} formatter={v=>v.toFixed(1)}/>
                  <Bar dataKey="cgpa" name="Avg CGPA" radius={[6,6,0,0]}>{cgpaDeptData.map((_,i)=><Cell key={i} fill={Object.values(DEPT_COLORS)[i%5]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="🏆 Department Rankings" subtitle={`Score = att 30% + pass 50% + CGPA 20%`}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={tH}>#</th><th style={tH}>Dept</th><th style={tH}>Att</th><th style={tH}>Pass</th><th style={tH}>CGPA</th><th style={tH}>Score</th></tr></thead>
                <tbody>{rankingData.map((d,i)=>(
                  <tr key={d.dept} style={{background:i===0?'#fffbeb':i===1?'#f0fdf4':'#fff'}}>
                    <td style={{...tD,fontSize:16}}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</td>
                    <td style={{...tD,fontWeight:700}}><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:DEPT_COLORS[d.dept],marginRight:6}}/>{d.dept}</td>
                    <td style={{...tD,color:d.att<80?C.red:C.green,fontWeight:700}}>{d.att}%</td>
                    <td style={{...tD,color:d.pass<80?C.red:C.green,fontWeight:700}}>{d.pass}%</td>
                    <td style={{...tD,fontWeight:700}}>{d.cgpa}</td>
                    <td style={tD}><MiniProgress value={d.score} color={Object.values(DEPT_COLORS)[i]}/></td>
                  </tr>
                ))}</tbody>
              </table>
            </CC>
          </div>

          {/* Student Performance Analytics */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="🏆 Top Performers" subtitle="Highest CGPA students">
              <div style={{maxHeight: 300, overflowY: 'auto'}}>
                {(useRealData && realData.studentAnalytics?.academicPerformance?.topPerformers ? 
                  realData.studentAnalytics.academicPerformance.topPerformers : 
                  [
                    {name: "Alice Johnson", rollNumber: "CS2023001", cgpa: 9.2, department: "CS", attendance: 95},
                    {name: "Bob Smith", rollNumber: "ME2023005", cgpa: 8.8, department: "ME", attendance: 92}
                  ]).map((student, i) => (
                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6'}}>
                    <div>
                      <div style={{fontWeight: 600, color: '#1f2937'}}>{student.name}</div>
                      <div style={{fontSize: 12, color: '#6b7280'}}>{student.rollNumber} • {student.department}</div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontWeight: 600, color: '#059669', fontSize: 14}}>{student.cgpa} CGPA</div>
                      <div style={{fontSize: 12, color: '#6b7280'}}>{student.attendance}% att</div>
                    </div>
                  </div>
                ))}
              </div>
            </CC>
            <CC title="⚠️ At-Risk Students" subtitle="Students needing attention">
              <div style={{maxHeight: 300, overflowY: 'auto'}}>
                {(useRealData && realData.studentAnalytics?.academicPerformance?.atRiskStudents ? 
                  realData.studentAnalytics.academicPerformance.atRiskStudents : 
                  [
                    {name: "Charlie Brown", rollNumber: "EE2023010", cgpa: 5.2, department: "EE", attendance: 68, risk: "Medium"}
                  ]).map((student, i) => (
                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6'}}>
                    <div>
                      <div style={{fontWeight: 600, color: '#1f2937'}}>{student.name}</div>
                      <div style={{fontSize: 12, color: '#6b7280'}}>{student.rollNumber} • {student.department}</div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontWeight: 600, color: student.risk === 'High' ? '#dc2626' : '#f59e0b', fontSize: 14}}>{student.cgpa} CGPA</div>
                      <div style={{fontSize: 12, color: '#6b7280'}}>{student.attendance}% att</div>
                      <div style={{fontSize: 10, padding: '2px 6px', borderRadius: 4, background: student.risk === 'High' ? '#fee2e2' : '#fef3c7', color: student.risk === 'High' ? '#dc2626' : '#f59e0b', marginTop: 2}}>{student.risk} Risk</div>
                    </div>
                  </div>
                ))}
              </div>
            </CC>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="🗓️ Attendance Heatmap" subtitle="Dept × Month — color = avg attendance" style={{marginBottom:20}}>
              <div style={{overflowX:'auto'}}>
                <table style={{borderCollapse:'separate',borderSpacing:4,width:'100%'}}>
                  <thead><tr><th style={{...tH,width:50}}>Dept</th>{MONTHS_ALL.map(m=><th key={m} style={{...tH,textAlign:'center',minWidth:44,padding:'4px 2px'}}>{m}</th>)}<th style={{...tH,textAlign:'center'}}>Avg</th></tr></thead>
                  <tbody>{(dc?[dc]:DEPTS).map(d=>{
                    const vals=MONTHS_ALL.map(m=>(adminAttByMonth[m]??[]).find(x=>x.dept===d)?.avg??0);
                    const rowAvg=Math.round(vals.reduce((a,b)=>a+b,0)/12);
                    return<tr key={d}><td style={{fontSize:12,fontWeight:700,padding:'2px 8px'}}><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:DEPT_COLORS[d],marginRight:5}}/>{d}</td>
                      {vals.map((v,mi)=>{
                        const inSel=activeMonths.includes(MONTHS_ALL[mi]);
                        const bg=v<78?`rgba(239,68,68,${0.15+((v-60)/30)*0.5})`:v<84?`rgba(249,115,22,${0.15+((v-70)/25)*0.5})`:`rgba(37,99,235,${0.12+((v-75)/20)*0.5})`;
                        return<td key={mi} title={`${d} ${MONTHS_ALL[mi]}: ${v}%`} style={{background:bg,borderRadius:6,border:inSel?'2px solid #f97316':'2px solid transparent',textAlign:'center',fontSize:11,fontWeight:700,color:v<78?'#b91c1c':v<84?'#c2410c':'#1e40af',padding:'5px 2px',minWidth:44,cursor:'default'}}>{v}%</td>;
                      })}
                      <td style={{textAlign:'center',fontSize:12,fontWeight:800,color:rowAvg<80?C.red:rowAvg<85?C.orange:C.blue,padding:'5px 6px'}}>{rowAvg}%</td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
              <div style={{display:'flex',gap:14,marginTop:8,fontSize:11,color:'#6b7280',flexWrap:'wrap'}}>
                {[['rgba(239,68,68,0.5)','<78% Low'],['rgba(249,115,22,0.5)','78-84% Watch'],['rgba(37,99,235,0.5)','85%+ Good']].map(([bg,lbl])=>(
                  <span key={lbl} style={{display:'flex',alignItems:'center',gap:4}}><span style={{display:'inline-block',width:12,height:12,borderRadius:2,background:bg}}/>{lbl}</span>
                ))}
                <span style={{color:'#f97316',fontWeight:600,marginLeft:4}}>🟠 bordered = selected range</span>
              </div>
            </CC>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
              <CC title="📈 Attendance Trend — All Depts" subtitle="12 months, per department">
                <ResponsiveContainer width="100%" height={H2}>
                  <LineChart data={attTrendData} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[65,100]} tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:10}}/>
                    {(dc?[dc]:DEPTS).map(d=><Line key={d} type="monotone" dataKey={d} stroke={DEPT_COLORS[d]} strokeWidth={1.8} dot={false}/>)}
                  </LineChart>
                </ResponsiveContainer>
              </CC>
              <CC title="📊 Pass Rate Trend — All Depts" subtitle="12 months, per department">
                <ResponsiveContainer width="100%" height={H2}>
                  <LineChart data={passTrendData} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[60,100]} tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:10}}/>
                    {(dc?[dc]:DEPTS).map(d=><Line key={d} type="monotone" dataKey={d} stroke={DEPT_COLORS[d]} strokeWidth={1.8} dot={false}/>)}
                  </LineChart>
                </ResponsiveContainer>
              </CC>
            </div>
          </div>
        </>
      )}

      {tab==='faculty'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            <SCard label="Total Faculty"    value={aCards.faculty}  sub={rangeLabel}        tone="blue"   icon="👨‍🏫"/>
            <SCard label="Departments"      value={useRealData && realData.summaryData?.departmentList ? realData.summaryData.departmentList.length : 5} sub="Active" tone="green"  icon="🏫"/>
            <SCard label="Avg Pass Rate"    value={`${Math.round(activeMonths.reduce((s,m)=>(adminExamByMonth[m]??[]).reduce((a,d)=>a+d.pass,0)/5+s,0)/activeMonths.length)}%`} sub="College avg" tone="purple" icon="✅"/>
            <SCard label="Total Courses"    value={aCards.courses}  sub={semester}          tone="orange"  icon="📚"/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="👨‍🏫 Faculty by Department" subtitle="Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={facultyPieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={<PieLabelInside labelType="count"/>} labelLine={false}>
                  {facultyPieData.map((_,i)=><Cell key={i} fill={Object.values(DEPT_COLORS)[i%5]}/>)}
                </Pie><Tooltip {...TT}/></PieChart>
              </ResponsiveContainer>
            </CC>
            <CC title="🎖️ Faculty Rank Distribution" subtitle="By academic rank">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={facultyRankData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="count" label={<PieLabelInside labelType="count"/>} labelLine={false}>
                  {facultyRankData.map((_,i)=><Cell key={i} fill={[C.blue,C.purple,C.cyan,C.teal][i]}/>)}
                </Pie><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:10}}/></PieChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📊 Faculty Count per Dept" subtitle="Bar view">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={useRealData && realData.facultyData?.facultyByDept ? 
                  Object.entries(realData.facultyData.facultyByDept).map(([dept,count])=>({dept,count})) :
                  Object.entries(dc?{[dc]:facultyByDept[dc]}:facultyByDept).map(([dept,count])=>({dept,count}))} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="count" name="Faculty" radius={[6,6,0,0]}>
                    {(useRealData && realData.facultyData?.facultyByDept ? 
                      Object.entries(realData.facultyData.facultyByDept) :
                      Object.entries(dc?{[dc]:facultyByDept[dc]}:facultyByDept)
                    ).map((_,i)=><Cell key={i} fill={Object.values(DEPT_COLORS)[i%5]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:20,marginBottom:20}}>
            <CC title="📅 Dept Attendance & Performance" subtitle={`${rangeLabel} — composite view`}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={tH}>Dept</th><th style={tH}>Faculty</th><th style={tH}>Students</th><th style={tH}>Avg Att</th><th style={tH}>CGPA</th><th style={tH}>Pass%</th><th style={tH}>Status</th></tr></thead>
                <tbody>{(dc?rankingData.filter(r=>r.dept===dc):rankingData).map((d,i)=>(
                  <tr key={d.dept} style={{background:i%2===0?'#fafafa':'#fff'}}>
                    <td style={{...tD,fontWeight:700}}><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:DEPT_COLORS[d.dept],marginRight:6}}/>{d.dept}</td>
                    <td style={tD}>{d.faculty}</td>
                    <td style={tD}>{d.students.toLocaleString()}</td>
                    <td style={{...tD,fontWeight:700,color:d.att<80?C.red:C.green}}>{d.att}%</td>
                    <td style={{...tD,fontWeight:700}}>{d.cgpa}</td>
                    <td style={{...tD,fontWeight:700,color:d.pass<80?C.red:C.green}}>{d.pass}%</td>
                    <td style={tD}><span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:999,background:d.att>=85&&d.pass>=88?'#f0fdf4':d.att>=80&&d.pass>=82?'#fff7ed':'#fef2f2',color:d.att>=85&&d.pass>=88?'#16a34a':d.att>=80&&d.pass>=82?'#c2410c':'#b91c1c'}}>{d.att>=85&&d.pass>=88?'✅ Excellent':d.att>=80&&d.pass>=82?'⚠️ Average':'🔴 Needs Attention'}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </CC>
            <CC title="🏅 Rankings Summary" subtitle="Composite performance score">
              {rankingData.map((d,i)=>(
                <div key={d.dept} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #f9fafb'}}>
                  <span style={{fontSize:18,width:24}}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>{d.dept}</div>
                    <MiniProgress value={d.score} color={Object.values(DEPT_COLORS)[i]}/>
                  </div>
                  <span style={{fontSize:14,fontWeight:800,color:Object.values(DEPT_COLORS)[i],minWidth:32}}>{d.score}</span>
                </div>
              ))}
            </CC>
          </div>

          <CC title="👨‍🏫 Faculty Directory" subtitle={dc?`${dc} — individual faculty list`:'All departments — click a dept filter above to narrow'} style={{marginBottom:20}}>
            {(useRealData && realData.summaryData?.departmentList ? realData.summaryData.departmentList : (dc?[dc]:DEPTS)).map(deptKey=>(
              <div key={deptKey} style={{marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,padding:'10px 14px',background:DEPT_COLORS[deptKey]+'15',borderRadius:10,border:`1.5px solid ${DEPT_COLORS[deptKey]}40`}}>
                  <span style={{display:'inline-block',width:12,height:12,borderRadius:3,background:DEPT_COLORS[deptKey]}}/>
                  <span style={{fontWeight:800,fontSize:14,color:DEPT_COLORS[deptKey]}}>{deptKey}</span>
                  <span style={{fontSize:12,color:'#6b7280',marginLeft:4}}>— {FACULTY_LIST[deptKey]?.length??0} faculty members</span>
                  <span style={{marginLeft:'auto',fontSize:12,fontWeight:700,color:'#374151'}}>Avg Att: <span style={{color:C.green}}>{rankingData.find(r=>r.dept===deptKey)?.att??0}%</span></span>
                  <span style={{fontSize:12,fontWeight:700,color:'#374151'}}>Pass: <span style={{color:C.blue}}>{rankingData.find(r=>r.dept===deptKey)?.pass??0}%</span></span>
                </div>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr><th style={tH}>Name</th><th style={tH}>Designation</th><th style={tH}>Subject</th><th style={tH}>Attendance</th><th style={tH}>Pass Rate</th><th style={tH}>Experience</th><th style={tH}>Status</th></tr></thead>
                  <tbody>{(FACULTY_LIST[deptKey]??[]).map((f,i)=>{
                    const attNum=parseInt(f.att);
                    const passNum=parseInt(f.passRate);
                    return(
                      <tr key={i} style={{background:i%2===0?'#fafafa':'#fff'}}>
                        <td style={{...tD,fontWeight:700,fontSize:13}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{width:30,height:30,borderRadius:999,background:DEPT_COLORS[deptKey]+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:DEPT_COLORS[deptKey]}}>{f.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                            {f.name}
                          </div>
                        </td>
                        <td style={tD}><span style={{fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:999,background:f.designation==='Professor'?'#fffbeb':f.designation.includes('Assoc')?'#eff6ff':f.designation.includes('Asst')?'#f5f3ff':'#f3f4f6',color:f.designation==='Professor'?'#b45309':f.designation.includes('Assoc')?'#1d4ed8':f.designation.includes('Asst')?'#6d28d9':'#6b7280'}}>{f.designation}</span></td>
                        <td style={{...tD,color:'#374151'}}>{f.subject}</td>
                        <td style={tD}><span style={{fontWeight:800,color:attNum<80?C.red:attNum<85?C.orange:C.green}}>{f.att}</span></td>
                        <td style={tD}><span style={{fontWeight:800,color:passNum<80?C.red:passNum<88?C.orange:C.green}}>{f.passRate}</span></td>
                        <td style={{...tD,color:'#6b7280'}}>{f.exp}</td>
                        <td style={tD}><span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:999,background:attNum>=88&&passNum>=88?'#f0fdf4':attNum>=82?'#fff7ed':'#fef2f2',color:attNum>=88&&passNum>=88?'#16a34a':attNum>=82?'#c2410c':'#b91c1c'}}>{attNum>=88&&passNum>=88?'⭐ Top':attNum>=82?'✅ Good':'⚠️ Watch'}</span></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            ))}
          </CC>
        </>
      )}

      {tab==='finance'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            {(()=>{
              const totals=activeMonths.reduce((acc,m)=>{const d=incomeExpenseByMonth[m]??{income:0,expense:0};return{income:acc.income+d.income,expense:acc.expense+d.expense}},{income:0,expense:0});
              return(
                <>
                  <SCard label="Total Income"   value={fmtCr(totals.income)}              sub={rangeLabel}    tone="blue"  icon="📈" trend="up"/>
                  <SCard label="Total Expenses" value={fmtCr(totals.expense)}             sub={rangeLabel}    tone="orange" icon="📉"/>
                  <SCard label="Net Revenue"    value={fmtCr(totals.income-totals.expense)} sub="Surplus"    tone="green"  icon="💹" trend="up"/>
                  <SCard label="Fee Collected"  value={financeCardsByMonth[lastMonth]?.collected??'—'} sub={lastMonth} tone="purple" icon="💰"/>
                </>
              );
            })()}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:20}}>
            <CC title="💰 Income vs Expenses" subtitle={`Monthly comparison — ${rangeLabel}`}>
              <ResponsiveContainer width="100%" height={H2}>
                <BarChart data={incExpData} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={fmtCr}/><Tooltip {...TT} formatter={fmtCr}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="income"  name="Income"  fill={C.blue}  radius={[4,4,0,0]}/>
                  <Bar dataKey="expense" name="Expense" fill={C.orange} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="💸 Expense Breakdown" subtitle="Category-wise split">
              <ResponsiveContainer width="100%" height={H2}>
                <PieChart><Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={<PieLabelInside labelType="pct"/>} labelLine={false}>
                  {expenseBreakdown.map((_,i)=><Cell key={i} fill={[C.blue,C.orange,C.green,C.purple,C.teal][i]}/>)}
                </Pie><Tooltip {...TT} formatter={v=>`${v}%`}/></PieChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="🏫 Fee Collection by Department" subtitle={`${rangeLabel} avg`}>
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={dc?avgFinanceDept(activeMonths).filter(d=>d.dept===dc):avgFinanceDept(activeMonths)} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="paid" name="Paid" stackId="a" fill={C.green} radius={[0,0,0,0]}/><Bar dataKey="pending" name="Pending" stackId="a" fill={C.orange} radius={[0,0,0,0]}/><Bar dataKey="overdue" name="Overdue" stackId="a" fill={C.red} radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📊 Fee Payment Status" subtitle={`${rangeLabel} avg split`}>
              <ResponsiveContainer width="100%" height={H}>
                <PieChart><Pie data={avgFinancePie(activeMonths)} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value" label={<PieLabelInside labelType="pct"/>} labelLine={false}>
                  {avgFinancePie(activeMonths).map((_,i)=><Cell key={i} fill={PIE_COLS[i]}/>)}
                </Pie><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:12}}/></PieChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <div style={{marginBottom:20}}>
            <CC title="📅 Semester-wise Fee Collection" subtitle="Target vs actual per semester">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={semesterFeeData} layout="vertical" margin={{top:4,right:60,left:10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/><XAxis type="number" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={fmtCr}/><YAxis type="category" dataKey="sem" tick={{fontSize:11,fill:'#6b7280'}} axisLine={false} tickLine={false}/><Tooltip {...TT} formatter={fmtCr}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="target"    name="Target"    fill="#e5e7eb" radius={[0,4,4,0]}/>
                  <Bar dataKey="collected" name="Collected" fill={C.blue}  radius={[0,4,4,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
          </div>
        </>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FINANCE VIEW
// ══════════════════════════════════════════════════════════════════════════════
function FinanceView({activeMonths,rangeLabel,department,semester,analyticsData}){
  const [tab,setTab]=useState('collections');
  const [pendingFilter,setPendingFilter]=useState('all');
  const dc=DEPT_CODE[department];
  const lastMonth=activeMonths[activeMonths.length-1];
  
  // Use real finance data if available, otherwise fall back to mock data
  const useRealData = analyticsData && analyticsData.financeData && Object.keys(analyticsData.financeData).length > 0;
  const financeData = useRealData ? analyticsData.financeData : null;
  
  // Calculate finance cards from real data
  const fiCards = useMemo(() => {
    if (useRealData && financeData) {
      return {
        collected: financeData.totalCollected ? fmtCr(financeData.totalCollected) : '—',
        pending: financeData.totalPending ? fmtCr(financeData.totalPending) : '—',
        scholarships: financeData.scholarshipsAwarded ? financeData.scholarshipsAwarded.toString() : '—',
        late: '—', // Not available in current finance data
      };
    } else {
      // Fallback to mock data
      return {
        collected: financeCardsByMonth[lastMonth]?.collected ?? '—',
        pending: financeCardsByMonth[lastMonth]?.pending ?? '—',
        scholarships: avgCardField(financeCardsByMonth, activeMonths, 'scholarships'),
        late: avgCardField(financeCardsByMonth, activeMonths, 'late'),
      };
    }
  }, [useRealData, financeData, activeMonths, lastMonth]);
  
  // Use real monthly revenue data or fallback
  const monthlyTrendData = useMemo(() => {
    if (useRealData && financeData?.monthlyTrends) {
      return financeData.monthlyTrends.map(item => ({
        month: item.month,
        collected: item.revenue,
        target: item.target
      }));
    } else {
      // Fallback to mock data
      return activeMonths.map(mn => ({
        month: mn, 
        collected: (financeColByMonth[mn] ?? []).reduce((s, d) => s + d.collected, 0), 
        target: (financeColByMonth[mn] ?? []).reduce((s, d) => s + d.target, 0)
      }));
    }
  }, [useRealData, financeData, activeMonths]);
  
  // Use real payment status data or fallback
  const fiPieData = useMemo(() => {
    if (useRealData && financeData?.paymentStatus) {
      const total = Object.values(financeData.paymentStatus).reduce((sum, val) => sum + val, 0);
      return Object.entries(financeData.paymentStatus).map(([name, value]) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0
      }));
    } else {
      return avgFinancePie(activeMonths);
    }
  }, [useRealData, financeData, activeMonths]);
  
  // Use real department revenue data or fallback
  const fiDeptData = useMemo(() => {
    if (useRealData && financeData?.departmentRevenue) {
      return financeData.departmentRevenue.map(dept => ({
        dept: dept.department,
        paid: dept.paid,
        pending: dept.pending,
        overdue: 0 // Not available in current data
      }));
    } else {
      return dc ? avgFinanceDept(activeMonths).filter(d => d.dept === dc) : avgFinanceDept(activeMonths);
    }
  }, [useRealData, financeData, activeMonths, dc]);
  
  // Weekly collection data (still using mock data as not available in backend)
  const fiColData = useMemo(() => activeMonths.flatMap(m => (financeColByMonth[m] ?? []).map(d => ({...d, week: `${m} ${d.week}`}))), [activeMonths]);
  const filteredPending  = pendingFilter==='all'?pendingStudents:pendingFilter==='overdue'?pendingStudents.filter(s=>s.days<0):pendingStudents.filter(s=>s.days>=0);
  const deptFilteredPending = dc?filteredPending.filter(s=>s.dept===dc):filteredPending;

  const semFeeDetails = [
    {sem:'Sem 1',students:720,collected:2800000,pending:200000,rate:'93%'},
    {sem:'Sem 2',students:680,collected:3100000,pending:100000,rate:'97%'},
    {sem:'Sem 3',students:620,collected:2900000,pending:200000,rate:'94%'},
    {sem:'Sem 4',students:560,collected:3400000,pending:100000,rate:'97%'},
  ].filter(s=>semester==='Semester 4 (Current)'?s.sem==='Sem 4':true);

  const TABS=[{id:'collections',icon:'💰',label:'Collections'},{id:'pending',icon:'⏳',label:'Pending & Overdue'},{id:'expenses',icon:'📉',label:'Expenses'},{id:'scholarships',icon:'🎓',label:'Scholarships'}];

  return(
    <>
      <RoleTab tabs={TABS} active={tab} onChange={setTab}/>

      {tab==='collections'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            <SCard label="Total Collected"   value={fiCards.collected}    sub={lastMonth}      tone="blue"   icon="💰" trend="up"/>
            <SCard label="Pending Fees"      value={fiCards.pending}      sub={lastMonth}      tone="orange" icon="⏳" trend="down"/>
            <SCard label="Collection Rate"   value={`${fiPieData.find(x=>x.name==='Paid')?.value??0}%`} sub="Avg paid" tone="green" icon="✅" trend="up"/>
            <SCard label="Late Payments"     value={fiCards.late}         sub="Avg / month"    tone="purple" icon="🔴" trend="down"/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:20}}>
            <CC title="📈 12-Month Collection Trend" subtitle="Monthly total collected vs target">
              <ResponsiveContainer width="100%" height={H2}>
                <AreaChart data={monthlyTrendData} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <defs><linearGradient id="gFin" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.2}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${fmt(v)}`}/><Tooltip {...TT} formatter={v=>`₹${fmt(v)}`}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Area type="monotone" dataKey="target"    name="Target"    stroke="#e5e7eb" fill="none" strokeWidth={1.5} strokeDasharray="4 2"/>
                  <Area type="monotone" dataKey="collected" name="Collected" stroke={C.blue}  fill="url(#gFin)" strokeWidth={2.5} dot={(props)=>{const inR=activeMonths.includes(props.payload?.month);return<circle key={props.cx} cx={props.cx} cy={props.cy} r={inR?6:3} fill={inR?C.orange:C.blue} stroke="#fff" strokeWidth={2}/>;}}/>
                </AreaChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📊 Payment Status" subtitle={`${rangeLabel} avg`}>
              <ResponsiveContainer width="100%" height={H2}>
                <PieChart><Pie data={fiPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={<PieLabelInside labelType="pct"/>} labelLine={false}>
                  {fiPieData.map((_,i)=><Cell key={i} fill={PIE_COLS[i]}/>)}
                </Pie><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:12}}/></PieChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="🏫 Department-wise Collection" subtitle={`${rangeLabel} avg breakdown`}>
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={fiDeptData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="paid" name="Paid" stackId="a" fill={C.green} radius={[0,0,0,0]}/><Bar dataKey="pending" name="Pending" stackId="a" fill={C.orange} radius={[0,0,0,0]}/><Bar dataKey="overdue" name="Overdue" stackId="a" fill={C.red} radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="💳 Payment Method Split" subtitle="Online / bank / cash">
              <ResponsiveContainer width="100%" height={H}>
                <PieChart><Pie data={paymentMethodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={<PieLabelInside labelType="pct"/>} labelLine={false}>
                  {paymentMethodData.map((_,i)=><Cell key={i} fill={[C.blue,C.green,C.orange][i]}/>)}
                </Pie><Tooltip {...TT} formatter={v=>`${v}%`}/></PieChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <CC title="📋 Semester-wise Fee Report" subtitle="Collection per semester" style={{marginBottom:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={tH}>Semester</th><th style={tH}>Students</th><th style={tH}>Collected</th><th style={tH}>Pending</th><th style={tH}>Rate</th><th style={tH}>Progress</th></tr></thead>
              <tbody>{semFeeDetails.map((s,i)=>(
                <tr key={i}>
                  <td style={{...tD,fontWeight:700}}>{s.sem}</td>
                  <td style={tD}>{s.students.toLocaleString()}</td>
                  <td style={{...tD,fontWeight:700,color:C.green}}>{fmtCr(s.collected)}</td>
                  <td style={{...tD,fontWeight:700,color:C.orange}}>{fmtCr(s.pending)}</td>
                  <td style={{...tD,fontWeight:700}}>{s.rate}</td>
                  <td style={{...tD,minWidth:120}}><MiniProgress value={parseInt(s.rate)} color={parseInt(s.rate)>95?C.green:parseInt(s.rate)>90?C.orange:C.red}/></td>
                </tr>
              ))}</tbody>
            </table>
          </CC>

          <CC title="💰 Weekly Fee Collection" subtitle={`${rangeLabel} — collected vs target`} style={{marginBottom:20}}>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={fiColData} margin={{top:4,right:4,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="week" tick={{fontSize:8,fill:'#9ca3af'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${fmt(v)}`}/><Tooltip {...TT} formatter={v=>`₹${fmt(v)}`}/><Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="target"    name="Target"    fill="#e5e7eb" radius={[4,4,0,0]}/>
                <Bar dataKey="collected" name="Collected" fill={C.blue}  radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CC>
        </>
      )}

      {tab==='pending'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:20,flexWrap:'wrap'}}>
            <SCard label="Total Pending"    value={`${pendingStudents.length}`}                      sub="Students"     tone="orange" icon="⏳"/>
            <SCard label="Overdue"          value={`${pendingStudents.filter(s=>s.days<0).length}`}  sub="Past due date" tone="red"   icon="🔴"/>
            <SCard label="Due This Week"    value={`${pendingStudents.filter(s=>s.days>=0&&s.days<=7).length}`} sub="7 days or less" tone="amber" icon="⚠️"/>
            <SCard label="Total Overdue Amt"value="₹2.56L"                                           sub="Combined"     tone="purple" icon="💸"/>
          </div>

          <CC title="⏳ Pending Fee Details" subtitle="Student-wise pending and overdue fees"
            action={
              <div style={{display:'flex',gap:6}}>
                {['all','due','overdue'].map(f=>(
                  <button key={f} onClick={()=>setPendingFilter(f)} style={{padding:'4px 10px',borderRadius:7,border:'1.5px solid',borderColor:pendingFilter===f?'#2563eb':'#e5e7eb',background:pendingFilter===f?'#eff6ff':'#fff',color:pendingFilter===f?'#2563eb':'#6b7280',fontSize:11,fontWeight:700,cursor:'pointer',textTransform:'capitalize'}}>{f}</button>
                ))}
              </div>
            }
            style={{marginBottom:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={tH}>Student</th><th style={tH}>Roll No</th><th style={tH}>Dept</th><th style={tH}>Semester</th><th style={tH}>Amount</th><th style={tH}>Due Date</th><th style={tH}>Status</th></tr></thead>
              <tbody>{deptFilteredPending.map((s,i)=>(
                <tr key={i} style={{background:s.days<0?'#fff5f5':i%2===0?'#fafafa':'#fff'}}>
                  <td style={{...tD,fontWeight:700,fontSize:13}}>{s.name}</td>
                  <td style={{...tD,color:'#6b7280'}}>{s.rollNo}</td>
                  <td style={tD}><span style={{background:'#eff6ff',color:'#2563eb',padding:'2px 8px',borderRadius:999,fontWeight:700,fontSize:11}}>{s.dept}</span></td>
                  <td style={{...tD,color:'#6b7280'}}>{s.sem}</td>
                  <td style={{...tD,fontWeight:800,color:C.red,fontSize:13}}>{s.amount}</td>
                  <td style={{...tD,color:'#6b7280'}}>{s.due}</td>
                  <td style={tD}><span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:999,background:s.days<-7?'#fef2f2':s.days<0?'#fff5f5':s.days<=7?'#fff7ed':'#f0fdf4',color:s.days<-7?'#b91c1c':s.days<0?'#dc2626':s.days<=7?'#c2410c':'#16a34a'}}>{s.days<0?`🔴 ${Math.abs(s.days)}d overdue`:s.days===0?'⚠️ Due today':s.days<=7?`⚠️ ${s.days}d left`:`✅ ${s.days}d left`}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </CC>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="📊 Pending by Department" subtitle="Pending + overdue amounts">
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={fiDeptData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="pending" name="Pending" stackId="a" fill={C.orange} radius={[0,0,0,0]}/><Bar dataKey="overdue" name="Overdue" stackId="a" fill={C.red} radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📈 Overdue Trend" subtitle="Monthly overdue amount trend">
              <ResponsiveContainer width="100%" height={H}>
                <LineChart data={activeMonths.map(mn=>({month:mn,overdue:(financeDeptByMonth[mn]??[]).reduce((s,d)=>s+d.overdue,0)}))} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/>
                  <Line type="monotone" dataKey="overdue" name="Overdue Count" stroke={C.red} strokeWidth={2.5} dot={(p)=>{const inR=activeMonths.includes(p.payload?.month);return<circle key={p.cx} cx={p.cx} cy={p.cy} r={inR?6:3} fill={inR?C.orange:C.red} stroke="#fff" strokeWidth={2}/>;}}/>
                </LineChart>
              </ResponsiveContainer>
            </CC>
          </div>
        </>
      )}

      {tab==='expenses'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            {(()=>{
              const totals=activeMonths.reduce((acc,m)=>{const d=incomeExpenseByMonth[m]??{income:0,expense:0};return{income:acc.income+d.income,expense:acc.expense+d.expense}},{income:0,expense:0});
              return(
                <>
                  <SCard label="Total Expenses"    value={fmtCr(totals.expense)}                    sub={rangeLabel}    tone="orange" icon="📉"/>
                  <SCard label="Salary Cost"        value={fmtCr(totals.expense*0.58)}               sub="58% of total"  tone="blue"   icon="👨‍💼"/>
                  <SCard label="Infrastructure"     value={fmtCr(totals.expense*0.22)}               sub="22% of total"  tone="purple" icon="🏫"/>
                  <SCard label="Net Surplus"        value={fmtCr(totals.income-totals.expense)}      sub="Income - Expense" tone="green" icon="💹" trend="up"/>
                </>
              );
            })()}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="💸 Expense Breakdown" subtitle="Category distribution">
              <ResponsiveContainer width="100%" height={H2}>
                <PieChart><Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={<PieLabelInside labelType="pct"/>} labelLine={false}>
                  {expenseBreakdown.map((_,i)=><Cell key={i} fill={[C.blue,C.orange,C.red,C.purple,C.teal][i]}/>)}
                </Pie><Tooltip {...TT} formatter={v=>`${v}%`}/></PieChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📊 Income vs Expense Trend" subtitle="Monthly surplus / deficit">
              <ResponsiveContainer width="100%" height={H2}>
                <AreaChart data={activeMonths.map(mn=>({month:mn,...(incomeExpenseByMonth[mn]??{income:0,expense:0}),net:(incomeExpenseByMonth[mn]?.income??0)-(incomeExpenseByMonth[mn]?.expense??0)}))} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <defs><linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={fmtCr}/><Tooltip {...TT} formatter={fmtCr}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Area type="monotone" dataKey="net" name="Net Surplus" stroke={C.green} fill="url(#gNet)" strokeWidth={2.5}/>
                </AreaChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <CC title="📋 Monthly Expense Detail" subtitle={`${rangeLabel}`} style={{marginBottom:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={tH}>Month</th><th style={tH}>Income</th><th style={tH}>Expense</th><th style={tH}>Salary</th><th style={tH}>Infra</th><th style={tH}>Maint.</th><th style={tH}>Net</th></tr></thead>
              <tbody>{activeMonths.map(mn=>{
                const d=incomeExpenseByMonth[mn]??{income:0,expense:0};
                const net=d.income-d.expense;
                return<tr key={mn}><td style={{...tD,fontWeight:700}}>{mn}</td><td style={{...tD,color:C.blue,fontWeight:700}}>{fmtCr(d.income)}</td><td style={{...tD,color:C.orange,fontWeight:700}}>{fmtCr(d.expense)}</td><td style={tD}>{fmtCr(d.expense*0.58)}</td><td style={tD}>{fmtCr(d.expense*0.22)}</td><td style={tD}>{fmtCr(d.expense*0.12)}</td><td style={{...tD,fontWeight:800,color:net>0?C.green:C.red}}>{fmtCr(net)}</td></tr>;
              })}</tbody>
            </table>
          </CC>
        </>
      )}

      {tab==='scholarships'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            <SCard label="Total Scholarships" value={fiCards.scholarships}                               sub="Active avg"     tone="blue"   icon="🎓"/>
            <SCard label="Merit-based"         value={`${scholarshipByDept.reduce((s,d)=>s+d.merit,0)}`} sub="All depts"      tone="green"  icon="⭐"/>
            <SCard label="Need-based"          value={`${scholarshipByDept.reduce((s,d)=>s+d.needBased,0)}`} sub="All depts" tone="orange"  icon="🤝"/>
            <SCard label="Sports Quota"        value={`${scholarshipByDept.reduce((s,d)=>s+d.sports,0)}`} sub="All depts"    tone="purple"  icon="🏅"/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="🏫 Scholarships by Department" subtitle="Merit, need-based, sports">
              <ResponsiveContainer width="100%" height={H2}>
                <BarChart data={dc?scholarshipByDept.filter(d=>d.dept===dc):scholarshipByDept} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="dept" tick={{fontSize:11,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="merit"    name="Merit"     fill={C.blue}   radius={[0,0,0,0]}/>
                  <Bar dataKey="needBased" name="Need"     fill={C.green}  radius={[0,0,0,0]}/>
                  <Bar dataKey="sports"   name="Sports"   fill={C.orange} radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="🎓 Scholarship Type Split" subtitle="Total across all depts">
              <ResponsiveContainer width="100%" height={H2}>
                <PieChart><Pie data={[{name:'Merit',value:scholarshipByDept.reduce((s,d)=>s+d.merit,0)},{name:'Need-based',value:scholarshipByDept.reduce((s,d)=>s+d.needBased,0)},{name:'Sports',value:scholarshipByDept.reduce((s,d)=>s+d.sports,0)}]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={<PieLabelInside labelType="count"/>} labelLine={false}>
                  {[0,1,2].map(i=><Cell key={i} fill={[C.blue,C.green,C.orange][i]}/>)}
                </Pie><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:12}}/></PieChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <CC title="📋 Scholarship Detail Table" subtitle="Per department breakdown" style={{marginBottom:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={tH}>Department</th><th style={tH}>Merit</th><th style={tH}>Need-based</th><th style={tH}>Sports</th><th style={tH}>Total</th><th style={tH}>% of Students</th></tr></thead>
              <tbody>{(dc?scholarshipByDept.filter(d=>d.dept===dc):scholarshipByDept).map((d,i)=>{
                const total=d.merit+d.needBased+d.sports;
                const pct=((total/studentsByDept[d.dept])*100).toFixed(1);
                return<tr key={i}><td style={{...tD,fontWeight:700}}>{d.dept}</td><td style={{...tD,fontWeight:700,color:C.blue}}>{d.merit}</td><td style={{...tD,fontWeight:700,color:C.green}}>{d.needBased}</td><td style={{...tD,fontWeight:700,color:C.orange}}>{d.sports}</td><td style={{...tD,fontWeight:800}}>{total}</td><td style={tD}><MiniProgress value={parseFloat(pct)} max={20} color={C.purple}/></td></tr>;
              })}</tbody>
            </table>
          </CC>
        </>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FACULTY VIEW
// ══════════════════════════════════════════════════════════════════════════════
function FacultyView({activeMonths,rangeLabel,department,semester}){
  const [tab,setTab]=useState('attendance');
  const fAttData   = useMemo(()=>activeMonths.flatMap(m=>(facultyAttByMonth[m]??[]).map(d=>({...d,week:`${m} ${d.week}`}))),[activeMonths]);
  const fSubData   = useMemo(()=>activeMonths.flatMap(m=>(facultySubByMonth[m]??[]).map(d=>({...d,week:`${m} ${d.week}`}))),[activeMonths]);
  const fMarksDist = useMemo(()=>avgMarksDist(activeMonths),[activeMonths]);
  const fCards     = useMemo(()=>({students:avgCardField(facultyCardsByMonth,activeMonths,'students'),att:avgCardField(facultyCardsByMonth,activeMonths,'att'),submitted:avgCardField(facultyCardsByMonth,activeMonths,'submitted'),pending:avgCardField(facultyCardsByMonth,activeMonths,'pending')}),[activeMonths]);
  const attTrendData = MONTHS_ALL.map(mn=>({month:mn,CS6001:Math.round((facultyAttByMonth[mn]??[]).reduce((s,d)=>s+d.CS6001,0)/((facultyAttByMonth[mn]??[]).length||1)),CS6002:Math.round((facultyAttByMonth[mn]??[]).reduce((s,d)=>s+d.CS6002,0)/((facultyAttByMonth[mn]??[]).length||1)),Phy:Math.round((facultyAttByMonth[mn]??[]).reduce((s,d)=>s+d.Phy,0)/((facultyAttByMonth[mn]??[]).length||1))}));

  const TABS=[{id:'attendance',icon:'📅',label:'Attendance'},{id:'performance',icon:'📊',label:'Performance'},{id:'assignments',icon:'📋',label:'Assignments'},{id:'exams',icon:'📝',label:'Exams & Grades'}];

  return(
    <>
      <RoleTab tabs={TABS} active={tab} onChange={setTab}/>

      {tab==='attendance'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            <SCard label="Students in Class" value={fCards.students}   sub={rangeLabel}     tone="blue"   icon="👥"/>
            <SCard label="Avg Attendance"    value={fCards.att}        sub={rangeLabel}     tone="green"  icon="📅" trend="up"/>
            <SCard label="Below 75% Alert"   value={`${studentRiskData.filter(s=>parseInt(s.att)<75).length}`} sub="Students at risk" tone="red" icon="⚠️"/>
            <SCard label="Above 90%"         value={`${MONTHS_ALL.flatMap(m=>Object.values(facultyAttByMonth[m]??{})).filter(v=>typeof v==='number'&&v>=90).length}`} sub="Class-weeks" tone="purple" icon="⭐"/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="📅 Weekly Attendance by Course" subtitle={`${rangeLabel} — per subject`}>
              <ResponsiveContainer width="100%" height={H}>
                <LineChart data={fAttData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="week" tick={{fontSize:8,fill:'#9ca3af'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis domain={[65,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Line type="monotone" dataKey="CS6001" stroke={C.blue}   strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="CS6002" stroke={C.cyan}   strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="Phy"    stroke={C.orange} strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📈 Annual Attendance Trend" subtitle="12-month overview per course">
              <ResponsiveContainer width="100%" height={H}>
                <LineChart data={attTrendData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[70,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Line type="monotone" dataKey="CS6001" stroke={C.blue}   strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="CS6002" stroke={C.cyan}   strokeWidth={2} dot={false}/>
                  <Line type="monotone" dataKey="Phy"    stroke={C.orange} strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <CC title="⚠️ At-Risk Students" subtitle="Below 75% attendance — action required" style={{marginBottom:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={tH}>Student</th><th style={tH}>Roll No</th><th style={tH}>Attendance</th><th style={tH}>Marks</th><th style={tH}>Subject</th><th style={tH}>Risk</th></tr></thead>
              <tbody>{studentRiskData.map((s,i)=>(
                <tr key={i} style={{background:s.risk==='high'?'#fff5f5':i%2===0?'#fafafa':'#fff'}}>
                  <td style={{...tD,fontWeight:700}}>{s.name}</td>
                  <td style={{...tD,color:'#6b7280'}}>{s.rollNo}</td>
                  <td style={{...tD,fontWeight:800,color:parseInt(s.att)<70?C.red:C.orange}}>{s.att}</td>
                  <td style={{...tD,fontWeight:700,color:s.marks<60?C.red:C.orange}}>{s.marks}</td>
                  <td style={tD}>{s.subject}</td>
                  <td style={tD}><span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:999,background:s.risk==='high'?'#fef2f2':s.risk==='medium'?'#fff7ed':'#f0fdf4',color:s.risk==='high'?'#b91c1c':s.risk==='medium'?'#c2410c':'#16a34a',textTransform:'uppercase'}}>{s.risk}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </CC>
        </>
      )}

      {tab==='performance'&&(()=>{
        const totalStudents=Math.max(1,fMarksDist.reduce((s,d)=>s+d.count,0));
        const failCount=fMarksDist.find(d=>d.range===GRADE_F)?.count??0;
        const oCount=fMarksDist.find(d=>d.range===GRADE_O)?.count??0;
        const avgScore=Math.round(fMarksDist.reduce((s,d,i)=>{const mid=[94,84,74,64,54,44][i];return s+mid*d.count},0)/totalStudents);
        const passRate=100-Math.round((failCount/totalStudents)*100);
        return(
          <>
            <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
              <SCard label="Avg Class Score"  value={`${avgScore}`}   sub={rangeLabel}   tone="blue"   icon="📊"/>
              <SCard label="O Grade Students" value={`${oCount}`}     sub="90 and above" tone="green"  icon="⭐" trend="up"/>
              <SCard label="Failing Students" value={`${failCount}`}  sub="below 50"     tone="red"    icon="📉"/>
              <SCard label="Avg Pass Rate"    value={`${passRate}%`}  sub="Excl. fails"  tone="purple" icon="✅"/>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
              <CC title="📊 Grade Distribution" subtitle={`${rangeLabel} — student count per grade`}>
                <ResponsiveContainer width="100%" height={H}>
                  <BarChart data={fMarksDist} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="range" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/>
                    <Bar dataKey="count" name="Students" radius={[6,6,0,0]}>{fMarksDist.map((_,i)=><Cell key={i} fill={[C.green,C.blue,C.cyan,C.purple,C.orange,C.red][i]}/>)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CC>
              <CC title="📈 Grade Distribution Pie" subtitle="Visual breakdown of grades">
                <ResponsiveContainer width="100%" height={H}>
                  <PieChart><Pie data={fMarksDist} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="range" label={<PieLabelInside labelType="count"/>} labelLine={false}>
                    {fMarksDist.map((_,i)=><Cell key={i} fill={[C.green,C.blue,C.cyan,C.purple,C.orange,C.red][i]}/>)}
                  </Pie><Tooltip {...TT}/></PieChart>
                </ResponsiveContainer>
              </CC>
            </div>

            <CC title="📊 Avg Marks Trend" subtitle="Class average over months" style={{marginBottom:20}}>
              <ResponsiveContainer width="100%" height={H}>
                <LineChart data={activeMonths.map(mn=>{const marks=marksDistByMonth[mn]??[];const total=marks.reduce((s,d)=>s+d.count,0)||1;const avg=Math.round(marks.reduce((s,d,i)=>{const mid=[94,84,74,64,54,44][i];return s+mid*d.count},0)/total);return{month:mn,avg};})} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[60,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/>
                  <Line type="monotone" dataKey="avg" name="Class Avg" stroke={C.blue} strokeWidth={2.5} dot={(p)=>{const inR=activeMonths.includes(p.payload?.month);return<circle key={p.cx} cx={p.cx} cy={p.cy} r={inR?6:3} fill={inR?C.orange:C.blue} stroke="#fff" strokeWidth={2}/>;}}/>
                </LineChart>
              </ResponsiveContainer>
            </CC>
          </>
        );
      })()}

      {tab==='assignments'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            <SCard label="Total Submitted" value={fCards.submitted} sub={rangeLabel}    tone="blue"   icon="📋" trend="up"/>
            <SCard label="Pending"         value={fCards.pending}   sub="Avg / month"  tone="orange"  icon="⏳" trend="down"/>
            <SCard label="On-Time Rate"    value={`${Math.round(activeMonths.reduce((s,m)=>{const d=facultySubByMonth[m]??[];const total=d.reduce((a,w)=>a+w.onTime+w.late+w.missing,0)||1;return s+d.reduce((a,w)=>a+w.onTime,0)/total*100},0)/activeMonths.length)}%`} sub="Avg on-time" tone="green" icon="✅" trend="up"/>
            <SCard label="Missing"         value={`${Math.round(activeMonths.reduce((s,m)=>{const d=facultySubByMonth[m]??[];return s+d.reduce((a,w)=>a+w.missing,0)},0)/activeMonths.length)}`} sub="Avg / month" tone="red" icon="❌"/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="📋 Submission Rate (Weekly)" subtitle={`${rangeLabel} — on-time vs late vs missing`}>
              <ResponsiveContainer width="100%" height={H}>
                <BarChart data={fSubData} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="week" tick={{fontSize:8,fill:'#9ca3af'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="onTime" name="On Time" stackId="a" fill={C.green}  radius={[0,0,0,0]}/>
                  <Bar dataKey="late"   name="Late"    stackId="a" fill={C.orange} radius={[0,0,0,0]}/>
                  <Bar dataKey="missing" name="Missing" stackId="a" fill={C.red}  radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📊 Submission Status Split" subtitle={`${rangeLabel} avg`}>
              <ResponsiveContainer width="100%" height={H}>
                <PieChart><Pie data={[{name:'On Time',value:Math.round(activeMonths.reduce((s,m)=>{const d=facultySubByMonth[m]??[];return s+d.reduce((a,w)=>a+w.onTime,0)},0)/activeMonths.length)},{name:'Late',value:Math.round(activeMonths.reduce((s,m)=>{const d=facultySubByMonth[m]??[];return s+d.reduce((a,w)=>a+w.late,0)},0)/activeMonths.length)},{name:'Missing',value:Math.round(activeMonths.reduce((s,m)=>{const d=facultySubByMonth[m]??[];return s+d.reduce((a,w)=>a+w.missing,0)},0)/activeMonths.length)}]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={<PieLabelInside labelType="pct"/>} labelLine={false}>
                  {[0,1,2].map(i=><Cell key={i} fill={[C.green,C.orange,C.red][i]}/>)}
                </Pie><Tooltip {...TT}/><Legend wrapperStyle={{fontSize:12}}/></PieChart>
              </ResponsiveContainer>
            </CC>
          </div>
        </>
      )}

      {tab==='exams'&&(
        <>
          <div style={{display:'flex',gap:16,marginBottom:24,flexWrap:'wrap'}}>
            <SCard label="Overall Pass Rate"   value={`${Math.round(examResultsBySubject.reduce((s,d)=>s+d.pass,0)/examResultsBySubject.length)}%`} sub="All subjects" tone="green" icon="✅"/>
            <SCard label="Highest Pass Rate"   value={`${Math.max(...examResultsBySubject.map(d=>d.pass))}%`} sub={examResultsBySubject.find(d=>d.pass===Math.max(...examResultsBySubject.map(d=>d.pass)))?.subject} tone="blue" icon="🏆"/>
            <SCard label="Lowest Pass Rate"    value={`${Math.min(...examResultsBySubject.map(d=>d.pass))}%`} sub={examResultsBySubject.find(d=>d.pass===Math.min(...examResultsBySubject.map(d=>d.pass)))?.subject} tone="red" icon="📉"/>
            <SCard label="Avg Class Score"     value={`${Math.round(examResultsBySubject.reduce((s,d)=>s+d.avg,0)/examResultsBySubject.length)}`} sub="All subjects" tone="purple" icon="📊"/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <CC title="📝 Subject-wise Pass Rate" subtitle="Pass vs fail breakdown per subject">
              <ResponsiveContainer width="100%" height={H2}>
                <BarChart data={examResultsBySubject} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="subject" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip {...TT} formatter={v=>`${v}%`}/><Legend wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="pass" name="Pass%" stackId="a" fill={C.green} radius={[0,0,0,0]}/><Bar dataKey="fail" name="Fail%" stackId="a" fill={C.red} radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="📊 Average Marks per Subject" subtitle="Subject performance comparison">
              <ResponsiveContainer width="100%" height={H2}>
                <BarChart data={examResultsBySubject} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="subject" tick={{fontSize:9,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis domain={[50,100]} tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/>
                  <Bar dataKey="avg" name="Avg Marks" radius={[6,6,0,0]}>{examResultsBySubject.map((_,i)=><Cell key={i} fill={[C.blue,C.cyan,C.orange,C.green,C.purple][i]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <CC title="📋 Exam Results Summary" subtitle="Detailed per-subject exam report" style={{marginBottom:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={tH}>Subject</th><th style={tH}>Pass%</th><th style={tH}>Fail%</th><th style={tH}>Avg Marks</th><th style={tH}>Pass Rate Bar</th><th style={tH}>Grade</th></tr></thead>
              <tbody>{examResultsBySubject.map((s,i)=>(
                <tr key={i} style={{background:i%2===0?'#fafafa':'#fff'}}>
                  <td style={{...tD,fontWeight:700}}>{s.subject}</td>
                  <td style={{...tD,fontWeight:800,color:C.green}}>{s.pass}%</td>
                  <td style={{...tD,fontWeight:800,color:C.red}}>{s.fail}%</td>
                  <td style={{...tD,fontWeight:700,color:C.blue}}>{s.avg}</td>
                  <td style={{...tD,minWidth:120}}><MiniProgress value={s.pass} color={s.pass>=88?C.green:s.pass>=80?C.orange:C.red}/></td>
                  <td style={tD}><span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:999,background:s.pass>=90?'#fffbeb':s.pass>=80?'#f0fdf4':'#fef2f2',color:s.pass>=90?'#b45309':s.pass>=80?'#16a34a':'#b91c1c'}}>{s.pass>=90?'Excellent':s.pass>=80?'Good':'Needs Work'}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </CC>

          <CC title="📊 Grade Distribution" subtitle={`${rangeLabel} — full class breakdown`} style={{marginBottom:20}}>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={fMarksDist} margin={{top:4,right:4,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="range" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/><Tooltip {...TT}/>
                <Bar dataKey="count" name="Students" radius={[6,6,0,0]}>{fMarksDist.map((_,i)=><Cell key={i} fill={[C.green,C.blue,C.cyan,C.purple,C.orange,C.red][i]}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CC>
        </>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AnalyticsPage({role:propRole}){
  const [searchParams] = useSearchParams();
  const [calOpen,     setCalOpen]     = useState(false);
  const calRef = useRef(null);

  const storedRole = localStorage.getItem('cmsRole')||'student';
  const role       = getValidRole(propRole||searchParams.get('role')||storedRole);
  const data       = cmsRoles[role];

  const [startMY,    setStartMY]    = useState({month:0,year:2026});
  const [endMY,      setEndMY]      = useState({month:2,year:2026});
  const [semester,   setSemester]   = useState(SEMESTER_OPTS[0]);
  const [department, setDepartment] = useState(DEPT_OPTS[0]);

  // Add state for real analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Debug logging for data flow
  console.log('=== AnalyticsPage Debug ===');
  console.log('Current analyticsData:', analyticsData);

  // Fetch real data from backend
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      console.log('Starting fetchAnalyticsData...');
      try {
        const year = startMY.year;
        const semesterNumber = parseInt(semester.match(/\d+/)?.[0] || 1);
        const deptCode = DEPT_CODE[department];
        
        console.log('Fetching with params:', { year, semesterNumber, deptCode });
        
        const data = await getRealAnalyticsData(year, semesterNumber, deptCode);
        console.log('Received data:', data);
        
        setAnalyticsData(data);
        console.log('Set analyticsData to:', data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        // Keep using mock data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [startMY.year, semester, department]);

  useEffect(()=>{
    function onOut(e){if(calRef.current&&!calRef.current.contains(e.target))setCalOpen(false);}
    if(calOpen)document.addEventListener('mousedown',onOut);
    return()=>document.removeEventListener('mousedown',onOut);
  },[calOpen]);

  // activeMonths: ordered list of month NAME strings for the selected range.
  // Uses keys (year*12+month) so cross-year ranges never collapse duplicate names.
  // Each unique key maps to exactly one month name — no deduplication needed.
  const activeMonths = useMemo(()=>{
    const sk=myToKey(startMY),ek=myToKey(endMY),lo=Math.min(sk,ek),hi=Math.max(sk,ek);
    const res=[];
    for(let k=lo;k<=hi;k++){ const {month}=keyToMY(k); res.push(MONTHS_ALL[month]); }
    return res;
  },[startMY,endMY]);

  const rangeLabel   = myToKey(startMY)===myToKey(endMY)?myLabel(startMY):`${myLabel(startMY)} \u2013 ${myLabel(endMY)}`;
  const triggerLabel = myToKey(startMY)===myToKey(endMY)?myLabel(startMY):`${myLabel(startMY)} \u2192 ${myLabel(endMY)}`;

  useEffect(()=>{document.title=`MIT Connect \u2013 ${data.label} Analytics`;localStorage.setItem('cmsRole',role);},[data.label,role]);
  function FilterBar(){
    return(
      <div className="content-card" style={{marginBottom:24,padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>

          <div style={{position:'relative'}} ref={calRef}>
            <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:5,display:'flex',alignItems:'center',gap:4}}>
              <Ico.Calendar/> Date Range
            </div>
            <button onClick={()=>setCalOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:8,height:38,padding:'0 14px',borderRadius:9,border:`1.5px solid ${calOpen?'#2563eb':'#e5e7eb'}`,background:calOpen?'#eff6ff':'#fff',color:'#1f2937',fontSize:13,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',boxShadow:calOpen?'0 0 0 3px rgba(37,99,235,.12)':'none',transition:'all 0.15s'}}>
              <Ico.Calendar/>{triggerLabel}<span style={{fontSize:10,color:'#9ca3af',marginLeft:2}}>▾</span>
            </button>
            {calOpen&&<CalendarRangePicker startMY={startMY} endMY={endMY} onChange={({startMY:s,endMY:e})=>{setStartMY(s);setEndMY(e);}} onClose={()=>setCalOpen(false)}/>}
          </div>

          <div>
            <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Semester</div>
            <select value={semester} onChange={e=>setSemester(e.target.value)} style={{height:38,padding:'0 10px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#fff',fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer',outline:'none',appearance:'none',WebkitAppearance:'none',minWidth:170}}>
              {SEMESTER_OPTS.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>

          {role!=='student'&&(
            <div>
              <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>Department</div>
              <select value={department} onChange={e=>setDepartment(e.target.value)} style={{height:38,padding:'0 10px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#fff',fontSize:13,fontWeight:600,color:'#374151',cursor:'pointer',outline:'none',appearance:'none',WebkitAppearance:'none',minWidth:180}}>
                {DEPT_OPTS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          )}

          <div>
            <div style={{fontSize:11,fontWeight:700,color:'transparent',marginBottom:5}}>—</div>
            <button onClick={()=>{setStartMY({month:0,year:2026});setEndMY({month:2,year:2026});setSemester(SEMESTER_OPTS[0]);setDepartment(DEPT_OPTS[0]);}} style={{height:38,padding:'0 14px',borderRadius:9,border:'1.5px solid #e5e7eb',background:'#f9fafb',color:'#6b7280',fontSize:12,fontWeight:600,cursor:'pointer'}}>Reset</button>
          </div>

          <div style={{marginLeft:'auto'}}>
            <div style={{fontSize:11,fontWeight:700,color:'transparent',marginBottom:5}}>—</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={() => {
                console.log('=== Excel Export Started ===');
                try {
                  const headers = ['Metric', 'Value'];
                  const rows = [
                    ['Total Students', '11'],
                    ['Avg Attendance', '85.5%'],
                    ['Avg CGPA', '7.8'],
                    ['Placement Rate', '54.5%'],
                    ['Export Date', new Date().toLocaleDateString()]
                  ];
                  
                  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `CMS_${role}_students_${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  alert('Excel export completed!');
                } catch (error) {
                  console.error('Excel export error:', error);
                  alert('Excel export failed: ' + error.message);
                }
              }} style={{display:'flex',alignItems:'center',gap:7,height:38,padding:'0 18px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#059669,#047857)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 10px rgba(5,150,105,.4)'}}>
                <Ico.Download/> Excel
              </button>
              <button onClick={() => {
                console.log('=== PDF Export Started ===');
                try {
                  // Create HTML content that can be saved as HTML and opened in browser
                  const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>CMS ${role.toUpperCase()} Report</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; background: white; }
                          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; text-align: center; }
                          h2 { color: #374151; margin-top: 20px; }
                          .metric { margin: 10px 0; padding: 10px; background: #f9fafb; border-left: 4px solid #2563eb; border-radius: 4px; }
                          .value { font-weight: bold; color: #1f2937; }
                          .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
                          .header { text-align: center; margin-bottom: 30px; }
                          .date { background: #e5e7eb; padding: 5px 10px; border-radius: 4px; font-size: 12px; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>CMS ${role.toUpperCase()} ANALYTICS REPORT</h1>
                          <div class="date">Generated on: ${new Date().toLocaleDateString()}</div>
                        </div>
                        
                        <h2>📊 Student Analytics Summary</h2>
                        <div class="metric">Total Students: <span class="value">11</span></div>
                        <div class="metric">Average Attendance: <span class="value">85.5%</span></div>
                        <div class="metric">Average CGPA: <span class="value">7.8</span></div>
                        <div class="metric">Placement Rate: <span class="value">54.5%</span></div>
                        
                        <h2>📈 Performance Metrics</h2>
                        <div class="metric">Top Performers: <span class="value">Alice Johnson (9.2 CGPA)</span></div>
                        <div class="metric">At-Risk Students: <span class="value">1 student identified</span></div>
                        <div class="metric">Perfect Attendance: <span class="value">2 students</span></div>
                        
                        <div class="footer">
                          <p>College Management System Analytics Report</p>
                          <p>Generated on ${new Date().toLocaleString()}</p>
                        </div>
                      </body>
                    </html>
                  `;
                  
                  // Create blob with HTML MIME type for proper opening
                  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `CMS_${role}_analytics_${new Date().toISOString().split('T')[0]}.html`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  alert('Report exported successfully! Open the HTML file in your browser to view.');
                } catch (error) {
                  console.error('Export error:', error);
                  alert('Export failed: ' + error.message);
                }
              }} style={{display:'flex',alignItems:'center',gap:7,height:38,padding:'0 18px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#dc2626,#b91c1c)',color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 2px 10px rgba(220,38,38,.4)'}}>
                <Ico.Download/> Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <Layout title="Reports & Analytics">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <p style={{color:'#64748b',fontSize:13,margin:0}}>
          {role==='admin'&&'College-wide statistics - Students, Faculty, Finance'}
          {role==='faculty'&&'Class performance, attendance and exam analytics'}
          {role==='finance'&&'Fee collection, expenses and scholarship analytics'}
          {role==='student'&&'Your personal performance overview'}
        </p>
      </div>

      <FilterBar/>

      {role==='admin'   && <AdminView   activeMonths={activeMonths} rangeLabel={rangeLabel} department={department} semester={semester} analyticsData={analyticsData}/>}
      {role==='finance' && <FinanceView activeMonths={activeMonths} rangeLabel={rangeLabel} department={department} semester={semester} analyticsData={analyticsData}/>}
      {role==='faculty' && <FacultyView activeMonths={activeMonths} rangeLabel={rangeLabel} department={department} semester={semester}/>}
      {role==='student' && <div style={{textAlign:'center',padding:'60px 0',color:'#9ca3af',fontSize:14}}>Student analytics coming soon</div>}
    </Layout>
  );
}