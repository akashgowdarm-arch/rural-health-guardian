import React, { useState } from 'react';
import { COMPANY_CONFIG } from '../data/company';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    phoneNumber: '',
    emailAddress: '',
    requirement: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Left Column: Official Contact Channels with Placeholders */}
      <div className="lg:col-span-5 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-solar-600">
            CONNECT WITH SOCIO
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Let's Build a Cleaner Future Together
          </h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Reach out directly to our commercial distribution team for hardware pricing, dealership inquiries, and supply chain consultations.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="space-y-4">
          {/* Phone */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-socio-50 text-socio-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Phone</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {COMPANY_CONFIG.contact.phone}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-socio-50 text-socio-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Email Address</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {COMPANY_CONFIG.contact.email}
              </div>
            </div>
          </div>

          {/* Business Address */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-socio-50 text-socio-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Headquarters / Warehouse</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {COMPANY_CONFIG.contact.address}
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">WhatsApp Distribution Desk</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {COMPANY_CONFIG.contact.whatsapp}
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
          <Clock className="w-4 h-4 text-socio-600 flex-shrink-0" />
          <span>Distribution Hub Hours: Mon – Sat, 9:00 AM – 6:30 PM (Wholesale &amp; Dispatch)</span>
        </div>
      </div>

      {/* Right Column: Contact Enquiry Form */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-soft">
        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center animate-in zoom-in-75">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Enquiry Received</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you for contacting SOCIO Solar Systems. A dedicated product specialist will review your request and contact you at <span className="font-semibold text-slate-900">{formData.emailAddress || formData.phoneNumber}</span>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  fullName: '',
                  companyName: '',
                  phoneNumber: '',
                  emailAddress: '',
                  requirement: '',
                  message: '',
                });
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-socio-600 text-white text-sm font-bold shadow-sm hover:bg-socio-700 transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-100 pb-4 mb-2">
              <h3 className="text-xl font-bold text-slate-900">Send an Enquiry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill out your project or distribution inquiry details below.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Your name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Enterprise or Solar EPC"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="Direct contact number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  required
                  placeholder="Official business email"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Requirement */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Requirement *
              </label>
              <input
                type="text"
                name="requirement"
                required
                placeholder="e.g. Bulk Solar Panels, 50kW Inverters, Rooftop Mounting"
                value={formData.requirement}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Message *
              </label>
              <textarea
                name="message"
                rows={4}
                required
                placeholder="Include system sizing, target commissioning date, or quantity details..."
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-socio-600 focus:ring-2 focus:ring-socio-600/20 text-sm outline-none transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-solar-600 hover:bg-solar-700 text-white font-extrabold text-base py-4 px-6 rounded-xl shadow-soft hover:shadow-orange-glow transition-all duration-300 min-h-[48px]"
            >
              {loading ? (
                <span>Sending Enquiry...</span>
              ) : (
                <>
                  <span>SEND ENQUIRY</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>We respect your commercial privacy. No spam or unprompted calls.</span>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};
