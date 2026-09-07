import type { DisasterAlertEvent } from '../types';

export function sendWhatsAppAlert(alert: DisasterAlertEvent, phoneNumber?: string) {
  const alertMsg = `🚨 *WeatherGPT Emergency Alert*\n\n🔴 *${alert.hazardType.toUpperCase()}*\n• *Location*: ${alert.affectedLocation}\n• *Severity*: ${alert.severity.toUpperCase()}\n• *Valid Until*: ${alert.expirationTime}\n• *Source*: ${alert.source}\n\n⚠️ *Official Guidance*: ${alert.officialGuidance}\n\nView emergency map & details: https://weathergpt.in/alerts`;

  const encodedText = encodeURIComponent(alertMsg);
  const targetPhone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = targetPhone 
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  window.open(whatsappUrl, '_blank');
}

export function sendSMSAlert(alert: DisasterAlertEvent, phoneNumber?: string) {
  const smsBody = `WeatherGPT EMERGENCY ALERT: ${alert.hazardType} in ${alert.affectedLocation}. Severity: ${alert.severity.toUpperCase()}. Guidance: ${alert.officialGuidance}. Source: ${alert.source}`;
  const encodedBody = encodeURIComponent(smsBody);
  const targetPhone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';

  // Standard sms URI scheme supported by Android and iOS
  const smsUrl = targetPhone ? `sms:${targetPhone}?body=${encodedBody}` : `sms:?body=${encodedBody}`;
  window.open(smsUrl, '_blank');
}
