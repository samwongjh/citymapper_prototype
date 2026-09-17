import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, CheckCircle2 } from 'lucide-react';

interface FeedbackFooterProps {
  currentTab?: string;
}

// Real fixed values for Disqus configuration in this application
export const DISQUS_PAGE_URL = 'https://ais-pre-ff7v32pnpgl7wxomddfd4d-236557882124.asia-southeast1.run.app/feedback';
export const DISQUS_PAGE_IDENTIFIER = 'sg-citymapper-feedback';

export const FeedbackFooter: React.FC<FeedbackFooterProps> = ({ currentTab }) => {
  const [isReloading, setIsReloading] = useState(false);
  const [reloadedNotice, setReloadedNotice] = useState(false);

  // Reload / Reset Disqus in a Single-Page Application (SPA)
  const loadOrResetDisqus = () => {
    setIsReloading(true);

    if (typeof window === 'undefined') return;

    try {
      const win = window as any;

      // In a SPA: If Disqus is already initialized on the page, use DISQUS.reset
      if (typeof win.DISQUS !== 'undefined') {
        win.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.url = DISQUS_PAGE_URL;
            this.page.identifier = DISQUS_PAGE_IDENTIFIER;
          },
        });
      } else {
        // Set real fixed values for page.url and page.identifier
        win.disqus_config = function (this: any) {
          this.page.url = DISQUS_PAGE_URL;
          this.page.identifier = DISQUS_PAGE_IDENTIFIER;
        };

        // Check if script is already present in document
        const existingScript = document.querySelector('script[src*="sg-citymapper.disqus.com/embed.js"]');
        if (!existingScript) {
          const d = document;
          const s = d.createElement('script');
          s.src = 'https://sg-citymapper.disqus.com/embed.js';
          s.setAttribute('data-timestamp', String(+new Date()));
          s.async = true;
          (d.head || d.body).appendChild(s);
        }
      }

      setReloadedNotice(true);
      setTimeout(() => setReloadedNotice(false), 3000);
    } catch (err) {
      console.warn('Disqus load/reset warning:', err);
    } finally {
      setTimeout(() => setIsReloading(false), 500);
    }
  };

  // Ensure Disqus reloads properly on mount or whenever the SPA tab changes
  useEffect(() => {
    // Delay slightly to ensure DOM container #disqus_thread is fully mounted
    const timer = setTimeout(() => {
      loadOrResetDisqus();
    }, 150);

    return () => clearTimeout(timer);
  }, [currentTab]);

  return (
    <div id="feedback-footer" className="w-full bg-white border-t border-[#e5e7eb] py-8 px-4 sm:px-6 mt-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#006d3e] shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-[#151c27] tracking-tight">
                  Feedback &amp; Commuter Discussions
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Forum
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Share route tips, report crowd conditions, or leave feedback for Singapore Transit Navigator.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {reloadedNotice && (
              <span className="text-[11px] font-medium text-emerald-700 flex items-center space-x-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thread synchronized</span>
              </span>
            )}

            <button
              id="reload-disqus-btn"
              onClick={loadOrResetDisqus}
              disabled={isReloading}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Reload comments thread in this single-page app"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isReloading ? 'animate-spin' : ''}`} />
              <span>Reload Thread</span>
            </button>
          </div>
        </div>

        {/* Disqus Embed Container */}
        <div className="bg-[#fcfdfd] border border-gray-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
          <div id="disqus_thread" className="min-h-[140px]"></div>
          <noscript>
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript" className="text-[#006d3e] underline font-semibold">
              comments powered by Disqus.
            </a>
          </noscript>
        </div>

        {/* Small metadata notice */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 px-1">
          <span>Identifier: <code className="font-mono text-gray-600 font-semibold">{DISQUS_PAGE_IDENTIFIER}</code></span>
          <span>Target: <span className="font-mono text-gray-600">{DISQUS_PAGE_URL}</span></span>
        </div>
      </div>
    </div>
  );
};
