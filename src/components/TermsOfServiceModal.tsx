import React from 'react';
import { X, FileText } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({ isOpen, onClose }: TermsOfServiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-3xl max-w-2xl w-full max-h-[80vh] border border-slate-700/50 relative animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Terms of Service</h2>
              <p className="text-slate-400 text-sm">NextFace AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] text-slate-300 leading-relaxed">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-slate-400 text-sm">Last Updated: August 2, 2026</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold text-lg mb-3">1. Acceptance of Terms</h3>
                <p className="mb-3">
                  Welcome to NextFace AI! NextFace AI (the "App") is provided by BluePeak Global, LLC, a Wyoming, USA limited liability company ("Company," "we," "us," or "our"). By downloading or using NextFace AI, you agree to these Terms of Service ("Terms"). If you do not agree, please do not use the App. These Terms form a binding agreement between you and the Company regarding your use of NextFace AI. We may update these Terms from time to time by posting the revised Terms in the App or our website and updating the "Last Updated" date. Continued use of NextFace AI after changes means you accept the revised Terms.
                </p>
                <p>
                  <strong>Age Requirement:</strong> You must be at least 16 years old to use NextFace AI. We do not permit use by individuals under 16. If you are 16 or 17, you should use NextFace AI only with the consent and supervision of a parent or guardian. By using the App, you represent that you meet this age requirement. If we discover anyone under 16 is using the App, we will terminate the account and delete any associated data.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">2. Description of Service</h3>
                <p>
                  NextFace AI provides an AI-powered facial analysis service. When you upload a photo of your face, the App uses artificial intelligence (including OpenAI's technology) to generate an attractiveness score and aesthetic feedback. You may receive ratings on various facial features and suggestions for possible improvements. The service is intended for informational and entertainment purposes only – it is not a medical or professional advice tool. The features and content of the App may evolve over time, and we reserve the right to modify or discontinue certain features at our discretion.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">3. Account and Login</h3>
                <p>
                  To use NextFace AI, you must sign in with a Google account via Google Sign-In. We will collect your Google account email address to create and authenticate your user account. You are responsible for maintaining the security of your Google account credentials; any activity on NextFace AI through your Google account is your responsibility. Do not share your login credentials with others. If you suspect unauthorized access to your account, please notify us immediately. We are not liable for any loss or damage arising from unauthorized use of your account (for example, if your Google account is compromised).
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">4. User Content and Conduct</h3>
                <p className="mb-3">
                  <strong>Photo Uploads:</strong> NextFace AI allows you to upload your photo for analysis. You retain all rights to your image. By uploading a photo, you give us permission to process it through our AI systems and store it in your account so you can revisit your results. We will not use or share your photos for any purpose other than providing you with the analysis you requested. We retain your photos until you request deletion — we never automatically delete them (see Privacy Policy for details on data retention and your deletion rights). You also agree that:
                </p>
                <ul className="space-y-2 pl-4 mb-3">
                  <li>• You own or have the legal right to the photos or content you upload. Do not upload images of other people without their consent, or any content that you do not have permission to use.</li>
                  <li>• <strong>No Inappropriate Content:</strong> You will not upload any content that is illegal, pornographic, harassing, hateful, or that violates any law or anyone's rights (including privacy, publicity, or intellectual property rights).</li>
                  <li>• <strong>No Misuse:</strong> You will not use NextFace AI for any fraudulent or nefarious purpose. You agree not to attempt to reverse-engineer the App, interfere with its normal operation (for example, by introducing viruses or malicious code), or try to access other users' data without authorization.</li>
                </ul>
                <p>
                  We reserve the right to remove or refuse any content that violates these rules and to suspend or terminate accounts of violators.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">5. Intellectual Property</h3>
                <p className="mb-3">
                  <strong>Our App and Content:</strong> All software, code, design, text, graphics, logos, and other content in NextFace AI (collectively, the "Content") are owned by or licensed to us and are protected by intellectual property laws. We grant you a personal, non-exclusive, non-transferable, revocable license to use the App and its Content for your own personal, non-commercial use. You may not copy, distribute, modify, or create derivative works from our App or Content without our prior written permission. All NextFace AI trademarks, logos, and service marks are our property. You agree not to remove or obscure any copyright, trademark, or other proprietary notices on the App.
                </p>
                <p>
                  <strong>Your Feedback:</strong> If you choose to provide feedback, ideas, or suggestions to us (e.g. improvements to the App), you agree that we can use and implement those ideas without any obligation to compensate you. Any such submissions are entirely voluntary.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">6. Privacy</h3>
                <p>
                  Your use of NextFace AI is also governed by our Privacy Policy (see below), which explains how we collect, use, and protect your personal data. By using the App, you consent to our data practices as described in the Privacy Policy. We do not sell your personal information or face data to third parties. Please review the Privacy Policy to understand how NextFace AI handles your data, including our retention of analysis photos and your rights to delete your data.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">7. AI Content and Results – Disclaimer</h3>
                <p className="mb-3">
                  NextFace AI provides AI-generated aesthetic evaluations of your photos. Please note the following important disclaimers:
                </p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>No Professional Advice:</strong> Any scores, ratings, or beauty suggestions given by the App are not professional or medical advice. The App's feedback is generated by algorithms for informational purposes. It should not be relied upon as a basis for any medical, cosmetic, or life decisions. Always consult a qualified professional for serious concerns about your health or appearance.</li>
                  <li>• <strong>Subjective and Not Guaranteed:</strong> Attractiveness is highly subjective. The AI's evaluation is based on general criteria and is not a definitive judgment about your looks or worth. The results may be inaccurate or biased. We do not guarantee the accuracy, completeness, or usefulness of any rating or recommendation provided by NextFace AI. You understand and agree that the App's output might not be 100% reliable or free of error.</li>
                  <li>• <strong>Emotional Well-being:</strong> Some users may find aesthetic scores sensitive. You agree that you use NextFace AI at your own discretion and risk. If you experience any distress or negative feelings from the results, consider discontinuing use and/or seeking support. We are not liable for any impact on your self-esteem or any decisions you make following the use of the App.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">8. Disclaimer of Warranties</h3>
                <p>
                  NextFace AI is provided "AS IS" and "AS AVAILABLE", without warranties of any kind. To the fullest extent permitted by law, the Company disclaims all warranties, express or implied, regarding the App and its services. This includes, but is not limited to, any implied warranties of accuracy, fitness for a particular purpose, merchantability, and non-infringement. We do not warrant that the App will meet your expectations, that it will be available on an uninterrupted or error-free basis, or that the results of using the service will be accurate or reliable. You agree that use of the App is at your own risk.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">9. Limitation of Liability</h3>
                <p>
                  To the maximum extent allowed by law, NextFace AI, and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of (or inability to use) NextFace AI. This includes, for example, any loss of data, loss of profits, damage to reputation, or emotional distress you might suffer related to the App.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">10. Termination</h3>
                <p className="mb-3">
                  <strong>By You:</strong> You are free to stop using NextFace AI at any time. If you wish to delete your account and personal data, you can do so by following the instructions in the App or contacting us (see Contact Us below). Account deletion is permanent and will remove your personal data from our active systems, as described in our Privacy Policy.
                </p>
                <p>
                  <strong>By Us:</strong> We reserve the right to suspend or terminate your access to NextFace AI (with or without notice) if you violate these Terms or misuse the service. We may also terminate or suspend the App, or your use of it, if required by law or due to security concerns or discontinuation of the service. Upon termination, you must cease all use of NextFace AI. Sections of these Terms that by their nature should survive termination (such as intellectual property, disclaimers, limitations of liability, etc.) will continue to apply even after your access is terminated.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">11. Changes to the Service</h3>
                <p>
                  NextFace AI is an evolving product. We may add, modify, or remove features or content from the App at any time. We are not liable to you or any third party for any modification, price change, suspension, or discontinuation of the App or any part of it. We will try to give advance notice of major changes (for example, by posting in-app notifications), but this may not always be possible.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">12. Changes to Terms</h3>
                <p>
                  We may update these Terms of Service periodically. If we make material changes, we will notify users by posting the updated Terms in the App (or through other communication) at least 30 days before the changes take effect, when feasible. The "Last Updated" date at the top will always indicate the latest revision. Please review the Terms regularly. By continuing to use NextFace AI after updated Terms are effective, you agree to the changes. If you do not agree to a change, you should stop using the App and, if desired, delete your account.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">13. Governing Law and Disputes</h3>
                <p className="mb-3">
                  These Terms are governed by the laws of the United States and the State of Wyoming, without regard to its conflict of law principles. We are based in Wyoming, and that is our "home" jurisdiction. If you have any dispute or claim arising out of or relating to NextFace AI or these Terms, you agree to first contact us to attempt an informal resolution. If we cannot resolve the issue informally, any legal action shall be brought in the state or federal courts located in Wyoming (unless otherwise required by applicable consumer protection laws). You agree to the personal jurisdiction of those courts.
                </p>
                <p>
                  <strong>For EU Users:</strong> If you are using NextFace AI as a consumer in the European Union, you may have certain mandatory rights under your local consumer protection laws. Nothing in these Terms affects your rights to benefit from any mandatory provisions of the law of the country in which you reside, to the extent those apply (this is consistent with standard terms for apps available globally).
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">14. Severability and Waiver</h3>
                <p className="mb-3">
                  <strong>Severability:</strong> If any provision of these Terms is held to be unlawful, void, or unenforceable, that provision will be deemed severable from the Terms and will not affect the validity and enforceability of the remaining provisions. The rest of the Terms will remain in full effect.
                </p>
                <p>
                  <strong>No Waiver:</strong> If we do not enforce a provision of these Terms on any particular occasion, it does not mean we waive our right to enforce it later. Similarly, any waiver of compliance with these Terms in a particular situation is not a waiver for the future or for any other provision.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">15. Contact Us</h3>
                <p>
                  If you have any questions, concerns, or feedback about these Terms or NextFace AI, please contact us at <span className="text-cyan-400">help.nextfaceapp@gmail.com</span>. We value your input and will do our best to address your inquiry promptly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}