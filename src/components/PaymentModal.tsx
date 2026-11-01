import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
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
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Sparkles,
  X,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function PaymentModal({ open, onOpenChange, onSuccess }: PaymentModalProps) {
  const { user, upgradeToPro } = useAuth();
  const [payMethod, setPayMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  if (!open) return null;

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      StorageService.recordPayment({
        userEmail: user?.email || 'candidate@learnready.in',
        userName: user?.name || user?.email.split('@')[0] || 'Candidate',
        amount: 899,
        currency: 'INR',
        method: payMethod,
        transactionRef: `${payMethod.toUpperCase()}-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        status: 'confirmed',
      });
      upgradeToPro();
      setIsProcessing(false);
      setPaymentComplete(true);
      toast.success('Payment of ₹899 confirmed! All chapterwise question banks unlocked.');
      if (onSuccess) onSuccess();
    }, 1200);
  }

  function handleClose() {
    setPaymentComplete(false);
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto font-delight text-left">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold px-2.5 py-1">
              LearnReady Pro Upgrade
            </Badge>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <AlertDialogTitle className="text-2xl font-bold tracking-tight text-foreground text-left">
            Unlock All Subjects' Chapterwise Question Bank
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground text-left leading-relaxed">
            Get lifetime unlimited access to all subjects' chapterwise question bank with verified answer keys, step-by-step solutions, and permanent candidate archiving.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!paymentComplete ? (
          <div className="space-y-4 pt-2 text-left">
            {/* Price Box */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between text-left">
              <div className="text-left">
                <p className="text-sm font-bold text-primary text-left">One-Time Fee (Post 7-Day Trial)</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 text-left">Lifetime Access · No recurring charges</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-foreground">₹899</span>
                <span className="text-xs font-semibold text-muted-foreground ml-1">INR</span>
              </div>
            </div>

            {/* Inclusions */}
            <div className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground text-left">
              <p className="font-bold text-foreground flex items-center gap-2 text-sm text-left">
                <Sparkles className="w-4 h-4 text-amber-500" />What You Receive Immediately:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm pl-4 list-disc text-left leading-relaxed">
                <li>All subjects' comprehensive chapterwise question bank (Classes 9 to 12).</li>
                <li>Full verified answer key with step-by-step explanatory notes.</li>
                <li>Mathematics, Physics, Chemistry, Biology, Commerce & English.</li>
                <li>Downloadable printable PDF bundles and online question browser.</li>
              </ul>
            </div>

            {/* Payment Method Switcher */}
            <div className="space-y-2 text-left">
              <Label className="text-sm font-semibold text-foreground text-left block">Select Payment Method</Label>
              <div className="grid grid-cols-2 gap-2 text-left">
                <button
                  type="button"
                  onClick={() => setPayMethod('upi')}
                  className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    payMethod === 'upi' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <QrCode className="w-4 h-4" />UPI / QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('card')}
                  className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    payMethod === 'card' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />Card / NetBanking
                </button>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePay} className="space-y-4 text-left">
              {payMethod === 'upi' ? (
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="upiId" className="text-sm font-semibold text-foreground text-left">UPI ID / VPA</Label>
                  <Input
                    id="upiId"
                    placeholder="e.g. mobile@upi or student@okhdfcbank"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="h-11 text-sm text-left"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-left">Supported: Google Pay, PhonePe, Paytm, BHIM</p>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="space-y-1 text-left">
                    <Label htmlFor="cardNumber" className="text-sm font-semibold text-foreground text-left">Card Number</Label>
                    <Input id="cardNumber" placeholder="4532 •••• •••• 8892" defaultValue="4532 8920 1192 8892" className="h-11 text-sm text-left" required />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="text-left">
                      <Label htmlFor="cardExpiry" className="text-sm font-semibold text-foreground text-left">Valid Thru</Label>
                      <Input id="cardExpiry" placeholder="MM/YY" defaultValue="08/29" className="h-11 text-sm text-left" required />
                    </div>
                    <div className="text-left">
                      <Label htmlFor="cardCvv" className="text-sm font-semibold text-foreground text-left">CVV</Label>
                      <Input id="cardCvv" type="password" maxLength={3} placeholder="•••" defaultValue="123" className="h-11 text-sm text-left" required />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-bold cursor-pointer h-12 text-sm sm:text-base"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Confirming ₹899 Payment...'
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pay ₹899 INR & Unlock Question Banks
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1 text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit encrypted secure checkout. Instant digital delivery.</span>
            </div>
          </div>
        ) : (
          /* Payment Success State */
          <div className="space-y-4 pt-2 text-left">
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 text-sm space-y-2 text-left dark:text-emerald-200">
              <div className="flex items-center gap-2 text-left">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-base">Payment Successful (₹899 INR)</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 text-left leading-relaxed">
                Thank you for upgrading! Your account <strong>{user?.email}</strong> is now a verified LearnReady Pro Member. All subjects' chapterwise question banks and answer keys have been unlocked in your profile.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1 text-left">
              <Button
                className="w-full flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-sm font-semibold"
                onClick={handleClose}
              >
                <BookOpen className="w-4 h-4" />
                View & Download Question Banks in Profile
              </Button>
            </div>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
