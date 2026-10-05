import requests from "../../http/client";

const getArea = (role) => {
  if (!role) return "student";
  const r = role.toLowerCase();
  if (r === "contentcreator" || r === "creator") return "creator";
  if (r === "admin") return "admin";
  return "student";
};

export const cessaService = {
  public: {
    getPosts: () => requests.get(`/public/feed/posts`),
    getEvents: () => requests.get(`/public/feed/events`),
    getPostById: (id) => requests.get(`/public/feed/posts/${id}`),
    getEventById: (id) => requests.get(`/public/feed/events/${id}`),
    getHallOfFame: (params) => requests.get(`/public/feed/halloffame`, { params }),
    getAdvertisements: () => requests.get(`/public/feed/advertisements`),
    getCategories: () => requests.get(`/public/categories`),
    verifySecretDoor: (secret) => requests.post(`/public/feed/verify-secret`, `"${secret}"`, { headers: { "Content-Type": "application/json" } }),
  },
  auth: {
    login: (role, { email, password }) => requests.post(`/${getArea(role)}/auth/login`, { email, password }),
    register: (role, { firstName, lastName, email, password }) => requests.post(`/${getArea(role)}/auth/register`, { firstName, lastName, email, password }),
    refresh: (role, tokens) => requests.post(`/${getArea(role)}/auth/refresh`, tokens),
    logout: (role) => requests.post(`/${getArea(role)}/auth/logout`, {}),
    verifyEmail: (role, userId, token) => requests.post(`/${getArea(role)}/auth/verify-email?userId=${userId}&token=${encodeURIComponent(token)}`),
    forgotPassword: (role, email) => requests.post(`/${getArea(role)}/auth/forgot-password`, { email }),
    resetPassword: (role, payload) => requests.post(`/${getArea(role)}/auth/reset-password`, payload),
  },
  files: {
    upload: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return requests.post(`/files/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    delete: (id) => requests.delete(`/files/${id}`) 
  },
  posts: {
    getRecent: (role = "student") => requests.get(`/${getArea(role)}/post`),
    getPostById: (role = "student", id) => requests.get(`/${getArea(role)}/post/${id}`),
    create: (role, payload) => requests.post(`/${getArea(role)}/post`, payload),
    update: (role, id, payload) => requests.put(`/${getArea(role)}/post/${id}`, payload),
    delete: (role, id) => requests.delete(`/${getArea(role)}/post/${id}`),
    toggleLike: (role, id) => requests.post(`/${getArea(role)}/post/${id}/like`, {}),
    addComment: (role, id, payload) => requests.post(`/${getArea(role)}/post/${id}/comment`, payload),
    deleteComment: (role, id, commentId) => requests.delete(`/${getArea(role)}/post/${id}/comment/${commentId}`),
    getComments: (role = "student", id) => requests.get(`/${getArea(role)}/post/${id}/comments`),
  },
  events: {
    getAll: (role = "student") => requests.get(`/${getArea(role)}/events`),
    getById: (role = "student", id) => requests.get(`/${getArea(role)}/events/${id}`), 
    enroll: (role, payload) => requests.post(`/${getArea(role)}/events/enroll`, payload),
    create: (role, payload) => requests.post(`/${getArea(role)}/events`, payload),
    update: (role, id, payload) => requests.put(`/${getArea(role)}/events/${id}`, payload),
    delete: (role, id) => requests.delete(`/${getArea(role)}/events/${id}`),
    getEnrollments: (role, id) => requests.get(`/${getArea(role)}/events/${id}/enrollments`),
    updateEnrollmentStatus: (role, eventId, enrollmentId, status) => 
      requests.patch(`/${getArea(role)}/events/${eventId}/enrollments/${enrollmentId}/status`, { status: parseInt(status) }, { headers: { "Content-Type": "application/json" } }),
  },
  profile: {
    getMe: (role) => requests.get(`/${getArea(role)}/profile/me`),
    update: (role, payload) => requests.put(`/${getArea(role)}/profile`, payload),
  },
  payments: {
    getMyPayments: (role = "student") => requests.get(`/${getArea(role)}/payment`),
  },
  users: {
    explore: (role, params) => {
      const area = getArea(role);
      const ctrl = area === 'admin' ? 'users' : 'user';
      return requests.get(`/${area}/${ctrl}/explore`, { params });
    },
    adminGetAll: (params) => requests.get(`/admin/users`, { params }),
    adminRemove: (id) => requests.delete(`/admin/users/${id}`),
    adminBypassPassword: (id, newPassword) => requests.post(`/admin/users/${id}/bypass-password`, `"${newPassword}"`, { headers: { "Content-Type": "application/json" } }),
    adminVerifyCreator: (id) => requests.post(`/admin/users/${id}/verify-creator`, {}),
    adminWipeOut: () => requests.post(`/admin/users/wipe-out`, {}),
    createCategory: (name) => requests.post(`/admin/categories`, `"${name}"`, { headers: { "Content-Type": "application/json" } }),
    deleteCategory: (id) => requests.delete(`/admin/categories/${id}`)
  },
  logs: {
    getSystemLogs: () => requests.get(`/admin/logs`),
  },
  hallOfFame: {
    getAll: (role = "student", params) => requests.get(`/${getArea(role)}/halloffame`, { params }),
    addMember: (data) => requests.post(`/admin/halloffame`, data),
    updateMember: (id, data) => requests.put(`/admin/halloffame/${id}`, data),
    deleteMember: (id) => requests.delete(`/admin/halloffame/${id}`),
  },
  ads: {
    adminGetAll: () => requests.get(`/admin/advertisements`),
    adminCreate: (data) => requests.post(`/admin/advertisements`, data),
    adminUpdate: (id, data) => requests.put(`/admin/advertisements/${id}`, data),
    adminDelete: (id) => requests.delete(`/admin/advertisements/${id}`),
  }
};
