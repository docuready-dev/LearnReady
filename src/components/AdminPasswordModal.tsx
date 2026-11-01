import React, { useState } from 'react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPasswordModal() {
  const { isAdminModalOpen, closeAdminModal, loginAdminWithPassword } = useAuth();
  const { setPage } = useExam();

  const [emailInput, setEmailInput] = useState(ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminModalOpen) return null;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Please enter administrator email address.');
      return;
    }
    if (!passwordInput) {
      setErrorMsg('Administrator password is required.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginAdminWithPassword(emailInput.trim(), passwordInput);
      setIsSubmitting(false);

      if (res.success) {
        closeAdminModal();
        setPasswordInput('');
        setErrorMsg('');
        setPage('admin');
        toast.success('Admin authorization verified. Welcome, Ashley!');
      } else {
        setErrorMsg(res.message);
      }
    }, 350);
  }

  function handleClose() {
    closeAdminModal();
    setPasswordInput('');
    setErrorMsg('');
  }

  return (
    <AlertDialog open={isAdminModalOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center sm:text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white mx-auto flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <AlertDialogTitle className="text-xl font-bold tracking-tight">System Gateway</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            Administrative master console for <strong className="text-foreground">{ADMIN_EMAIL}</strong>. Authenticate with master administrator password.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="admin-email" className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />Administrator Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              value={emailInput}
              onChange={e => {
                setEmailInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="text-sm font-mono"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <Label htmlFor="admin-password" className="text-xs font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />Master Admin Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={e => {
                  setPasswordInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="text-sm pr-10"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md mt-1">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Verifying Credentials...'
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Authenticate & Enter Admin Console
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleClose}
            >
              <X className="w-3.5 h-3.5 mr-1" />Cancel
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
