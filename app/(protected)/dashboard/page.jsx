"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Plus, Trash2, Edit, UploadCloud, Users, Check, X, FileText, ArrowLeft, BarChart2, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cessaService } from "@/lib/api/services/client/cessaApi.service";
import { getImageUrl } from "@/lib/utils";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPostIdx, setCurrentPostIdx] = useState(0);

  const [postModal, setPostModal] = useState({ open: false, isEditing: false, id: null });
  const [eventModal, setEventModal] = useState({ open: false, isEditing: false, id: null });
  const [manageModal, setManageModal] = useState({ open: false, eventId: null, enrollments: [] });
  const [enrollModal, setEnrollModal] = useState({ open: false, eventId: null, file: null });

  const [postForm, setPostForm] = useState({ title: "", content: "", link1: "", link2: "", link3: "", categoryId: "", file: null });
  const [eventForm, setEventForm] = useState({ title: "", description: "", eventDate: new Date(), adminCardNumber: "", file: null });

  const [loading, setLoading] = useState(false);

  const activeRole = role ? (role === "Admin" ? "admin" : role === "ContentCreator" ? "creator" : "student") : "student";
  const canManage = role === "Admin" || role === "ContentCreator";

  const loadDashboardData = async () => {
    try {
      const [evRes, postRes, catRes] = await Promise.all([
        cessaService.events.getAll(activeRole),
        cessaService.posts.getRecent(activeRole),
        cessaService.public.getCategories()
      ]);
      setEvents(evRes?.data || []);
      setPosts(postRes?.data || []);
      setCategories(catRes?.data || []);
    } catch (err) {}
  };

  useEffect(() => { loadDashboardData(); }, [role]);

  const openPostModal = (post = null) => {
    if (post) {
      setPostForm({ title: post.title, content: post.content, link1: post.link1 || "", link2: post.link2 || "", link3: post.link3 || "", categoryId: post.categoryId || "", file: null });
      setPostModal({ open: true, isEditing: true, id: post.id });
    } else {
      setPostForm({ title: "", content: "", link1: "", link2: "", link3: "", categoryId: "", file: null });
      setPostModal({ open: true, isEditing: false, id: null });
    }
  };

  const handleSavePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let coverFileId = null;
      if (postForm.file) {
        const fileRes = await cessaService.files.upload(postForm.file);
        coverFileId = fileRes.data;
      }
      const payload = { 
        id: postModal.isEditing ? postModal.id : undefined, 
        title: postForm.title, content: postForm.content, 
        link1: postForm.link1 || null, link2: postForm.link2 || null, link3: postForm.link3 || null, 
        coverFileId: coverFileId || null, 
        authorId: user?.id || null,
        categoryId: postForm.categoryId ? postForm.categoryId : null
      };
      if (postModal.isEditing) await cessaService.posts.update(activeRole, postModal.id, payload);
      else await cessaService.posts.create(activeRole, payload);
      setPostModal({ open: false, isEditing: false, id: null });
      loadDashboardData();
    } catch (err) { alert("خطا در ذخیره پست"); } finally { setLoading(false); }
  };

  const openEventModal = (ev = null) => {
    if (ev) {
      setEventForm({ title: ev.title, description: ev.description, eventDate: new Date(ev.eventDate), adminCardNumber: ev.adminCardNumber || "", file: null });
      setEventModal({ open: true, isEditing: true, id: ev.id });
    } else {
      setEventForm({ title: "", description: "", eventDate: new Date(), adminCardNumber: "", file: null });
      setEventModal({ open: true, isEditing: false, id: null });
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let coverFileId = null;
      if (eventForm.file) {
        const fileRes = await cessaService.files.upload(eventForm.file);
        coverFileId = fileRes.data;
      }
      let finalDate = eventForm.eventDate;
      if (eventForm.eventDate?.toDate) finalDate = eventForm.eventDate.toDate();

      const payload = { ...eventForm, eventDate: finalDate, coverFileId, creatorId: user?.id };
      if (eventModal.isEditing) await cessaService.events.update(activeRole, eventModal.id, payload);
      else await cessaService.events.create(activeRole, payload);
      
      setEventModal({ open: false, isEditing: false, id: null });
      loadDashboardData();
    } catch (err) { alert("خطا در ذخیره رویداد"); } finally { setLoading(false); }
  };

  const handleDeleteEntity = async (type, id) => {
    if (!confirm(`آیا از حذف این ${type === 'post' ? 'پست' : 'رویداد'} اطمینان دارید؟`)) return;
    try {
      if (type === 'post') await cessaService.posts.delete(activeRole, id);
      else await cessaService.events.delete(activeRole, id);
      loadDashboardData();
    } catch (err) { alert("خطا در عملیات حذف"); }
  };

  const handleEnrollClick = (eventId) => setEnrollModal({ open: true, eventId, file: null });
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let invoiceFileId = null;
      if (enrollModal.file) {
        const fileRes = await cessaService.files.upload(enrollModal.file);
        invoiceFileId = fileRes.data;
      }
      await cessaService.events.enroll(activeRole, { eventId: enrollModal.eventId, userId: user?.id, invoiceFileId });
      alert("ثبت‌نام و ارسال رسید با موفقیت انجام شد.");
      setEnrollModal({ open: false, eventId: null, file: null });
      loadDashboardData();
    } catch (err) { alert(err.response?.data?.message || "خطا در ثبت‌نام"); } finally { setLoading(false); }
  };

  const openManageModal = async (eventId) => {
    try {
      const res = await cessaService.events.getEnrollments(activeRole, eventId);
      setManageModal({ open: true, eventId, enrollments: res.data });
    } catch(err) { alert("خطا در دریافت لیست ثبت‌نام‌ها"); }
  };

  const updateEnrollment = async (enrollmentId, status) => {
    try {
      await cessaService.events.updateEnrollmentStatus(activeRole, manageModal.eventId, enrollmentId, status);
      const res = await cessaService.events.getEnrollments(activeRole, manageModal.eventId);
      setManageModal(prev => ({ ...prev, enrollments: res.data }));
    } catch(err) { alert("خطا در تغییر وضعیت"); }
  };

  const getStatusBadge = (status) => {
    if (status === 1) return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px]">تایید شده</span>;
    if (status === 2) return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-[10px]">رد شده</span>;
    return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md text-[10px]">در انتظار بررسی</span>;
  };

  const displayEvents = role === "Admin" ? events : [
    ...events.filter(e => e.isEnrolledByCurrentUser),
    ...events.filter(e => !e.isEnrolledByCurrentUser).slice(0, 5)
  ];

  const isPostOwner = role === "Admin" || (role === "ContentCreator" && posts[currentPostIdx]?.authorId === user?.id);

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-dark-900 border border-cyber-teal/30 p-6 rounded-[32px] flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_0_40px_rgba(45,212,191,0.1)]">
        <div><h2 className="text-2xl font-bold text-white font-sans">پنل کاربری و داشبورد مدیریتی</h2></div>
        {canManage && (
          <div className="flex flex-wrap gap-4">
            <button onClick={() => openEventModal()} className="flex items-center gap-2 bg-cyber-mint/20 text-cyber-mint px-5 py-3 rounded-2xl text-sm font-bold hover:bg-cyber-mint hover:text-dark-950 transition-all cursor-pointer border border-cyber-mint/40 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
              <Plus size={18} /><span>رویداد جدید</span>
            </button>
            <button onClick={() => openPostModal()} className="flex items-center gap-2 bg-cyber-teal text-dark-950 px-5 py-3 rounded-2xl text-sm font-bold hover:bg-teal-300 transition-all cursor-pointer shadow-[0_0_20px_rgba(45,212,191,0.4)]">
              <Plus size={18} /><span>پست جدید</span>
            </button>
          </div>
        )}
      </div>

      {/* POST MODAL */}
      {postModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={handleSavePost} className="glass-panel w-full max-w-lg rounded-3xl p-6 border-cyber-teal/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-white">{postModal.isEditing ? "ویرایش پست" : "ایجاد اطلاعیه جدید"}</h3>
            <input type="text" placeholder="عنوان پست" required value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-teal" />
            <textarea placeholder="متن محتوا (پشتیبانی از Markdown و HTML)..." required rows={6} value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-teal font-mono dir-ltr text-left" />
            <div className="grid grid-cols-1 gap-2">
               <select value={postForm.categoryId} onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-teal">
                 <option value="">-- انتخاب دسته‌بندی (اختیاری) --</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
               <input type="url" placeholder="لینک پیوست 1 (اختیاری)" value={postForm.link1} onChange={(e) => setPostForm({ ...postForm, link1: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-cyber-teal" />
               <input type="url" placeholder="لینک پیوست 2 (اختیاری)" value={postForm.link2} onChange={(e) => setPostForm({ ...postForm, link2: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-cyber-teal" />
               <input type="url" placeholder="لینک پیوست 3 (اختیاری)" value={postForm.link3} onChange={(e) => setPostForm({ ...postForm, link3: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-xs font-mono text-left outline-none focus:border-cyber-teal" />
            </div>
            <div className="w-full bg-dark-900 rounded-xl p-3 border border-white/10 border-dashed hover:border-cyber-teal transition-colors">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer w-full h-full justify-center">
                <UploadCloud size={16} />
                <span>{postForm.file ? postForm.file.name : "آپلود کاور (در صورت نیاز)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setPostForm({...postForm, file: e.target.files[0]})} />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setPostModal({open: false, isEditing: false, id: null})} className="px-4 py-2 text-xs rounded-xl bg-dark-800 text-gray-300 cursor-pointer">انصراف</button>
              <button type="submit" disabled={loading} className="px-5 py-2 text-xs rounded-xl bg-cyber-teal font-bold text-dark-950 cursor-pointer disabled:opacity-50">{loading ? "در حال پردازش..." : "ذخیره"}</button>
            </div>
          </form>
        </div>
      )}

      {/* EVENT MODAL */}
      {eventModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={handleSaveEvent} className="glass-panel w-full max-w-lg rounded-3xl p-6 border-cyber-mint/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-white">{eventModal.isEditing ? "ویرایش رویداد" : "ایجاد رویداد جدید"}</h3>
            <input type="text" placeholder="عنوان رویداد" required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-mint" />
            <textarea placeholder="توضیحات رویداد..." required rows={4} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-mint" />
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">تاریخ رویداد (آرشیو یا آینده)</label>
              <DatePicker
                value={eventForm.eventDate}
                onChange={(date) => setEventForm({ ...eventForm, eventDate: date })}
                calendar={persian}
                locale={persian_fa}
                plugins={[<TimePicker position="bottom" />]}
                className="bg-dark"
                inputClass="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-mint font-sans"
              />
            </div>

            <input type="text" placeholder="شماره کارت برای هزینه (اختیاری)" value={eventForm.adminCardNumber} onChange={(e) => setEventForm({ ...eventForm, adminCardNumber: e.target.value })} className="w-full bg-dark-900 text-white rounded-xl p-3 border border-white/10 text-sm outline-none focus:border-cyber-mint" />
            
            <div className="w-full bg-dark-900 rounded-xl p-3 border border-white/10 border-dashed hover:border-cyber-mint transition-colors">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer w-full h-full justify-center">
                <UploadCloud size={16} />
                <span>{eventForm.file ? eventForm.file.name : "آپلود کاور (در صورت نیاز)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setEventForm({...eventForm, file: e.target.files[0]})} />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEventModal({open: false, isEditing: false, id: null})} className="px-4 py-2 text-xs rounded-xl bg-dark-800 text-gray-300 cursor-pointer">انصراف</button>
              <button type="submit" disabled={loading} className="px-5 py-2 text-xs rounded-xl bg-cyber-mint font-bold text-dark-950 cursor-pointer disabled:opacity-50">{loading ? "در حال پردازش..." : "ذخیره"}</button>
            </div>
          </form>
        </div>
      )}

      {/* MANAGE ENROLLMENTS MODAL */}
      {manageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-3xl rounded-3xl p-6 border-amber-400/40 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white text-lg">مدیریت ثبت‌نام‌ها</h3>
              <button onClick={() => setManageModal({open: false, eventId: null, enrollments: []})} className="p-2 bg-dark-800 rounded-xl text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            
            {manageModal.enrollments.length > 0 ? (
              <table className="w-full text-right text-xs">
                <thead className="bg-dark-900 text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="p-3">نام کاربر</th>
                    <th className="p-3">تاریخ ثبت‌نام</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3">رسید</th>
                    <th className="p-3">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {manageModal.enrollments.map(en => (
                    <tr key={en.id} className="hover:bg-white/5">
                      <td className="p-3 text-white font-bold">{en.userName}</td>
                      <td className="p-3 text-gray-400">{new Date(en.createdAt).toLocaleDateString("fa-IR")}</td>
                      <td className="p-3">{getStatusBadge(en.status)}</td>
                      <td className="p-3">
                        {en.invoiceUrl ? <a href={getImageUrl(en.invoiceUrl)} target="_blank" className="text-cyber-teal underline">مشاهده</a> : "بدون رسید"}
                      </td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => updateEnrollment(en.id, 1)} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500 hover:text-white">تایید</button>
                        <button onClick={() => updateEnrollment(en.id, 2)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white">رد</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="text-center text-gray-500 py-6">کسی ثبت نام نکرده است.</p>}
          </div>
        </div>
      )}

      {/* ENROLL MODAL */}
      {enrollModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={handleEnrollSubmit} className="glass-panel w-full max-w-md rounded-3xl p-6 border-cyber-mint/40 space-y-4">
            <h3 className="font-bold text-white">ثبت‌نام در رویداد</h3>
            <p className="text-sm text-gray-400">در صورت نیاز به پرداخت، تصویر رسید را آپلود کنید.</p>
            
            <div className="w-full bg-dark-900 rounded-xl p-3 border border-white/10 border-dashed hover:border-cyber-mint transition-colors">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer w-full h-full justify-center">
                <UploadCloud size={16} />
                <span>{enrollModal.file ? enrollModal.file.name : "آپلود فیش واریزی (اختیاری)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setEnrollModal({...enrollModal, file: e.target.files[0]})} />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEnrollModal({open: false, eventId: null, file: null})} className="px-4 py-2 text-xs rounded-xl bg-dark-800 text-gray-300 cursor-pointer">انصراف</button>
              <button type="submit" disabled={loading} className="px-5 py-2 text-xs rounded-xl bg-cyber-mint font-bold text-dark-950 cursor-pointer disabled:opacity-50">{loading ? "در حال ارسال..." : "ثبت‌نام نهایی"}</button>
            </div>
          </form>
        </div>
      )}

      {/* DASHBOARD GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* POSTS LIST */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2"><BarChart2 className="text-cyber-teal"/> آخرین مطالب و اخبار</h3>
              {posts.length > 1 && (
                <div className="flex space-x-2 space-x-reverse">
                  <button onClick={() => setCurrentPostIdx((prev) => (prev > 0 ? prev - 1 : posts.length - 1))} className="p-2 rounded-xl bg-dark-900 border border-white/5 hover:border-cyber-teal hover:text-cyber-teal cursor-pointer transition-all"><ChevronRight size={18} /></button>
                  <button onClick={() => setCurrentPostIdx((prev) => (prev < posts.length - 1 ? prev + 1 : 0))} className="p-2 rounded-xl bg-dark-900 border border-white/5 hover:border-cyber-teal hover:text-cyber-teal cursor-pointer transition-all"><ChevronLeft size={18} /></button>
                </div>
              )}
            </div>

            {posts.length > 0 ? (
              <div className="bg-dark-900 rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row gap-6 relative flex-1">
                 {isPostOwner && (
                   <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                     <button onClick={() => handleDeleteEntity('post', posts[currentPostIdx]?.id)} className="p-2 rounded-xl bg-dark-950/80 backdrop-blur-sm text-red-400 border border-red-500/20 hover:text-white hover:bg-red-500 transition-colors cursor-pointer" title="حذف"><Trash2 size={16} /></button>
                     <button onClick={() => openPostModal(posts[currentPostIdx])} className="p-2 rounded-xl bg-dark-950/80 backdrop-blur-sm text-cyber-teal border border-cyber-teal/30 hover:text-dark-950 hover:bg-cyber-teal transition-colors cursor-pointer" title="ویرایش"><Edit size={16} /></button>
                   </div>
                 )}
                <div className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden border border-cyber-teal/20 shrink-0">
                  <img src={getImageUrl(posts[currentPostIdx]?.coverFilePath)} alt="Post" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-dark-950/80 px-2 py-1 rounded-md text-[10px] text-cyber-teal font-mono flex items-center gap-1 border border-cyber-teal/30">
                    POST {posts[currentPostIdx]?.categoryName && <span className="text-white">| {posts[currentPostIdx]?.categoryName}</span>}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xl mb-3">{posts[currentPostIdx]?.title}</h4>
                  </div>
                  <Link href={`/post/${posts[currentPostIdx]?.id}`} className="mt-6 w-max px-6 py-2.5 bg-dark-800 border border-white/10 rounded-xl inline-flex items-center gap-2 text-cyber-teal text-sm font-bold hover:bg-cyber-teal hover:text-dark-950 transition-colors">
                    مشاهده پست <ArrowLeft size={16}/>
                  </Link>
                </div>
              </div>
            ) : (<div className="text-xs text-gray-500 font-mono py-10 text-center bg-dark-900 rounded-2xl border border-white/5">NO_POSTS_FOUND</div>)}
          </div>
        </div>

        {/* EVENTS LIST */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border-white/5 space-y-6 shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-mint animate-ping" />
            <span>رویدادهای سیستم</span>
          </h3>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {displayEvents.map((ev) => {
              const isEventOwner = role === "Admin" || (role === "ContentCreator" && ev.creatorId === user?.id);
              const isPastEvent = new Date(ev.eventDate) < new Date();

              return (
                <div key={ev.id} className="rounded-2xl p-5 bg-dark-900 border border-cyber-mint/20 hover:border-cyber-mint/50 transition-colors shadow-[0_0_15px_rgba(74,222,128,0.05)] flex flex-col text-center relative group">
                  
                  {isEventOwner && (
                     <div className="absolute top-2 left-2 flex gap-1 z-10">
                       <button onClick={() => handleDeleteEntity('event', ev.id)} className="p-2 rounded-lg bg-dark-950/80 text-red-400 border border-white/5 hover:text-white hover:bg-red-500 transition-colors cursor-pointer" title="حذف"><Trash2 size={14} /></button>
                       <button onClick={() => openEventModal(ev)} className="p-2 rounded-lg bg-dark-950/80 text-cyber-mint border border-white/5 hover:text-dark-950 hover:bg-cyber-mint transition-colors cursor-pointer" title="ویرایش"><Edit size={14} /></button>
                     </div>
                  )}

                  <h4 className="font-bold text-white text-lg mt-4 mb-2">{ev.title}</h4>
                  <div className="font-sans text-sm font-bold text-cyber-mint mb-6 bg-cyber-mint/10 py-2 rounded-xl border border-cyber-mint/20">{new Date(ev.eventDate).toLocaleDateString("fa-IR")}</div>
                  
                  <div className="flex flex-col gap-3 w-full mt-auto">
                    {isEventOwner ? (
                      <button onClick={() => openManageModal(ev.id)} className="w-full py-3 bg-amber-400 text-dark-950 hover:bg-amber-300 text-sm font-black rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 cursor-pointer">
                        <Users size={18}/> <span>مدیریت ثبت‌نام‌ها</span>
                      </button>
                    ) : (
                      !ev.isEnrolledByCurrentUser ? (
                        isPastEvent ? (
                          <div className="w-full py-2.5 bg-dark-800 text-gray-500 text-sm font-bold rounded-xl border border-white/5 text-center block cursor-not-allowed">
                            مهلت ثبت‌نام پایان یافته
                          </div>
                        ) : (
                          <button onClick={() => handleEnrollClick(ev.id)} className="w-full py-2.5 bg-cyber-mint hover:bg-green-400 text-dark-950 text-sm font-bold rounded-xl transition-all border border-cyber-mint/30 shadow-[0_0_15px_rgba(74,222,128,0.2)] text-center block cursor-pointer">
                            ثبت‌نام در رویداد
                          </button>
                        )
                      ) : (
                        <div className="w-full py-2.5 bg-dark-800 text-emerald-400 text-sm font-bold rounded-xl border border-emerald-500/20 text-center block">
                          ثبت‌نام شده
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
