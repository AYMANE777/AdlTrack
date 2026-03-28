"use client";

import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, UserPlus, Trash2, ShieldCheck, User as UserIcon, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LocalUser {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'user';
}

interface UsersTableProps {
  initialUsers: LocalUser[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<LocalUser[]>(initialUsers);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LocalUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleAddUser = async () => {
    if (!newUserName || !newUserUsername || !newUserPassword) {
      toast.error("يرجى ملء كافة الحقول");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          username: newUserUsername,
          password: newUserPassword,
          role: newUserRole
        })
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers(prev => [newUser, ...prev]);
        toast.success("تم إضافة المستخدم بنجاح");
        setIsDialogOpen(false);
        setNewUserName('');
        setNewUserUsername('');
        setNewUserPassword('');
        setNewUserRole('user');
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في إضافة المستخدم");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("حدث خطأ أثناء إضافة المستخدم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser?.id?.toString()) {
      toast.error("لا يمكنك حذف حسابك الحالي");
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف المستخدم ${name}؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success(`تم حذف المستخدم ${name}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في حذف المستخدم");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    }
  };

  const handleOpenPasswordDialog = (user: LocalUser) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    try {
      setIsChangingPassword(true);
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        toast.success(`تم تغيير كلمة المرور للمستخدم ${selectedUser.name}`);
        setIsPasswordDialogOpen(false);
        setSelectedUser(null);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const error = await response.json();
        toast.error(error.error || "فشل في تغيير كلمة المرور");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">إدارة صلاحيات الوصول والحسابات في النظام.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 h-11 px-6">
              <UserPlus className="h-5 w-5" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
              <DialogDescription className="text-right">
                أدخل بيانات المستخدم الجديد وصلاحياته.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-right">الاسم الكامل</Label>
                <Input 
                  id="name" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="text-right" 
                  placeholder="مثال: أحمد محمد"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username" className="text-right">اسم المستخدم (البريد الإلكتروني)</Label>
                <Input 
                  id="username" 
                  value={newUserUsername} 
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="text-right" 
                  placeholder="admin@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" aria-description="password field" className="text-right">كلمة المرور</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={newUserPassword} 
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="text-right" 
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-right">الصلاحية</Label>
                <Select value={newUserRole} onValueChange={(v: any) => setNewUserRole(v)}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="text-right">مدير (Admin)</SelectItem>
                    <SelectItem value="user" className="text-right">موظف (User)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddUser} 
                className="w-full h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                حفظ المستخدم
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">تغيير كلمة المرور</DialogTitle>
              <DialogDescription className="text-right">
                تغيير كلمة المرور للمستخدم: {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className="text-right">كلمة المرور الجديدة</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="text-right" 
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-right">تأكيد كلمة المرور</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-right" 
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleChangePassword} 
                className="w-full h-11"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                تغيير كلمة المرور
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="shadow-xl border-primary/10 overflow-hidden">
        <CardHeader className="border-b" style={{ backgroundColor: "rgba(60, 80, 224, 0.05)" }}>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-6 w-6" style={{ color: "#3C50E0" }} />
              <CardTitle className="text-xl font-bold">قائمة الحسابات النشطة</CardTitle>
            </div>
          </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-right py-4">المستخدم</TableHead>
                <TableHead className="text-right py-4">اسم المستخدم</TableHead>
                <TableHead className="text-right py-4">الصلاحية</TableHead>
                <TableHead className="text-center py-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    لا يوجد مستخدمين مسجلين حالياً.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-4 font-bold flex items-center gap-3 text-right">
                        <div 
                          className="h-9 w-9 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "rgba(60, 80, 224, 0.1)", color: "#3C50E0" }}
                        >
                          <UserIcon className="h-5 w-5" />
                        </div>
                      {u.name}
                    </TableCell>
                    <TableCell className="py-4 text-right">{u.username}</TableCell>
                    <TableCell className="py-4 text-right">
                      {u.role === 'admin' ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          مدير
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="px-3 py-1">موظف</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-primary hover:bg-primary/5"
                            onClick={() => handleOpenPasswordDialog(u)}
                            title="تغيير كلمة المرور"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/5"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="حذف المستخدم"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
