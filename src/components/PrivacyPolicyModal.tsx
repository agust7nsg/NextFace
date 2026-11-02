import React from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-sm rounded-3xl max-w-2xl w-full max-h-[80vh] border border-slate-700/50 relative animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
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

            <p className="text-slate-300 mb-6">
              Thank you for using NextFace AI! This Privacy Policy explains what information we collect from you, how we use and share it, and your rights regarding that information. We are committed to protecting your privacy and handling your personal data in a transparent manner.
            </p>

            <p className="text-slate-300 mb-6">
              By using NextFace AI (the "Service" or "App"), you agree to the collection and use of information as described in this Privacy Policy. If you do not agree with our practices, please do not use the App. We may update this Privacy Policy from time to time, and we will notify you by updating the "Last Updated" date and, if the changes are significant, through an in-app notice or email. We encourage you to review this Policy periodically.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold text-lg mb-3">1. Who We Are</h3>
                <p className="mb-3">
                  NextFace AI is operated by BluePeak Global, LLC, a company based in Wyoming, USA. For the purposes of data protection laws, BluePeak Global, LLC is the "data controller" of your personal information. You can find our contact details at the end of this Policy.
                </p>
                <p>
                  Our Service is intended for users 16 years of age and older. We do not knowingly collect personal information from anyone under 16 (see the Children's Privacy section below for more). The Service is not directed to children.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">2. Information We Collect</h3>
                <p className="mb-3">
                  We collect only the minimum personal data necessary to provide and improve NextFace AI. This includes:
                </p>
                <ul className="space-y-3 pl-4">
                  <li>• <strong>Google Account Information:</strong> When you log in via Google Sign-In, we collect your Google account email address (your Gmail) and a basic profile ID. This is used as your login credential and account identifier. We do not collect your Google password or any other Google profile data beyond your email and basic profile ID needed for authentication.</li>
                  <li>• <strong>Photos You Provide (Biometric Data):</strong> If you choose to use the facial analysis features, you will upload a photo of your face. Facial photos are considered sensitive biometric data under certain laws. We only use the photo to perform the AI analysis and generate your attractiveness score and feedback. We do not use your photos to identify you across other services, and we do not sell your facial data. Photos you upload are stored in your account and retained until you request deletion — we never automatically delete them (see Data Retention below).</li>
                  <li>• <strong>Analysis Results:</strong> The output generated from your photo (scores, ratings, and recommendations) is stored in your account so that you can view your results or track progress over time. These results are tied to your account and are kept private (only visible to you when logged in).</li>
                  <li>• <strong>AI Chat Conversations:</strong> If you use the in-app chat feature, your messages and the AI-generated replies are stored in your account. Your messages are sent to OpenAI to generate responses and are retained so you can revisit your conversations.</li>
                  <li>• <strong>Payment and Purchase Information:</strong> If you purchase a premium subscription, the transaction is processed entirely by Apple's App Store or Google's Play Store (the platform's own billing system). We do not collect, process, or store your credit card number, bank details, or any other payment instrument. We only receive a confirmation of the purchase and the subscription status from the platform so we can enable your premium features.</li>
                  <li>• <strong>Time Zone Information:</strong> We collect your device time zone solely to display accurate, localized subscription pricing in your local currency. We do not collect your precise GPS location or exact physical address.</li>
                  <li>• <strong>Usage Data:</strong> Like most apps, we automatically collect some technical data when you use NextFace AI. This includes device information (e.g., device model, operating system version, unique device identifiers), log information (such as the dates and times you access the app, features you used, error logs, and crash reports), Internet Protocol (IP) address.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">3. How We Use Your Information</h3>
                <p className="mb-3">We use the collected information for the following purposes:</p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>To Provide and Operate the Service:</strong> We use your Google email to create and manage your user account, your uploaded photo to run the AI analysis and generate your facial attractiveness score and suggestions, and your chat messages to generate AI responses.</li>
                  <li>• <strong>To Display Localized Pricing:</strong> We use your time zone to show subscription prices in your local currency.</li>
                  <li>• <strong>To Manage Subscriptions:</strong> We use purchase confirmations from Apple or Google to activate and maintain your premium access.</li>
                  <li>• <strong>To Improve and Personalize the Service:</strong> We may use your usage data and feedback to understand how users interact with NextFace AI and to improve our features, algorithms, and user experience.</li>
                  <li>• <strong>To Communicate with You:</strong> We might use your email address to send you service-related communications such as important updates, changes to this Privacy Policy or Terms of Service, security alerts, or support responses.</li>
                  <li>• <strong>For Customer Support:</strong> If you reach out to us with a question or request, we will use your contact information and any information you provide to respond and resolve your issue.</li>
                  <li>• <strong>To Ensure Legal Compliance and Prevent Misuse:</strong> We may process your information to comply with applicable laws, regulations, and law enforcement requests. We also use data as necessary to enforce our Terms of Service and to prevent fraud, abuse, or other misuse of the App.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">4. How We Share or Disclose Information</h3>
                <p className="mb-3">
                  Your privacy is important to us. We do not sell your personal information to third parties for their own marketing or profit. We also do not share your personal data with third parties except in the following circumstances:
                </p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>Service Providers:</strong> We use certain trusted third-party companies to help us operate NextFace AI, including Google (Google Sign-In), OpenAI (AI analysis and chat responses), Apple and Google (in-app purchase processing), and Supabase (cloud database, authentication, and photo storage).</li>
                  <li>• <strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to a valid legal request.</li>
                  <li>• <strong>Business Transfers:</strong> If BluePeak Global, LLC is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                  <li>• <strong>With Your Consent:</strong> We will only share your personal information with third parties when we have your consent to do so.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">5. Biometric and Sensitive Data</h3>
                <p className="mb-3">
                  Facial photos you upload for analysis may qualify as biometric or sensitive data under laws such as the Illinois BIPA, the California CCPA/CPRA, and the EU/UK GDPR. We want you to understand clearly how this data is handled:
                </p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>Purpose Limitation:</strong> Your facial photo is used solely to generate the analysis you requested (scores, ratings, recommendations). It is not used to identify or verify your identity, and it is not used to build any identification database.</li>
                  <li>• <strong>No Sale or Sharing:</strong> We do not sell your facial or biometric data, and we do not share it for advertising purposes.</li>
                  <li>• <strong>Processing by OpenAI:</strong> To generate your analysis, your photo is sent to OpenAI's servers. OpenAI processes the photo on our behalf as a service provider and is bound by its agreement with us to protect the data.</li>
                  <li>• <strong>Retention:</strong> Your photos are stored in your account and retained until you request deletion. We never automatically delete them. When you request deletion, we remove the photo from our storage and database.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">6. Data Retention</h3>
                <p className="mb-3">
                  We retain your personal data for the following periods:
                </p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>Account Information (Email):</strong> Retained for as long as your account is active. When you delete your account, your email and account data are removed within 30 days.</li>
                  <li>• <strong>Photos:</strong> Stored in your account and retained until you request deletion. We never automatically delete your analysis photos. When you request deletion, they are removed from our storage within 30 days.</li>
                  <li>• <strong>Analysis Results:</strong> Kept in your account so you can revisit your results, until you delete them individually or delete your account.</li>
                  <li>• <strong>Chat Conversations:</strong> Stored in your account until you delete them or delete your account.</li>
                  <li>• <strong>Usage Data:</strong> Retained for up to 24 months for internal analysis and service improvement, typically in aggregate form.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">7. Data Security</h3>
                <p>
                  We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit, secure storage of data with our cloud providers, restricted access controls, and regular updates and security patches. However, please note no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your information.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">8. International Data Transfers</h3>
                <p>
                  NextFace AI is operated from the United States. If you are using the App from outside the U.S., be aware that your information will be transferred to and stored in the United States, and may also be processed by OpenAI and Google in their respective regions. By using NextFace AI, you consent to the transfer of your personal data to the United States and any other jurisdiction necessary for the provision of the services. For users in the European Union, United Kingdom, or Switzerland, such transfers are made in accordance with applicable data transfer mechanisms, including Standard Contractual Clauses where required.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">9. Your Rights and Choices</h3>
                <p className="mb-3">Depending on where you live, you may have the following rights regarding your personal information:</p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>Access and Portability:</strong> You have the right to request a copy of the personal data we hold about you, in a portable format.</li>
                  <li>• <strong>Correction:</strong> If any personal information we have is incorrect or out-of-date, you have the right to request we correct it.</li>
                  <li>• <strong>Deletion (Right to be Forgotten):</strong> You have the right to request deletion of your account, your photos, your analysis results, and your chat conversations. When you request deletion, we remove the relevant data within 30 days.</li>
                  <li>• <strong>Withdrawal of Consent:</strong> In cases where we rely on your consent to process data (including biometric data), you have the right to withdraw that consent at any time.</li>
                  <li>• <strong>Object or Restrict:</strong> You have the right to object to or restrict certain types of processing of your personal data.</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, you can contact us at <span className="text-cyan-400">help.nextfaceapp@gmail.com</span>. We will verify your identity before processing your request and respond within 30 days (or within 45 days where required by law). If we are unable to fulfill your request, we will explain why.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">10. California Privacy Rights (CCPA/CPRA)</h3>
                <p className="mb-3">
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA):
                </p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>Right to Know:</strong> You can request the categories and specific pieces of personal information we have collected about you.</li>
                  <li>• <strong>Right to Delete:</strong> You can request that we delete your personal information.</li>
                  <li>• <strong>Right to Opt-Out of Sale or Sharing:</strong> We do not sell your personal information, and we do not share it for cross-context behavioral advertising. You have the right to opt out of any future sale or sharing by contacting us at <span className="text-cyan-400">help.nextfaceapp@gmail.com</span>.</li>
                  <li>• <strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your privacy rights.</li>
                </ul>
                <p className="mt-3">
                  To submit a request, email <span className="text-cyan-400">help.nextfaceapp@gmail.com</span>. We will verify your identity and respond within 45 days.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">11. GDPR (European Union, United Kingdom, Switzerland)</h3>
                <p className="mb-3">
                  If you are located in the European Union, United Kingdom, or Switzerland, you have rights under the General Data Protection Regulation (GDPR) or the UK GDPR. Our lawful basis for processing your data is:
                </p>
                <ul className="space-y-2 pl-4">
                  <li>• <strong>Consent:</strong> For processing your facial photos (biometric data) and for any optional processing that requires consent. You can withdraw consent at any time.</li>
                  <li>• <strong>Contract:</strong> For processing necessary to provide the service you requested (account creation, analysis, chat, subscriptions).</li>
                  <li>• <strong>Legitimate Interests:</strong> For usage analytics and service improvement, balanced against your rights and expectations.</li>
                </ul>
                <p className="mt-3">
                  You have the right to lodge a complaint with your local data protection authority. Before doing so, we encourage you to contact us first at <span className="text-cyan-400">help.nextfaceapp@gmail.com</span> so we can address your concern.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">12. Children's Privacy</h3>
                <p>
                  NextFace AI is not intended for children under 16 years of age. We do not knowingly collect or solicit personal information from anyone under 16. If you are under 16, please do not use the App or provide any information about yourself to us. In the event we learn that we have collected personal data from a user under 16, we will promptly delete that information from our records.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">13. Third-Party Links and Services</h3>
                <p>
                  NextFace AI may contain links to third-party websites or services that are not operated by us. This Privacy Policy does not apply to information collected by any third-party. We are not responsible for the privacy practices of third-party sites or services. We encourage you to review the privacy policies of any third-party websites or services before providing any information to them.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">14. Changes to this Privacy Policy</h3>
                <p>
                  We may update or modify this Privacy Policy from time to time. If we make material changes to how we handle your personal information, we will provide prominent notice. The Last Updated date at the top indicates when this Policy was last revised. Your continued use of NextFace AI after any changes to this Policy constitutes your acceptance of the updated terms.
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold text-lg mb-3">15. Contact Us</h3>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us at: <span className="text-cyan-400">help.nextfaceapp@gmail.com</span>
                </p>
                <p className="mt-3">
                  By using NextFace AI, you acknowledge that you have read and understood this Privacy Policy and agree to its terms. Thank you for trusting NextFace AI with your photo and data – we are committed to keeping that trust.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}