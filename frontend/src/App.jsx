import React, { useState } from 'react';
import RoleSelector from './components/RoleSelector';
import StudentScanner from './components/StudentScanner';
import TeacherDashboard from './components/TeacherDashboard';

export default function App() {
  const [role, setRole] = useState(null);
  if (!role) return <RoleSelector onSelect={setRole} />;
  if (role === 'teacher') return <TeacherDashboard onBack={() => setRole(null)} />;
  if (role === 'student') return <StudentScanner onBack={() => setRole(null)} />;
  return null;
}
