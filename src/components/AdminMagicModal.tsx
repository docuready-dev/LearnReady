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
import { ShieldCheck, Mail, CheckCircle2, Lock, Copy, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMagicModal() {
  const { isAdminModalOpen, closeAdminModal, sendAdminMagicLink, verifyMagicToken } = useAuth();
  const { setPage } = useExam();

  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedData, setDispatchedData] = useState<{ magicUrl?: string; token?: string } | null>(null);

  if (!isAdminModalOpen) return null;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!emailInput.trim()) {
      setErrorMsg('Please enter administrator email address.');
      return;
    }

    if (emailInput.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setErrorMsg(`Access Denied: Only ${ADMIN_EMAIL} is authorized to access the system administration console.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = sendAdminMagicLink(emailInput.trim());
      setIsSubmitting(false);
      if (res.success && res.magicUrl) {
        setDispatchedData({ magicUrl: res.magicUrl, token: res.token });
        toast.success(`Magic link dispatched to ${ADMIN_EMAIL}`);
      } else {
        setErrorMsg(res.message);
      }
    }, 450);
  }

  function handleDirectAuthenticate() {
    if (dispatchedData?.token) {
      const ok = verifyMagicToken(dispatchedData.token, ADMIN_EMAIL);
      if (ok) {
        closeAdminModal();
        setDispatchedData(null);
        setEmailInput('');
        setPage('admin');
        toast.success('Admin console unlocked successfully.');
      }
    }
  }

  function handleCopyLink() {
    if (dispatchedData?.magicUrl) {
      navigator.clipboard.writeText(dispatchedData.magicUrl);
      toast.success('Magic Link copied to clipboard.');
    }
  }

  function handleClose() {
    closeAdminModal();
    setDispatchedData(null);
    setErrorMsg('');
    setEmailInput('');
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
            Strict cryptographic authentication gate. Only the designated system administrator ({ADMIN_EMAIL}) may request an access link.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!dispatchedData ? (
          <form onSubmit={handleSend} className="space-y-4 pt-2">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="admin-email" className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />Administrator Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="ashleyghose64@gmail.com"
                value={emailInput}
                onChange={e => {
                  setEmailInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="text-sm"
                autoFocus
              />
              {errorMsg && (
                <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Generating Magic Link...'
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Send Magic Link
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
        ) : (
          <div className="space-y-4 pt-2 text-center">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs flex items-start gap-2.5 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900">Magic Link Dispatched</p>
                <p className="text-emerald-700 mt-0.5">
                  A one-time cryptographic authentication link was generated for <strong>{ADMIN_EMAIL}</strong>. Valid for 15 minutes.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleDirectAuthenticate}
              >
                <ExternalLink className="w-4 h-4" />
                Authenticate & Open Admin Console
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 text-xs cursor-pointer"
                onClick={handleCopyLink}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Magic Link URL
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground cursor-pointer"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
